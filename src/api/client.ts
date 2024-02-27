import { components, paths } from '@/types/oas';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
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

export const getAccessToken = async () => {
  const msalCtx = useMsal();
  const { instance, accounts } = msalCtx;
  await Promise.resolve(); // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/5796#issuecomment-1763461620
  try {
    const silentReq = await instance.acquireTokenSilent({
      ...loginRequest,
      account: accounts[0],
    });
    return silentReq.accessToken;
  } catch (err: unknown) {
    // InteractionRequiredAuthError エラーの場合、再度リダイレクトで認証させる
    if (err instanceof InteractionRequiredAuthError) {
      return instance.acquireTokenRedirect(loginRequest);
    }
    throw err;
  }
};

const throwOnError: Middleware = {
  async onResponse(res) {
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
  const at = await getAccessToken();
  const client = createClient<paths>({
    baseUrl: 'https://graph.microsoft.com/v1.0',
    headers: { Authorization: `Bearer ${at}` },
  });
  client.use(throwOnError);
  return client;
};

// tanstack queryにて実装
export const getChats = async (param?: string): Promise<ChatsAPIResponse> => {
  console.log(`next link: ${param}`);
  const chatsClient = await prepareClient();
  const res = await chatsClient.GET('/chats');
  if (res.error) {
    console.error(res.error);
    throw res.error.error;
  }
  return res.data;
};
