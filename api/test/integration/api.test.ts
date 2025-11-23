import { expect } from "chai";
import fetch from "node-fetch";

const LIVE_API_URL = "https://api.babelbetween.us/graphql";
const LOCAL_API_URL = "http://localhost:4000/graphql";

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

async function queryGraphQL<T>(
  url: string,
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json() as Promise<GraphQLResponse<T>>;
}

describe("API Comparison Tests", function () {
  this.timeout(30000); // 30 second timeout for API calls

  describe("CODES query", () => {
    const CODES_QUERY = `
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

    it("should return matching codes from local and live API", async () => {
      const [liveResult, localResult] = await Promise.all([
        queryGraphQL(LIVE_API_URL, CODES_QUERY),
        queryGraphQL(LOCAL_API_URL, CODES_QUERY),
      ]);

      expect(liveResult.errors).to.be.undefined;
      expect(localResult.errors).to.be.undefined;
      expect(localResult.data).to.deep.equal(liveResult.data);
    });
  });

  describe("FULLCODE query", () => {
    const FULLCODE_QUERY = `
      query FullCode($id: Int!) {
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

    it("should return matching code details for id=1", async () => {
      const variables = { id: 1 };
      const [liveResult, localResult] = await Promise.all([
        queryGraphQL(LIVE_API_URL, FULLCODE_QUERY, variables),
        queryGraphQL(LOCAL_API_URL, FULLCODE_QUERY, variables),
      ]);

      expect(liveResult.errors).to.be.undefined;
      expect(localResult.errors).to.be.undefined;
      expect(localResult.data).to.deep.equal(liveResult.data);
    });

    it("should return matching code details for id=100", async () => {
      const variables = { id: 100 };
      const [liveResult, localResult] = await Promise.all([
        queryGraphQL(LIVE_API_URL, FULLCODE_QUERY, variables),
        queryGraphQL(LOCAL_API_URL, FULLCODE_QUERY, variables),
      ]);

      expect(liveResult.errors).to.be.undefined;
      expect(localResult.errors).to.be.undefined;
      expect(localResult.data).to.deep.equal(liveResult.data);
    });
  });

  describe("ANNOTATION query", () => {
    const ANNOTATION_QUERY = `
      query Annotation($id: Int!) {
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

    it("should return matching annotation for id=1", async () => {
      const variables = { id: 1 };
      const [liveResult, localResult] = await Promise.all([
        queryGraphQL(LIVE_API_URL, ANNOTATION_QUERY, variables),
        queryGraphQL(LOCAL_API_URL, ANNOTATION_QUERY, variables),
      ]);

      expect(liveResult.errors).to.be.undefined;
      expect(localResult.errors).to.be.undefined;
      expect(localResult.data).to.deep.equal(liveResult.data);
    });
  });

  describe("POST query", () => {
    const POST_QUERY = `
      query Post($id: Int!) {
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
    `;

    it("should return matching post for id=2707", async () => {
      const variables = { id: 2707 };
      const [liveResult, localResult] = await Promise.all([
        queryGraphQL(LIVE_API_URL, POST_QUERY, variables),
        queryGraphQL(LOCAL_API_URL, POST_QUERY, variables),
      ]);

      expect(liveResult.errors).to.be.undefined;
      expect(localResult.errors).to.be.undefined;
      expect(localResult.data).to.deep.equal(liveResult.data);
    });
  });

  describe("TOPIC query", () => {
    const TOPIC_QUERY = `
      query Topic($id: Int!) {
        topic(id: $id) {
          title
          posts(orderBy: created_at_asc) {
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

    it("should return matching topic for id=1027", async () => {
      const variables = { id: 1027 };
      const [liveResult, localResult] = await Promise.all([
        queryGraphQL(LIVE_API_URL, TOPIC_QUERY, variables),
        queryGraphQL(LOCAL_API_URL, TOPIC_QUERY, variables),
      ]);

      expect(liveResult.errors).to.be.undefined;
      expect(localResult.errors).to.be.undefined;
      expect(localResult.data).to.deep.equal(liveResult.data);
    });
  });

  describe("TOPICS query (with filter)", () => {
    const TOPICS_QUERY = `
      query {
        topic(filter: {tags: 23}, orderBy: created_at_asc) {
          id
          title
          created_at
          tags
          posts(filter: {post_number: 1}) {
            raw
          }
        }
      }
    `;

    it("should return matching topics filtered by tag 23", async () => {
      const [liveResult, localResult] = await Promise.all([
        queryGraphQL(LIVE_API_URL, TOPICS_QUERY),
        queryGraphQL(LOCAL_API_URL, TOPICS_QUERY),
      ]);

      expect(liveResult.errors).to.be.undefined;
      expect(localResult.errors).to.be.undefined;
      expect(localResult.data).to.deep.equal(liveResult.data);
    });
  });
});

// Standalone test to capture live API responses for reference
describe("Capture Live API Responses", function () {
  this.timeout(30000);

  it("should fetch codes from live API", async () => {
    const result = await queryGraphQL(LIVE_API_URL, `
      query {
        code(filter: { annotations_count_gt: 1 }, orderBy: name_normalized_asc, first: 5) {
          id
          name
          name_normalized
          annotations_count
        }
      }
    `);
    console.log("Live API codes sample:", JSON.stringify(result.data, null, 2));
    expect(result.errors).to.be.undefined;
  });

  it("should fetch a single code with cooccurrences from live API", async () => {
    const result = await queryGraphQL(LIVE_API_URL, `
      query {
        code(id: 1) {
          id
          name
          annotations_count
          cooccurring_codes {
            ccid
            name
            cooccurrences
          }
        }
      }
    `);
    console.log("Live API code with cooccurrences:", JSON.stringify(result.data, null, 2));
    expect(result.errors).to.be.undefined;
  });
});
