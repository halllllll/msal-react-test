import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ChatsAPIResponse, getAccessToken, getChats } from '../api/client';

const _sleep = async (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

// * 参考のため（Tanstack Queryではなく）生のfetchで実装
const getUserData = async () => {
  const accessToken = await getAccessToken();
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
  const { data, isPending, isError, error } = useSuspenseQuery({
    queryKey: ['userdata'],
    queryFn: getUserData,
  });
  if (error) throw error;
  return { data, isPending, isError, error };
};

export const useGetChatsFirst20 = () => {
  const { data, isPending, isError, error } = useSuspenseQuery({
    networkMode: 'offlineFirst',
    refetchOnReconnect: false,
    queryKey: ['chat shot first 20'],
    // queryFn: getChats,
    queryFn: async ({ queryKey }) => {
      // queryKeyの最初の要素をパラメータとしてgetChatsに渡す
      const param = queryKey[0];
      return getChats(param);
    },
  });
  if (error) {
    throw error;
  }
  console.log(data);
  return { data, isPending, isError };
};

export const useInfinityQuerySample = () => {
  const [queryKey, setQueryKey] = useState<string[]>(['chats pagenate']);
  const addKey = (t: string) => {
    setQueryKey([...queryKey, t]);
  };
  let retNextLink = '';

  const { data, isPending, hasNextPage, fetchNextPage, isError, error } = useSuspenseInfiniteQuery({
    networkMode: 'offlineFirst',
    queryKey: queryKey,
    queryFn: ({ pageParam }) => {
      return getChats(pageParam);
    },
    getNextPageParam: (lastPage: ChatsAPIResponse) => {
      const nextlinkLiteral = '@odata.nextLink';
      retNextLink = `${lastPage[nextlinkLiteral as keyof typeof lastPage]}`;
      const ret = lastPage['@odata.nextLink'];
      console.log(`ret: ${ret}`);
      return ret;
    },
    initialPageParam: 'https://graph.microsoft.com/v1.0',
  });

  return { data, isPending, hasNextPage, fetchNextPage, isError, error, addKey, retNextLink };
};
