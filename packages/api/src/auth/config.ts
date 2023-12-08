
import { LogLevel } from "@azure/msal-browser";

export const msal_config = {
    auth: {
        clientId: "b3549fac-7bec-4ca8-acdb-91c4b6d94f62",
        // authority: "https://login.windows-ppe.net/common",
        // authority: "https://login.microsoftonline.com/",
        authority: "https://login.microsoftonline.com/331e8350-a57c-43c3-9a37-d76cf8000f52",
        redirectUri: "http://localhost:62866",
        postLogoutRedirectUri: "/"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level: LogLevel, message: unknown, containsPii: boolean) => {
                if (containsPii) {	
                    return;	
                }
                switch (level) {	
                    case LogLevel.Error:	
                        console.error(message);	
                        return;	
                    case LogLevel.Info:	
                        console.info(message);	
                        return;	
                    case LogLevel.Verbose:	
                        console.debug(message);	
                        return;	
                    case LogLevel.Warning:	
                        console.warn(message);	
                        return;	
                    default:
                        return;
                }
            }
        }
    }
}