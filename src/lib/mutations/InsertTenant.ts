import { gql } from "@apollo/client";

export const INSERT_TENANT = gql`
  mutation InsertTenant($objects: [tenantsInsertInput!]!) {
    insertIntotenantsCollection(objects: $objects) {
      records {
        id
        name
        contact
        email
        emergency_name
        emergency_contact
        occupants
        apartment_id
        apartment_name
        id_document
        address
        rent
        due_date
        created_at
      }
    }
  }
`;
