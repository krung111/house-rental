import { gql } from "@apollo/client";

// ✅ Mutation to update a payment
export const UPDATE_PAYMENT = gql`
  mutation UpdatePayment($filter: paymentsFilter!, $set: paymentsUpdateInput!) {
    updatepaymentsCollection(filter: $filter, set: $set, atMost: 1) {
      records {
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
`;
