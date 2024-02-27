// import { useMsal } from "@azure/msal-react";
import { type FC } from "react";
import { useUserData } from "../funcs/funcs";



export const UserData:FC = () => {

	const { data } = useUserData();
	return (
		<>
			<div>{`id: ${data.userPrincipalName}`}</div>
			<div>{`name: ${data.displayName}`}</div>
			<div>{`role: ${data.jobTitle}`}</div>
		</>
	);
};