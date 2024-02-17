import {
	QueryErrorResetBoundary,
	useSuspenseQuery,
} from "@tanstack/react-query";
import "./App.css";
import {
	AuthenticatedTemplate,
	IMsalContext,
	UnauthenticatedTemplate,
	useMsal,
} from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { FC, Suspense } from "react";

const loginRequest = {
	scopes: [
		"openid",
		"profile",
		"user.read",
		"chat.read",
		"chat.readbasic",
		"chat.readwrite",
		"files.read.all",
		"files.readwrite.all",
	],
};

const ErrorFallback: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
	const err = error as Error;

	return (
		<div>
			<p>エラー発生: {err.message}</p>
			<button
				type={"button"}
				onClick={() => {
					resetErrorBoundary();
				}}
			>
				エラーをクリア
			</button>
		</div>
	);
};

const LoginButton = () => {
	const { instance } = useMsal();
	const handleLogin = () => {
		instance.loginRedirect(loginRequest);
	};

	return (
		<>
			<button type={"button"} onClick={() => handleLogin()}>
				login
			</button>
		</>
	);
};

const LogoutButton = () => {
	const { instance } = useMsal();
	const handleLogout = () => {
		instance.logoutRedirect();
	};

	return (
		<>
			<button type={"button"} onClick={() => handleLogout()}>
				logout
			</button>
		</>
	);
};

const getUserData = async (msalCtx: IMsalContext) => {
	const { instance, accounts } = msalCtx;
	try {
		// InteractionRequiredAuthError エラーの場合、再度リダイレクトで認証させる
		const silentReq = await instance.acquireTokenSilent({
			...loginRequest,
			account: accounts[0],
		});
		const endpoint = "https://graph.microsoft.com/v1.0/me";
		const headers = {
			Authorization: `Bearer ${silentReq.accessToken}`,
		};
		const fetchedData = await fetch(endpoint, { headers });
		if (!fetchedData.ok) {
			throw new Error("Error at fetching user data!");
		}
		return await fetchedData.json();
	} catch (err: unknown) {
		if (err instanceof InteractionRequiredAuthError) {
			return instance.acquireTokenRedirect(loginRequest);
		}
		throw err;
	}
};

const useUserData = (msalCtx: IMsalContext) => {
	const { data, isPending, isError, error } = useSuspenseQuery({
		queryKey: ["userdata"],
		queryFn: () => getUserData(msalCtx),
	});
	if (error) throw error;
	console.log(data);
	return { data, isPending, isError, error };
};

const UserData = () => {
	const msalCtx = useMsal();

	const { data } = useUserData(msalCtx);

	return (
		<>
			<div>{`id: ${data.userPrincipalName}`}</div>
			<div>{`name: ${data.displayName}`}</div>
			<div>{`role: ${data.jobTitle}`}</div>
		</>
	);
};

function App() {
	return (
		<>
			<h1>MSAL-React POC!</h1>
			<AuthenticatedTemplate>
				<div>ログイン成功！</div>
				<LogoutButton />
				<QueryErrorResetBoundary>
					{({ reset }) => (
						<ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
							<Suspense fallback={<b>Loading...</b>}>
								<UserData />
							</Suspense>
						</ErrorBoundary>
					)}
				</QueryErrorResetBoundary>
			</AuthenticatedTemplate>
			<UnauthenticatedTemplate>
				<div>ログインどうぞ</div>
				<LoginButton />
			</UnauthenticatedTemplate>
		</>
	);
}

export default App;
