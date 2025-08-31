import { gql } from "@apollo/client";

export const GET_EXPENSES = gql`
  query GetExpenses($orderBy: [expensesOrderBy!]) {
    expensesCollection(orderBy: $orderBy) {
      edges {
        node {
          id
          description
          amount
          date
          created_at
        }
      }
    }
  }
`;
