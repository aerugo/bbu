import { gql } from "@apollo/client";

export const CODES = gql`
query {
    code(filter: { annotations_count_gt: 1 }, orderBy: name_normalized_asc) {
      id
      name
      name_normalized
      description
      annotations_count
    }
  }  
`;

export const FULLCODE = gql`
query FullCode($id: Int!){
    code: code(id: $id) {
      id
      name
      description
      annotations_count
      cooccurring_codes {
        id
        ccid
        name
        cooccurrences
      }
      annotations {
        id
        quote
        post_id
      }
    }
  }
`;

export const ANNOTATION = gql`
query Annotation($id: Int!){
    annotation: annotation(id: $id) {
      id
      quote
      annotates {
        id
        in_topic {
          id
          title
        }
      }
      refers_to {
        id
        name
        annotations_count
    		cooccurring_codes {
          id
          ccid
          name
        }
      }
      overlaps {
        id
          refers_to {
            id
            name
            annotations_count
            cooccurring_codes {
              id
              ccid
              name
            }
          }
      }
    }
  }
`;

export const POST = gql`
query Post($id: Int!){
    post: post(id: $id) {
      id
      raw
      topic_id
      in_topic {
        id
        title
        posts(orderBy: created_at_asc) {
          id
          raw
        }
      }
      annotations {
        id
        post_id
        quote
        refers_to {
          id
          name
          annotations_count
          cooccurring_codes {
            id
            ccid
            name
          }
        }
      }
    }
  }
  
`

export const TOPIC = gql`
query Topic($id: Int!) {
    topic(id: $id) {
      title,
      posts (orderBy: created_at_asc) {
        id
        raw
        annotations {
          refers_to {
            annotations_count
            name
            id
            annotations {
              id
              quote
              post_id
            }
          }
        }
      }
    }
  }
`;

export const TOPICS = gql`
query {
  topic(filter: {tags: 23}, orderBy: created_at_asc) {
    id
    title
    created_at
    tags
    posts(filter: {post_number: 1 }) {
      raw
    }
  }
}
`

export const ALL_CODES_WITH_COOCCURRENCES = gql`
query {
  code(filter: { annotations_count_gt: 1 }, orderBy: name_normalized_asc) {
    id
    name
    name_normalized
    annotations_count
    cooccurring_codes {
      id
      ccid
      name
      cooccurrences
    }
  }
}
`