import { gql } from "@apollo/client";

export const UPDATE_TENANT = gql`
  mutation UpdateTenant($filter: tenantsFilterInput!, $set: tenantsSetInput!) {
    updatetenantsCollection(filter: $filter, set: $set, atMost: 1) {
      records {
        id
        name
        contact
        email
        occupants
        address
        rent
        due_date
        emergency_name
        emergency_contact
        apartment_id
      }
    }
  }
`;
