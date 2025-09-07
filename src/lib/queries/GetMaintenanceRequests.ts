import { gql } from "@apollo/client";

export const GET_MAINTENANCE_REQUESTS = gql`
  query GetMaintenanceRequests($first: Int, $offset: Int) {
    maintenance_requestsCollection(first: $first, offset: $offset) {
      edges {
        node {
          id
          tenant_id
          description
          cost
          status
          created_at
          __typename
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;
