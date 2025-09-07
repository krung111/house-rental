import { gql } from "@apollo/client";

// ✅ Mutation to update a payment
export const DELETE_MAINTENANCE_REQUEST = gql`
  mutation DeleteMaintenanceRequest($id: UUID!) {
    deleteFrommaintenance_requestsCollection(
      filter: { id: { eq: $id } }
      atMost: 1
    ) {
      affectedCount
      records {
        id
        tenant_id
        description
        cost
        status
        created_at
        __typename
      }
    }
  }
`;

export const INSERT_MAINTENANCE_REQUEST = gql`
  mutation InsertMaintenanceRequest(
    $objects: [maintenance_requestsInsertInput!]!
  ) {
    insertIntomaintenance_requestsCollection(objects: $objects) {
      records {
        id
        tenant_id
        description
        cost
        status
        created_at
        __typename
      }
    }
  }
`;

export const UPDATE_MAINTENANCE_REQUEST = gql`
  mutation UpdateMaintenanceRequest(
    $id: UUID!
    $set: maintenance_requestsUpdateInput!
  ) {
    updatemaintenance_requestsCollection(
      set: $set
      filter: { id: { eq: $id } }
      atMost: 1
    ) {
      records {
        id
        tenant_id
        description
        cost
        status
        created_at
      }
    }
  }
`;
