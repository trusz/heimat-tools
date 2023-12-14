import { getContext, setContext } from "svelte"
import { Time_Entries } from "./time_entries"

const context_key = {}

export function time_entries_context_init () {
    setContext<Time_Entries>(context_key, new Time_Entries())
}

export function time_entries_context_use () {
    const ctx = getContext<Time_Entries>(context_key)
    if (!ctx) {
        console.warn({ level: "warn", msg: "time entry context has not been initalized" })
    }
    return ctx
}
