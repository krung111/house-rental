import { gql } from "@apollo/client";

export const INSERT_APARTMENT = gql`
  mutation InsertApartment($objects: [apartmentsInsertInput!]!) {
    insertIntoapartmentsCollection(objects: $objects) {
      records {
        id
        name
        type
        rent_amount
        status
        address
        __typename
      }
    }
  }
`;
