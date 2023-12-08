import { PublicClientApplication } from "@azure/msal-browser"
import { msal_config } from "./config"

export const my_msal = new PublicClientApplication(msal_config)
const signInType = "redirect"

// async function sign_in() {
// 	return my_msal.loginRedirect(loginRequest)
// }