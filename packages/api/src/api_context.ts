import { getContext, setContext } from "svelte"
import { API } from "./api"

const context_key = {}

export function context_api_create () {
    setContext(context_key, new API())
}

export function context_api_get (): API {
    return getContext<API>(context_key)
}
