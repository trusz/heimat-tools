/**
 * AuthModule for application - handles authentication in app.
 */
export class Auth_Module {
    public jwt_get (): string {
        const jwt = this.get_JWT_from_local_storage()
        if (!jwt) {
            return ""
        }
        return jwt
    }

    private static readonly jwt_storage_key = "authToken"

    private get_JWT_from_local_storage (): string | null {
        return localStorage.getItem(Auth_Module.jwt_storage_key)
    }
}
