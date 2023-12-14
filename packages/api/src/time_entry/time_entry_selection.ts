import { writable, type Writable, get } from "svelte/store"
import { getContext, setContext } from "svelte"

const context_key = {}
const no_selection = -Infinity

export function context_time_entry_selection_init () {
    setContext<Selection_Context>(context_key, new Selection_Context())
}

export function context_time_entry_selection_use () {
    const ctx = getContext<Selection_Context>(context_key)
    if (!ctx) {
        console.warn({ level: "warn", msg: "selection context has not been initalized" })
    }
    return ctx
}

export class Selection_Context {
    public selection_store: Writable<number> = writable(no_selection)

    //
    // Selection
    //
    public select_time_entry (time_entry_id: number) {
        this.selection_store.set(time_entry_id)
    }

    public clear_selection () {
        this.selection_store.set(no_selection)
    }

    public get_selected_time_entry_id (): number {
        return get(this.selection_store)
    }
}
