import { gql } from "@apollo/client";

export const GET_TENANTS = gql`
  query GetTenants($first: Int) {
    tenantsCollection(first: $first, orderBy: { due_date: "AscNullsFirst" }) {
      edges {
        node {
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
          apartment_name
        }
      }
    }
  }
`;
