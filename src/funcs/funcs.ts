import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';

import { ChatsAPIResponse, getAccessToken, getChats } from '../api/client';
import { IMsalContext, useMsal } from '@azure/msal-react';

// * 参考のため（Tanstack Queryではなく）生のfetchで実装
const getUserData = async (msalCtx: IMsalContext) => {
  const accessToken = await getAccessToken(msalCtx);
  const endpoint = 'https://graph.microsoft.com/v1.0/me';
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const fetchedData = await fetch(endpoint, { headers });
  if (!fetchedData.ok) {
    throw new Error('Error at fetching user data!');
  }

  return await fetchedData.json();
};

export const useUserData = () => {
  const msalCtx = useMsal();
  const { data, isPending, isError, error } = useSuspenseQuery({
    queryKey: ['userdata'],
    queryFn: () => getUserData(msalCtx),
  });
  if (error) throw error;
  return { data, isPending, isError, error };
};

// useSuspenseQueryで一度だけ実行する
// (レスポンスボディのnextlinkパラメータを使えば次のリストも取得できる)
export const useGetChatsFirst20 = () => {
  const msalCtx = useMsal();
  const { data, isPending, isError, error } = useSuspenseQuery({
    networkMode: 'offlineFirst',
    refetchOnReconnect: false,
    queryKey: ['chat shot first 20'],
    queryFn: async () => {
      return getChats('', msalCtx);
    },
  });
  if (error) {
    throw error;
  }

  return { data, isPending, isError };
};

export const useGetChatsPaginate = () => {
  const msalCtx = useMsal();
  const { data, isPending, hasNextPage, fetchNextPage, isError, isFetching, isLoading, error } =
    useSuspenseInfiniteQuery({
      networkMode: 'offlineFirst',
      retry: 5,
      retryOnMount: false,
      retryDelay: (attempt) => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
      queryKey: ['chat pagenates'],
      queryFn: ({ pageParam }) => {
        return getChats(pageParam, msalCtx);
      },
      select: (data) => {
        const result = data.pages.map((v) => {
          return v.value?.map((vv) => {
            return {
              type: vv.chatType,
              id: vv.id,
              topic: vv.topic,
              createdat: vv.createdDateTime,
              updatedat: vv.lastUpdatedDateTime,
              url: vv.webUrl,
            };
          });
        });

        return {
          count: data.pages
            .map((v) => v['@odata.count'])
            .reduce((pre, cur) => pre && cur && pre + cur),
          result: result.flat(),
        };
      },
      getNextPageParam: (lastPage: ChatsAPIResponse) => {
        const ret = lastPage['@odata.nextLink'];
        return ret;
      },
      initialPageParam: '',
    });

  return { data, isPending, isFetching, isLoading, hasNextPage, fetchNextPage, isError, error };
};
