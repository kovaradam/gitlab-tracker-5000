import React from 'react';
import { useQueryWithCursor } from '../../store/use-query';
import { GetTimelogsResponse, GET_TIMELOGS } from './queries';
import { mergeProjectData } from './utils';

type HookReturnType = ReturnType<typeof useIssues>;

const IssuesContext = React.createContext<HookReturnType>(
  null as unknown as HookReturnType,
);

const IssuesProvider: React.FC = ({ children }) => {
  const value = useQueryWithCursor<GetTimelogsResponse>(GET_TIMELOGS, mergeProjectData);
  return <IssuesContext.Provider value={value}>{children}</IssuesContext.Provider>;
};

export function useIssues(): [
  () => Promise<GetTimelogsResponse | null>,
  {
    data: GetTimelogsResponse | null;
    isLoading: boolean;
    error: Error | null;
  },
] {
  return React.useContext(IssuesContext);
}

export function withIssues<Props>(Component: React.FC<Props>): React.FC<Props> {
  return (props: Props): ReturnType<React.FC> => (
    <IssuesProvider>
      <Component {...props} />
    </IssuesProvider>
  );
}
