import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import {
	PublicClientApplication,
	BrowserCacheLocation,
} from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MyAppProvider } from "./context/hook.tsx";

const msalClient = new PublicClientApplication({
	auth: {
		clientId: import.meta.env.VITE_CLIENT_ID,
		authority: `https://login.microsoftonline.com/${
			import.meta.env.VITE_AUTHORITY
		}`,
		redirectUri: import.meta.env.VITE_REDIRECT_URI,
	},
	cache: {
		cacheLocation: BrowserCacheLocation.SessionStorage,
		storeAuthStateInCookie: true,
	},
});

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 5,
		},
	},
});

// biome-ignore lint/style/noNonNullAssertion: <explanation>
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<MyAppProvider>
			<QueryClientProvider client={queryClient}>
				<MsalProvider instance={msalClient}>
					<App />
				</MsalProvider>
			</QueryClientProvider>
		</MyAppProvider>
	</React.StrictMode>,
);
