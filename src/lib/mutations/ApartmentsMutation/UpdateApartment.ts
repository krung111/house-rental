import { gql } from "@apollo/client";

export const UPDATE_APARTMENT = gql`
  mutation UpdateApartment(
    $filter: apartmentsFilter!
    $set: apartmentsUpdateInput!
  ) {
    updateapartmentsCollection(filter: $filter, set: $set, atMost: 1) {
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
