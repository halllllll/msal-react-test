import {
	QueryErrorResetBoundary,
} from "@tanstack/react-query";
import "./App.css";
import {
	AuthenticatedTemplate,
	UnauthenticatedTemplate,
	useMsal,
} from "@azure/msal-react";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { loginRequest } from "./api/client";
import { Home } from "./components/Home";
import { useMyAppContext } from "./context/hook";
import { ErrorFallback } from "./components/error-boundary";



const LoginButton = () => {
	const { instance, inProgress } = useMsal();
	const { setMyAppCtx } = useMyAppContext()
	const handleLogin = () => {
		instance.loginPopup(loginRequest).then((resp) => {
			setMyAppCtx({
				type: "SetAccessToken",
				payload: {accessToken: resp.accessToken}
			})
		}).catch(err => {
			throw new Error(err)
		});
	};

	return (
		<>
			<button type={"button"} onClick={() => handleLogin()} disabled={!inProgress}>
				login
			</button>
		</>
	);
};

const LogoutButton = () => {
	const { instance } = useMsal();
	const { setMyAppCtx } = useMyAppContext()

	const handleLogout = () => {
		instance.logoutRedirect().finally(() => {
			setMyAppCtx({type: "logout"})
		});
	};

	return (
		<>
			<button type={"button"} onClick={() => handleLogout()}>
				logout
			</button>
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
								<Home />
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
