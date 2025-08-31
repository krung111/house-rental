import { gql } from "@apollo/client";

export const GET_APARTMENTS = gql`
  query GetApartments(
    $first: Int
    $last: Int
    $before: Cursor
    $after: Cursor
    $offset: Int
    $filter: apartmentsFilter
    $orderBy: [apartmentsOrderBy!]
  ) {
    apartmentsCollection(
      first: $first
      last: $last
      before: $before
      after: $after
      offset: $offset
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          id
          name
          type
          rent_amount
          status
          address
          __typename
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;
