import { gql } from "@apollo/client";

export const DELETE_TENANT = gql`
  mutation DeleteTenant($filter: tenantsFilter!, $atMost: Int = 1) {
    deleteFromtenantsCollection(filter: $filter, atMost: $atMost) {
      affectedCount
    }
  }
`;
