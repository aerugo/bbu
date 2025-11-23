import * as fs from "fs";
import * as readline from "readline";
import { config } from "../config";
import { getLogger } from "../logger";

const log = getLogger("DataLoader");

// Node types
export interface NodeBase {
  _neo4j_id: string;
  _id: number;
  [key: string]: unknown;
}

export interface User extends NodeBase {
  id: number;
  email: string;
  username: string;
  platform: string;
}

export interface Topic extends NodeBase {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  platform: string;
  tags: number[];
}

export interface Post extends NodeBase {
  id: number;
  raw: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  post_number: number;
  quote_count: number;
  reply_count: number;
  topic_id: number;
  user_id: number;
  platform: string;
  like_count?: number;
  reads?: number;
  score?: number;
  word_count?: number;
}

export interface Code extends NodeBase {
  id: number;
  name: string;
  name_normalized: string;
  description?: string;
  ancestry?: string;
  annotations_count: number;
  creator_id: number;
  created_at: string;
  updated_at: string;
  platform: string;
}

export interface Annotation extends NodeBase {
  id: number;
  text?: string;
  quote?: string;
  code_id?: number;
  post_id: number;
  topic_id: number;
  creator_id: number;
  type: string;
  created_at: string;
  updated_at: string;
  start?: number;
  end?: number;
  start_offset?: number;
  end_offset?: number;
  platform: string;
}

export interface Tag extends NodeBase {
  id: number;
  name: string;
  topic_count?: number;
  created_at?: string;
  updated_at?: string;
  platform: string;
}

export interface Language extends NodeBase {
  id: number;
  name: string;
  locale: string;
  platform: string;
}

export interface Codename extends NodeBase {
  id: number;
  name: string;
  name_normalized: string;
  code_id: number;
  language_id: number;
  created_at: string;
  platform: string;
}

export interface Platform extends NodeBase {
  name: string;
  url: string;
}

// Relationship types
export interface Relationship {
  id: string;
  label: string;
  startNodeId: string;
  endNodeId: string;
  properties: Record<string, unknown>;
}

export interface CooccursRelationship extends Relationship {
  properties: {
    method: string;
    count: number;
    corpus: string;
  };
}

export interface UsedCodeRelationship extends Relationship {
  properties: {
    count: number;
  };
}

// Data store
export class DataStore {
  // Node collections indexed by neo4j internal id
  private nodeById: Map<string, NodeBase> = new Map();

  // Node collections indexed by domain id (the actual id property)
  users: Map<number, User> = new Map();
  topics: Map<number, Topic> = new Map();
  posts: Map<number, Post> = new Map();
  codes: Map<number, Code> = new Map();
  annotations: Map<number, Annotation> = new Map();
  tags: Map<number, Tag> = new Map();
  languages: Map<number, Language> = new Map();
  codenames: Map<number, Codename> = new Map();
  platforms: Map<string, Platform> = new Map();

  // Relationships indexed by type
  relationships: Map<string, Relationship[]> = new Map();

  // Relationship indexes for efficient lookups
  // Format: relationshipType -> startNodeId -> endNodeId[]
  outgoingRelations: Map<string, Map<string, string[]>> = new Map();
  // Format: relationshipType -> endNodeId -> startNodeId[]
  incomingRelations: Map<string, Map<string, string[]>> = new Map();

  // Cooccurs with count > 1 index for efficiency
  cooccursCountGt1: Map<string, Array<{ nodeId: string; count: number }>> = new Map();

  // Neo4j ID to domain ID mapping
  neo4jIdToNodeType: Map<string, { type: string; domainId: number | string }> = new Map();

  getNodeByNeo4jId(neo4jId: string): NodeBase | undefined {
    return this.nodeById.get(neo4jId);
  }

  addNode(neo4jId: string, labels: string[], properties: Record<string, unknown>): void {
    const label = labels[0]?.toLowerCase();
    const nodeBase: NodeBase = {
      _neo4j_id: neo4jId,
      _id: parseInt(neo4jId, 10),
      ...properties,
    };

    this.nodeById.set(neo4jId, nodeBase);

    switch (label) {
      case "user":
        this.users.set(properties.id as number, nodeBase as User);
        this.neo4jIdToNodeType.set(neo4jId, { type: "user", domainId: properties.id as number });
        break;
      case "topic":
        this.topics.set(properties.id as number, nodeBase as Topic);
        this.neo4jIdToNodeType.set(neo4jId, { type: "topic", domainId: properties.id as number });
        break;
      case "post":
        this.posts.set(properties.id as number, nodeBase as Post);
        this.neo4jIdToNodeType.set(neo4jId, { type: "post", domainId: properties.id as number });
        break;
      case "code":
        this.codes.set(properties.id as number, nodeBase as Code);
        this.neo4jIdToNodeType.set(neo4jId, { type: "code", domainId: properties.id as number });
        break;
      case "annotation":
        this.annotations.set(properties.id as number, nodeBase as Annotation);
        this.neo4jIdToNodeType.set(neo4jId, { type: "annotation", domainId: properties.id as number });
        break;
      case "tag":
        this.tags.set(properties.id as number, nodeBase as Tag);
        this.neo4jIdToNodeType.set(neo4jId, { type: "tag", domainId: properties.id as number });
        break;
      case "language":
        this.languages.set(properties.id as number, nodeBase as Language);
        this.neo4jIdToNodeType.set(neo4jId, { type: "language", domainId: properties.id as number });
        break;
      case "codename":
        this.codenames.set(properties.id as number, nodeBase as Codename);
        this.neo4jIdToNodeType.set(neo4jId, { type: "codename", domainId: properties.id as number });
        break;
      case "platform":
        this.platforms.set(properties.name as string, nodeBase as Platform);
        this.neo4jIdToNodeType.set(neo4jId, { type: "platform", domainId: properties.name as string });
        break;
    }
  }

  addRelationship(
    id: string,
    label: string,
    startNodeId: string,
    endNodeId: string,
    properties: Record<string, unknown>
  ): void {
    const relationship: Relationship = {
      id,
      label,
      startNodeId,
      endNodeId,
      properties,
    };

    // Add to relationships list
    if (!this.relationships.has(label)) {
      this.relationships.set(label, []);
    }
    this.relationships.get(label)!.push(relationship);

    // Add to outgoing relations index
    if (!this.outgoingRelations.has(label)) {
      this.outgoingRelations.set(label, new Map());
    }
    const outgoing = this.outgoingRelations.get(label)!;
    if (!outgoing.has(startNodeId)) {
      outgoing.set(startNodeId, []);
    }
    outgoing.get(startNodeId)!.push(endNodeId);

    // Add to incoming relations index
    if (!this.incomingRelations.has(label)) {
      this.incomingRelations.set(label, new Map());
    }
    const incoming = this.incomingRelations.get(label)!;
    if (!incoming.has(endNodeId)) {
      incoming.set(endNodeId, []);
    }
    incoming.get(endNodeId)!.push(startNodeId);

    // Build cooccurs index for count > 1
    if (label === "COOCCURS" && (properties.count as number) > 1) {
      if (!this.cooccursCountGt1.has(startNodeId)) {
        this.cooccursCountGt1.set(startNodeId, []);
      }
      this.cooccursCountGt1.get(startNodeId)!.push({
        nodeId: endNodeId,
        count: properties.count as number,
      });

      // COOCCURS is bidirectional, so add reverse
      if (!this.cooccursCountGt1.has(endNodeId)) {
        this.cooccursCountGt1.set(endNodeId, []);
      }
      this.cooccursCountGt1.get(endNodeId)!.push({
        nodeId: startNodeId,
        count: properties.count as number,
      });
    }
  }

  // Helper methods for relationship traversal
  getOutgoingRelations(nodeId: string, relationshipType: string): string[] {
    return this.outgoingRelations.get(relationshipType)?.get(nodeId) || [];
  }

  getIncomingRelations(nodeId: string, relationshipType: string): string[] {
    return this.incomingRelations.get(relationshipType)?.get(nodeId) || [];
  }

  // Get all relations (both directions) for undirected relationships like COOCCURS
  getAllRelations(nodeId: string, relationshipType: string): string[] {
    const outgoing = this.getOutgoingRelations(nodeId, relationshipType);
    const incoming = this.getIncomingRelations(nodeId, relationshipType);
    return [...new Set([...outgoing, ...incoming])];
  }

  getRelationshipProperties(
    relationshipType: string,
    startNodeId: string,
    endNodeId: string
  ): Record<string, unknown> | undefined {
    const rels = this.relationships.get(relationshipType);
    if (!rels) return undefined;

    // Check both directions for undirected relationships
    const rel = rels.find(
      (r) =>
        (r.startNodeId === startNodeId && r.endNodeId === endNodeId) ||
        (r.startNodeId === endNodeId && r.endNodeId === startNodeId)
    );
    return rel?.properties;
  }
}

// Global data store instance
let dataStore: DataStore | null = null;

export async function loadData(filePath?: string): Promise<DataStore> {
  if (dataStore) {
    return dataStore;
  }

  const resolvedPath = filePath || config.data_file_path;
  log.info(`Loading data from ${resolvedPath}`);

  dataStore = new DataStore();

  const fileStream = fs.createReadStream(resolvedPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let nodeCount = 0;
  let relationshipCount = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const record = JSON.parse(line);

      if (record.type === "node") {
        dataStore.addNode(record.id, record.labels, record.properties);
        nodeCount++;
      } else if (record.type === "relationship") {
        dataStore.addRelationship(
          record.id,
          record.label,
          record.start.id,
          record.end.id,
          record.properties || {}
        );
        relationshipCount++;
      }
    } catch (e) {
      log.error(`Failed to parse line: ${line.substring(0, 100)}...`);
    }
  }

  log.info(`Loaded ${nodeCount} nodes and ${relationshipCount} relationships`);
  log.info(`Codes: ${dataStore.codes.size}, Posts: ${dataStore.posts.size}, Annotations: ${dataStore.annotations.size}`);

  return dataStore;
}

export function getDataStore(): DataStore {
  if (!dataStore) {
    throw new Error("Data store not initialized. Call loadData() first.");
  }
  return dataStore;
}

// For testing - reset the data store
export function resetDataStore(): void {
  dataStore = null;
}
