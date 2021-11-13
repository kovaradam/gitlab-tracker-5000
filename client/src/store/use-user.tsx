import { gql } from 'graphql-request';
import React from 'react';
import { useQuery } from './use-query';

type UserDetails = { username: string };

const UserContext = React.createContext<UserDetails | null>(null);

const GET_USER = gql`
  query {
    currentUser {
      username
    }
  }
`;

export const UserProvider: React.FC = ({ children }) => {
  const [fetchUser, { data }] = useQuery<{ currentUser: { username: string } }>(GET_USER);

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={data?.currentUser ?? null}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser(): UserDetails | null {
  return React.useContext(UserContext);
}
