import { gql } from "@apollo/client";

export const UPDATE_EXPENSE = gql`
  mutation UpdateExpense($id: UUID!, $set: expensesUpdateInput!) {
    updateexpensesCollection(filter: { id: { eq: $id } }, set: $set) {
      records {
        id
        description
        amount
        date
      }
    }
  }
`;
