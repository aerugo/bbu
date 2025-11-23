import { getDataStore, DataStore, Code, Post, Topic, Annotation, User, Tag } from "../data/loader";
import { getLogger } from "../logger";

const log = getLogger("Resolvers");

// Filter helpers
type FilterOperator = "eq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in";

interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: unknown;
}

function parseFilter(filter: Record<string, unknown> | undefined): FilterCondition[] {
  if (!filter) return [];

  const conditions: FilterCondition[] = [];

  for (const [key, value] of Object.entries(filter)) {
    // Parse operator suffix
    const operatorMatch = key.match(/^(.+)_(gt|gte|lt|lte|contains|in)$/);
    if (operatorMatch) {
      conditions.push({
        field: operatorMatch[1],
        operator: operatorMatch[2] as FilterOperator,
        value,
      });
    } else {
      conditions.push({
        field: key,
        operator: "eq",
        value,
      });
    }
  }

  return conditions;
}

function applyFilter<T extends Record<string, unknown>>(
  items: T[],
  filter: Record<string, unknown> | undefined
): T[] {
  const conditions = parseFilter(filter);
  if (conditions.length === 0) return items;

  return items.filter((item) => {
    return conditions.every((condition) => {
      const itemValue = item[condition.field];

      switch (condition.operator) {
        case "eq":
          // Special case for array contains (like tags: 23)
          if (Array.isArray(itemValue)) {
            return itemValue.includes(condition.value);
          }
          return itemValue === condition.value;
        case "gt":
          return typeof itemValue === "number" && itemValue > (condition.value as number);
        case "gte":
          return typeof itemValue === "number" && itemValue >= (condition.value as number);
        case "lt":
          return typeof itemValue === "number" && itemValue < (condition.value as number);
        case "lte":
          return typeof itemValue === "number" && itemValue <= (condition.value as number);
        case "contains":
          return typeof itemValue === "string" && itemValue.includes(condition.value as string);
        case "in":
          return Array.isArray(condition.value) && condition.value.includes(itemValue);
        default:
          return true;
      }
    });
  });
}

function applyOrderBy<T extends Record<string, unknown>>(
  items: T[],
  orderBy: string | undefined
): T[] {
  if (!orderBy) return items;

  const match = orderBy.match(/^(.+)_(asc|desc)$/);
  if (!match) return items;

  const [, field, direction] = match;
  const multiplier = direction === "asc" ? 1 : -1;

  return [...items].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];

    if (aVal === bVal) return 0;
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * multiplier;
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * multiplier;
    }

    return 0;
  });
}

function applyPagination<T>(items: T[], first?: number, offset?: number): T[] {
  let result = items;
  if (offset) {
    result = result.slice(offset);
  }
  if (first) {
    result = result.slice(0, first);
  }
  return result;
}

// Helper to get neo4j ID from domain ID
function getNeo4jId(store: DataStore, type: string, domainId: number): string | undefined {
  for (const [neo4jId, mapping] of store.neo4jIdToNodeType.entries()) {
    if (mapping.type === type && mapping.domainId === domainId) {
      return neo4jId;
    }
  }
  return undefined;
}

// Cooccurring codes computation (replicates the Cypher query)
function computeCooccurringCodes(store: DataStore, codeNeo4jId: string, code: Code): unknown[] {
  // Get all codes that cooccur with this code with count > 1
  const cooccurringEntries = store.cooccursCountGt1.get(codeNeo4jId) || [];

  const results: unknown[] = [];

  for (const entry of cooccurringEntries) {
    const cooccurringCode = store.getNodeByNeo4jId(entry.nodeId) as Code | undefined;
    if (!cooccurringCode) continue;

    // Check if this cooccurring code also has cooccurrences with count > 1
    const cooccurringNeighbors = store.cooccursCountGt1.get(entry.nodeId) || [];
    if (cooccurringNeighbors.length === 0) continue;

    // Find annotations that link both codes through the same post
    // this code <- REFERS_TO - annotation - ANNOTATES -> post <- ANNOTATES - cooccurring_annotation - REFERS_TO -> cooccurring_code
    const annotationIds: number[] = [];

    // Get annotations that refer to this code
    const originAnnotationNeo4jIds = store.getIncomingRelations(codeNeo4jId, "REFERS_TO");

    for (const originAnnNeo4jId of originAnnotationNeo4jIds) {
      const originAnnotation = store.getNodeByNeo4jId(originAnnNeo4jId) as Annotation | undefined;
      if (!originAnnotation) continue;

      // Get posts that this annotation annotates
      const postNeo4jIds = store.getOutgoingRelations(originAnnNeo4jId, "ANNOTATES");

      for (const postNeo4jId of postNeo4jIds) {
        // Get annotations that annotate this post
        const postAnnotationNeo4jIds = store.getIncomingRelations(postNeo4jId, "ANNOTATES");

        for (const cooccAnnNeo4jId of postAnnotationNeo4jIds) {
          // Check if this annotation refers to the cooccurring code
          const refersToNeo4jIds = store.getOutgoingRelations(cooccAnnNeo4jId, "REFERS_TO");
          if (refersToNeo4jIds.includes(entry.nodeId)) {
            const cooccAnn = store.getNodeByNeo4jId(cooccAnnNeo4jId) as Annotation | undefined;
            if (cooccAnn && !annotationIds.includes(cooccAnn.id)) {
              annotationIds.push(cooccAnn.id);
            }
          }
        }
      }
    }

    results.push({
      id: parseInt(`${cooccurringCode.id}${code.id}`, 10),
      ccid: cooccurringCode.id,
      name: cooccurringCode.name,
      name_normalized: cooccurringCode.name_normalized,
      description: cooccurringCode.description,
      cooccurrences: entry.count,
      annotations_count: cooccurringCode.annotations_count,
      annotations_ids: annotationIds,
      cooccurrence_degree: cooccurringNeighbors.length,
    });
  }

  return results;
}

export const resolvers = {
  Query: {
    code: (
      _: unknown,
      args: { id?: number; filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();

      // If specific ID is requested, return as array (neo4j-graphql-js behavior)
      if (args.id !== undefined) {
        const code = store.codes.get(args.id);
        return code ? [code] : [];
      }

      // Get all codes
      let codes = Array.from(store.codes.values());

      // Apply filter
      codes = applyFilter(codes, args.filter);

      // Apply ordering
      codes = applyOrderBy(codes, args.orderBy);

      // Apply pagination
      codes = applyPagination(codes, args.first, args.offset);

      return codes;
    },

    post: (
      _: unknown,
      args: { id?: number; filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();

      if (args.id !== undefined) {
        const post = store.posts.get(args.id);
        return post ? [post] : [];
      }

      let posts = Array.from(store.posts.values());
      posts = applyFilter(posts, args.filter);
      posts = applyOrderBy(posts, args.orderBy);
      posts = applyPagination(posts, args.first, args.offset);

      return posts;
    },

    topic: (
      _: unknown,
      args: { id?: number; filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();

      if (args.id !== undefined) {
        const topic = store.topics.get(args.id);
        return topic ? [topic] : [];
      }

      let topics = Array.from(store.topics.values());
      topics = applyFilter(topics, args.filter);
      topics = applyOrderBy(topics, args.orderBy);
      topics = applyPagination(topics, args.first, args.offset);

      return topics;
    },

    annotation: (
      _: unknown,
      args: { id?: number; filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();

      if (args.id !== undefined) {
        const annotation = store.annotations.get(args.id);
        return annotation ? [annotation] : [];
      }

      let annotations = Array.from(store.annotations.values());
      annotations = applyFilter(annotations, args.filter);
      annotations = applyOrderBy(annotations, args.orderBy);
      annotations = applyPagination(annotations, args.first, args.offset);

      return annotations;
    },

    user: (
      _: unknown,
      args: { id?: number; filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();

      if (args.id !== undefined) {
        const user = store.users.get(args.id);
        return user ? [user] : [];
      }

      let users = Array.from(store.users.values());
      users = applyFilter(users, args.filter);
      users = applyOrderBy(users, args.orderBy);
      users = applyPagination(users, args.first, args.offset);

      return users;
    },

    tag: (
      _: unknown,
      args: { id?: number; filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();

      if (args.id !== undefined) {
        const tag = store.tags.get(args.id);
        return tag ? [tag] : [];
      }

      let tags = Array.from(store.tags.values());
      tags = applyFilter(tags, args.filter);
      tags = applyOrderBy(tags, args.orderBy);
      tags = applyPagination(tags, args.first, args.offset);

      return tags;
    },
  },

  // Type resolvers for relationships
  code: {
    cooccurring_codes: (parent: Code) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "code", parent.id);
      if (!neo4jId) return [];

      return computeCooccurringCodes(store, neo4jId, parent);
    },

    annotations: (
      parent: Code,
      args: { filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "code", parent.id);
      if (!neo4jId) return [];

      // code <- REFERS_TO - annotation
      const annotationNeo4jIds = store.getIncomingRelations(neo4jId, "REFERS_TO");
      let annotations = annotationNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Annotation)
        .filter(Boolean);

      annotations = applyFilter(annotations, args.filter);
      annotations = applyOrderBy(annotations, args.orderBy);
      annotations = applyPagination(annotations, args.first, args.offset);

      return annotations;
    },

    has_parent_code: (parent: Code) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "code", parent.id);
      if (!neo4jId) return [];

      const parentCodeNeo4jIds = store.getOutgoingRelations(neo4jId, "HAS_PARENT_CODE");
      return parentCodeNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Code)
        .filter(Boolean);
    },

    cooccurs: (parent: Code) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "code", parent.id);
      if (!neo4jId) return [];

      const cooccurringNeo4jIds = store.getAllRelations(neo4jId, "COOCCURS");
      return cooccurringNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Code)
        .filter(Boolean);
    },

    users: (parent: Code) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "code", parent.id);
      if (!neo4jId) return [];

      const userNeo4jIds = store.getIncomingRelations(neo4jId, "USED_CODE");
      return userNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as User)
        .filter(Boolean);
    },
  },

  cooccurring_code: {
    annotations: (parent: { annotations_ids: number[] }) => {
      const store = getDataStore();
      return (parent.annotations_ids || [])
        .map((id) => store.annotations.get(id))
        .filter(Boolean);
    },
  },

  post: {
    in_topic: (
      parent: Post,
      args: { filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "post", parent.id);
      if (!neo4jId) return [];

      const topicNeo4jIds = store.getOutgoingRelations(neo4jId, "IN_TOPIC");
      let topics = topicNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Topic)
        .filter(Boolean);

      topics = applyFilter(topics, args.filter);
      topics = applyOrderBy(topics, args.orderBy);
      topics = applyPagination(topics, args.first, args.offset);

      return topics;
    },

    annotations: (
      parent: Post,
      args: { filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "post", parent.id);
      if (!neo4jId) return [];

      // post <- ANNOTATES - annotation
      const annotationNeo4jIds = store.getIncomingRelations(neo4jId, "ANNOTATES");
      let annotations = annotationNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Annotation)
        .filter(Boolean);

      annotations = applyFilter(annotations, args.filter);
      annotations = applyOrderBy(annotations, args.orderBy);
      annotations = applyPagination(annotations, args.first, args.offset);

      return annotations;
    },

    is_reply_to: (parent: Post) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "post", parent.id);
      if (!neo4jId) return [];

      const replyToNeo4jIds = store.getOutgoingRelations(neo4jId, "IS_REPLY_TO");
      return replyToNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Post)
        .filter(Boolean);
    },

    contains_quote_from: (parent: Post) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "post", parent.id);
      if (!neo4jId) return [];

      const quoteFromNeo4jIds = store.getOutgoingRelations(neo4jId, "CONTAINS_QUOTE_FROM");
      return quoteFromNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Post)
        .filter(Boolean);
    },

    users: (parent: Post) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "post", parent.id);
      if (!neo4jId) return [];

      const userNeo4jIds = store.getIncomingRelations(neo4jId, "LIKES");
      return userNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as User)
        .filter(Boolean);
    },
  },

  topic: {
    posts: (
      parent: Topic,
      args: { filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "topic", parent.id);
      if (!neo4jId) return [];

      // topic <- IN_TOPIC - post
      const postNeo4jIds = store.getIncomingRelations(neo4jId, "IN_TOPIC");
      let posts = postNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Post)
        .filter(Boolean);

      posts = applyFilter(posts, args.filter);
      posts = applyOrderBy(posts, args.orderBy);
      posts = applyPagination(posts, args.first, args.offset);

      return posts;
    },

    users: (parent: Topic) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "topic", parent.id);
      if (!neo4jId) return [];

      const userNeo4jIds = store.getIncomingRelations(neo4jId, "CREATED");
      return userNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as User)
        .filter(Boolean);
    },
  },

  annotation: {
    refers_to: (
      parent: Annotation,
      args: { filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "annotation", parent.id);
      if (!neo4jId) return [];

      // annotation - REFERS_TO -> code
      const codeNeo4jIds = store.getOutgoingRelations(neo4jId, "REFERS_TO");
      let codes = codeNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Code)
        .filter(Boolean);

      codes = applyFilter(codes, args.filter);
      codes = applyOrderBy(codes, args.orderBy);
      codes = applyPagination(codes, args.first, args.offset);

      return codes;
    },

    annotates: (
      parent: Annotation,
      args: { filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "annotation", parent.id);
      if (!neo4jId) return [];

      // annotation - ANNOTATES -> post
      const postNeo4jIds = store.getOutgoingRelations(neo4jId, "ANNOTATES");
      let posts = postNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Post)
        .filter(Boolean);

      posts = applyFilter(posts, args.filter);
      posts = applyOrderBy(posts, args.orderBy);
      posts = applyPagination(posts, args.first, args.offset);

      return posts;
    },

    overlaps: (
      parent: Annotation,
      args: { filter?: Record<string, unknown>; orderBy?: string; first?: number; offset?: number }
    ) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "annotation", parent.id);
      if (!neo4jId) return [];

      // annotation - OVERLAPS -> annotation (and reverse)
      const overlapNeo4jIds = store.getAllRelations(neo4jId, "OVERLAPS");
      let overlaps = overlapNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Annotation)
        .filter(Boolean);

      overlaps = applyFilter(overlaps, args.filter);
      overlaps = applyOrderBy(overlaps, args.orderBy);
      overlaps = applyPagination(overlaps, args.first, args.offset);

      return overlaps;
    },
  },

  user: {
    created: (parent: User) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "user", parent.id);
      if (!neo4jId) return [];

      const topicNeo4jIds = store.getOutgoingRelations(neo4jId, "CREATED");
      return topicNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Topic)
        .filter(Boolean);
    },

    used_code: (parent: User) => {
      const store = getDataStore();
      const neo4jId = getNeo4jId(store, "user", parent.id);
      if (!neo4jId) return [];

      const codeNeo4jIds = store.getOutgoingRelations(neo4jId, "USED_CODE");
      return codeNeo4jIds
        .map((id) => store.getNodeByNeo4jId(id) as Code)
        .filter(Boolean);
    },
  },
};
