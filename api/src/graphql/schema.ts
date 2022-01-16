import gql from "graphql-tag";
import { getLogger } from "../logger";

// logger
const log = getLogger("GraphQl");

export const typeDefs = gql`
  #
  # Define custom Graphql types
  #
  scalar JSONObject

  #
  # Define GraphQl / Neo4j model
  #

  type user {
    _id: Long!
    id: Int!
    email: String!
    username: String!
    created: [topic] @relation(name: "CREATED", direction: OUT)
    used_code: [code] @relation(name: "USED_CODE", direction: OUT)
    USED_CODE_rel: [USED_CODE]
  }

  type topic {
    _id: Long!
    created_at: String!
    id: Int!
    title: String!
    updated_at: String!
    user_id: Int!
    users: [user] @relation(name: "CREATED", direction: IN)
    posts: [post] @relation(name: "IN_TOPIC", direction: IN)
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
    in_topic: [topic] @relation(name: "IN_TOPIC", direction: OUT)
    is_reply_to: [post] @relation(name: "IS_REPLY_TO", direction: OUT)
    contains_quote_from: [post] @relation(name: "CONTAINS_QUOTE_FROM", direction: OUT)
    users: [user] @relation(name: "LIKES", direction: IN)
    annotations: [annotation] @relation(name: "ANNOTATES", direction: IN)
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
    has_parent_code: [code] @relation(name: "HAS_PARENT_CODE", direction: OUT)
    cooccurs: [code] @relation(name: "COOCCURS", direction: OUT)
    COOCCURS_rel: [COOCCURS]
    annotations: [annotation] @relation(name: "REFERS_TO", direction: IN)
    users: [user] @relation(name: "USED_CODE", direction: IN)
    cooccurring_codes: [cooccurring_code]
      @cypher(
        statement: """
          MATCH p1=(this)-[r:COOCCURS]-(cooccurring_code:code)
          WHERE r.count > 1
          MATCH p2=(cooccurring_code)-[r2:COOCCURS]-(c3:code)
          WHERE r2.count > 1
          WITH DISTINCT this, cooccurring_code, r, count(DISTINCT r2) as cooccurring_neighbors
          MATCH (this)<-[:REFERS_TO]-(origin_annotations:annotation)-[:ANNOTATES]->(p:post)<-[:ANNOTATES]-(cooccurring_annotation:annotation)-[:REFERS_TO]->(cooccurring_code)
          WITH DISTINCT this, cooccurring_code, r, cooccurring_annotation, cooccurring_neighbors
          WITH {
              id: toInteger(toString(cooccurring_code.id) + toString(this.id)),
              ccid: cooccurring_code.id,
              name: cooccurring_code.name,
              name_normalized: cooccurring_code.name_normalized,
              description: cooccurring_code.description, 
              cooccurrences: r.count,
              annotations_count: cooccurring_code.annotations_count,
              annotations_ids: COLLECT(cooccurring_annotation.id),
              cooccurrence_degree: cooccurring_neighbors
              } AS cooccurring_codes
          RETURN cooccurring_codes
        """
      )
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
      @cypher(
        statement: """
          MATCH (a:annotation) 
          WHERE a.id IN this.annotations_ids
          RETURN a
        """
      )
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
    refers_to: [code] @relation(name: "REFERS_TO", direction: OUT)
    annotates: [post] @relation(name: "ANNOTATES", direction: OUT)
    overlaps: [annotation] @relation(name: "OVERLAPS", direction: OUT)
  }

  type COOCCURS @relation(name: "COOCCURS") {
    from: code!
    to: code!
    corpus: String!
    count: Int!
  }

  type USED_CODE @relation(name: "USED_CODE") {
    from: user!
    to: code!
    count: Int!
  }

`;

export const gqlConfig = {
  mutation: false,
};
