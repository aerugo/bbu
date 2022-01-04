import { gql } from "@apollo/client";

export const CODES = gql`
query {
    code(filter: { annotations_count_gt: 1 }, orderBy: name_normalized_asc) {
      discourse_id
      name
      name_normalized
      description
      annotations_count
    }
  }  
`;

export const FULLCODE = gql`
query FullCode($discource_id: Int!){
    code: code(discourse_id: $discource_id) {
      discourse_id
      name
      description
      annotations_count
      annotations {
        discourse_id
        quote
        post_id
      }
    }
  }
`;

export const ANNOTATION = gql`
query Annotation($discource_id: Int!){
    annotation: annotation(discourse_id: $discource_id) {
      discourse_id
      quote
      annotates {
        discourse_id
        in_topic {
          discourse_id
          title
        }
      }
      refers_to {
        discourse_id
        name
        annotations_count
    		cooccurring_codes {
          discourse_id
          name
        }
      }
      overlaps {
        discourse_id
          refers_to {
            discourse_id
            name
            annotations_count
            cooccurring_codes {
              discourse_id
              name
            }
          }
      }
    }
  }
`;

export const POST = gql`
query Post($discourse_id: Int!){
    post: post(discourse_id: $discourse_id) {
      discourse_id
      raw
      topic_id
      in_topic {
        discourse_id
        title
        posts(orderBy: created_at_asc) {
          discourse_id
          raw
        }
      }
      annotations {
        discourse_id
        post_id
        quote
        refers_to {
          discourse_id
          name
          annotations_count
          cooccurring_codes {
            discourse_id
            name
          }
        }
      }
    }
  }
  
`

export const TOPIC = gql`
query Topic($discourse_id: Int!) {
    topic(discourse_id: $discourse_id) {
      title,
      posts (orderBy: created_at_asc) {
        discourse_id
        raw
        annotations {
          refers_to {
            annotations_count
            name
            discourse_id
          }
        }
      }
    }
  }
`;