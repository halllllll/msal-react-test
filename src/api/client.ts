import { components, paths } from '@/types/oas';
import {
  BrowserCacheLocation,
  InteractionRequiredAuthError,
  PublicClientApplication,
} from '@azure/msal-browser';
import createClient, { Middleware } from 'openapi-fetch';

export const loginRequest = {
  scopes: [
    'openid',
    'profile',
    'user.read',
    'chat.read',
    'chat.readbasic',
    'chat.readwrite',
    'files.read.all',
    'files.readwrite.all',
  ],
};

export type ChatsAPIResponse =
  components['responses']['microsoft.graph.chatCollectionResponse']['content']['application/json'];

export type RejectResponse = components['responses']['error']['content']['application/json'];
export const msalClient = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AUTHORITY}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.SessionStorage,
    storeAuthStateInCookie: true,
  },
});

export const getAccessToken = async () => {
  const accounts = msalClient.getAllAccounts();
  // await Promise.resolve(); // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/5796#issuecomment-1763461620
  try {
    const silentReq = await msalClient.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return silentReq.accessToken;
  } catch (err: unknown) {
    // InteractionRequiredAuthError エラーの場合、再度リダイレクトで認証させる
    if (err instanceof InteractionRequiredAuthError) {
      return msalClient.acquireTokenRedirect(loginRequest);
    }
    throw err;
  }
};

const authMiddleware: Middleware = {
  async onRequest(req) {
    const at = await getAccessToken();
    req.headers.set('Authorization', `Bearer ${at}`);
    return req;
  },
};

const throwOnError: Middleware = {
  async onResponse(res) {
    if (res.status === 403) {
      // https://learn.microsoft.com/en-us/graph/resolve-auth-errors
      const body = (await res.clone().json()) as RejectResponse;
      throw body.error;
    }
    if (res.status >= 400) {
      const body = res.headers.get('content-type')?.includes('json')
        ? await res.clone().json()
        : await res.clone().text();
      throw new Error(body);
    }
    return undefined;
  },
};

const prepareClient = async () => {
  const client = createClient<paths>({
    baseUrl: 'https://graph.microsoft.com/v1.0',
  });
  client.use(authMiddleware);
  client.use(throwOnError);
  return client;
};

// tanstack queryにて実装

export const getChats = async (nextLink: string): Promise<ChatsAPIResponse> => {
  if (nextLink.slice(nextLink.indexOf('?$skiptoken'), -1) === '') {
    const chatsClient = await prepareClient();

    const res = await chatsClient.GET('/chats', {
      params: {
        query: {},
      },
    });
    if (res.error) {
      throw res.error.error;
    }
    return res.data;
  }
  // skiptokenのパラメータをopenapi-fetchでは扱えなかった
  // 生のfetchでやることにする
  const at = await getAccessToken();
  const res = await fetch(nextLink, {
    headers: {
      Authorization: `Bearer ${at}`,
    },
  });
  if (!res.ok) {
    console.error(res.body);
    throw res.body;
  }
  return await res.json();
};
