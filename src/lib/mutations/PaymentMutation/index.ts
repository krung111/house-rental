import { gql } from "@apollo/client";

export const EDIT_PAYMENT = gql`
  mutation EditPayment(
    $filter: paymentsFilter!
    $set: paymentsUpdateInput!
    $atMost: Int!
  ) {
    updatepaymentsCollection(filter: $filter, set: $set, atMost: $atMost) {
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

export const DELETE_PAYMENT = gql`
  mutation DeletePayment($filter: paymentsFilter!, $atMost: Int!) {
    deleteFrompaymentsCollection(filter: $filter, atMost: $atMost) {
      records {
        id
      }
    }
  }
`;
