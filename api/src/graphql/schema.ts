import gql from "graphql-tag";
import { getLogger } from "../logger";

// logger
const log = getLogger("GraphQl");

export const typeDefs = gql`
  #
  # Define custom Graphql types
  #
  scalar JSONObject
  scalar Long

  #
  # Filter input types
  #
  input _CodeFilter {
    id: Int
    id_in: [Int]
    name: String
    name_contains: String
    name_normalized: String
    annotations_count: Int
    annotations_count_gt: Int
    annotations_count_gte: Int
    annotations_count_lt: Int
    annotations_count_lte: Int
  }

  input _PostFilter {
    id: Int
    id_in: [Int]
    topic_id: Int
    post_number: Int
    user_id: Int
  }

  input _TopicFilter {
    id: Int
    id_in: [Int]
    tags: Int
    user_id: Int
  }

  input _AnnotationFilter {
    id: Int
    id_in: [Int]
    post_id: Int
    topic_id: Int
    code_id: Int
  }

  input _UserFilter {
    id: Int
    id_in: [Int]
    username: String
  }

  input _TagFilter {
    id: Int
    id_in: [Int]
    name: String
  }

  #
  # Ordering enums
  #
  enum _CodeOrdering {
    id_asc
    id_desc
    name_asc
    name_desc
    name_normalized_asc
    name_normalized_desc
    annotations_count_asc
    annotations_count_desc
    created_at_asc
    created_at_desc
  }

  enum _PostOrdering {
    id_asc
    id_desc
    created_at_asc
    created_at_desc
    post_number_asc
    post_number_desc
  }

  enum _TopicOrdering {
    id_asc
    id_desc
    created_at_asc
    created_at_desc
    title_asc
    title_desc
  }

  enum _AnnotationOrdering {
    id_asc
    id_desc
    created_at_asc
    created_at_desc
  }

  enum _UserOrdering {
    id_asc
    id_desc
    username_asc
    username_desc
  }

  enum _TagOrdering {
    id_asc
    id_desc
    name_asc
    name_desc
  }

  #
  # Define GraphQL model
  #

  type user {
    _id: Long!
    id: Int!
    email: String!
    username: String!
    created: [topic]
    used_code: [code]
    USED_CODE_rel: [USED_CODE]
  }

  type topic {
    _id: Long!
    created_at: String!
    id: Int!
    title: String!
    updated_at: String!
    user_id: Int!
    users: [user]
    posts(filter: _PostFilter, orderBy: _PostOrdering, first: Int, offset: Int): [post]
    tags: [Int]
  }

  type post {
    _id: Long!
    created_at: String!
    deleted_at: String
    id: Int!
    post_number: Int!
    quote_count: Int!
    raw: String!
    reply_count: Int!
    topic_id: Int!
    updated_at: String!
    user_id: Int!
    in_topic(filter: _TopicFilter, orderBy: _TopicOrdering, first: Int, offset: Int): [topic]
    is_reply_to: [post]
    contains_quote_from: [post]
    users: [user]
    annotations(filter: _AnnotationFilter, orderBy: _AnnotationOrdering, first: Int, offset: Int): [annotation]
  }

  type code {
    _id: Long!
    ancestry: String
    annotations_count: Int!
    created_at: String!
    creator_id: Int!
    description: String
    id: Int!
    name: String
    name_normalized: String
    updated_at: String!
    has_parent_code: [code]
    cooccurs: [code]
    COOCCURS_rel: [COOCCURS]
    annotations(filter: _AnnotationFilter, orderBy: _AnnotationOrdering, first: Int, offset: Int): [annotation]
    users: [user]
    cooccurring_codes: [cooccurring_code]
  }

  type cooccurring_code {
    id: Int
    ccid: Int
    name: String
    name_normalized: String
    annotations_count: Int
    description: String
    cooccurrences: Int
    annotations_ids: [Int]
    cooccurrence_degree: Int
    annotations: [annotation]
  }

  type annotation {
    _id: Long!
    code_id: Int
    created_at: String!
    creator_id: Int!
    id: Int!
    post_id: Int!
    quote: String
    text: String
    topic_id: Int!
    type: String!
    updated_at: String!
    refers_to(filter: _CodeFilter, orderBy: _CodeOrdering, first: Int, offset: Int): [code]
    annotates(filter: _PostFilter, orderBy: _PostOrdering, first: Int, offset: Int): [post]
    overlaps(filter: _AnnotationFilter, orderBy: _AnnotationOrdering, first: Int, offset: Int): [annotation]
  }

  type tag {
    _id: Long!
    id: Int!
    name: String!
    topic_count: Int
    created_at: String
    updated_at: String
  }

  type COOCCURS {
    from: code!
    to: code!
    corpus: String!
    count: Int!
  }

  type USED_CODE {
    from: user!
    to: code!
    count: Int!
  }

  #
  # Query type
  #
  type Query {
    code(id: Int, filter: _CodeFilter, orderBy: _CodeOrdering, first: Int, offset: Int): [code]
    post(id: Int, filter: _PostFilter, orderBy: _PostOrdering, first: Int, offset: Int): [post]
    topic(id: Int, filter: _TopicFilter, orderBy: _TopicOrdering, first: Int, offset: Int): [topic]
    annotation(id: Int, filter: _AnnotationFilter, orderBy: _AnnotationOrdering, first: Int, offset: Int): [annotation]
    user(id: Int, filter: _UserFilter, orderBy: _UserOrdering, first: Int, offset: Int): [user]
    tag(id: Int, filter: _TagFilter, orderBy: _TagOrdering, first: Int, offset: Int): [tag]
  }
`;

export const gqlConfig = {
  mutation: false,
};
