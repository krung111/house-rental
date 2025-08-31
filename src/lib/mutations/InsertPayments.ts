import { gql } from "@apollo/client";

export const INSERT_PAYMENT = gql`
  mutation InsertPayment($objects: [paymentsInsertInput!]!) {
    insertIntopaymentsCollection(objects: $objects) {
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
