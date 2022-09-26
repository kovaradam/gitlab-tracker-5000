import { gql } from 'graphql-request';
import { useGqlQuery } from './use-graphql-query';

type UserDetails = { username: string };

const GET_USER = gql`
  query {
    currentUser {
      username
    }
  }
`;

export function useUser(): UserDetails | null {
  const { data } = useGqlQuery<{ currentUser: { username: string } }>(GET_USER, {
    queryKey: ['user'],
  });

  return data?.currentUser ?? null;
}
