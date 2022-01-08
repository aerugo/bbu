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
query FullCode($discource_id: Int!){
    code: code(id: $discource_id) {
      id
      name
      description
      annotations_count
      annotations {
        id
        quote
        post_id
      }
    }
  }
`;

export const ANNOTATION = gql`
query Annotation($discource_id: Int!){
    annotation: annotation(id: $discource_id) {
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