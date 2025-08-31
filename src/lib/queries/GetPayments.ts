import { gql } from "@apollo/client";

// ✅ Query all payments
export const GET_PAYMENTS = gql`
  query GetPayments($first: Int) {
    paymentsCollection(first: $first) {
      edges {
        node {
          id
          tenant_id
          tenant_name
          amount
          date_from
          date_to
          status
        }
      }
    }
  }
`;
