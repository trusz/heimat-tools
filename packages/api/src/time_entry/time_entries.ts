import { writable, derived, type Readable, get } from "svelte/store"
import { Time_Entry, Time_Entry_State } from "./time_entry"

export class Time_Entries {
    private readonly _entries$ = writable<Time_Entry[]>([])
    public entries$ = derived(this._entries$, (time_entries) => time_entries)
    public entries_to_save$ = derived_by_state(this._entries$, Time_Entry_State.ToSave)
    public entries_to_delete$ = derived_by_state(this._entries$, Time_Entry_State.ToDelete)

    public create_time_entry (
        ...time_entries_to_create: Partial<Time_Entry>[]
    ) {
        const new_time_entries = time_entries_to_create.map((te) => new Time_Entry(te))
        this._entries$.update((time_entries) => [...time_entries, ...new_time_entries])
    }

    public clear () {
        this._entries$.set([])
    }

    /**
     * Selects a single time entry
     * and deselects any previously selected ones
     */
    public select_time_entry (id: number) {
        this._entries$.update((time_entries) => {
            return time_entries.map((te) => {
                if (te.id === id) {
                    return { ...te, is_selected: true }
                }
                return { ...te, is_selected: false }
            })
        })
    }

    /**
     * Selects additional time entries
     * wihout deselecting any previously selected ones
     */
    public select_additional_time_entry (id: number) {
        this._entries$.update((time_entries) => {
            return time_entries.map((te) => {
                if (te.id === id) {
                    return { ...te, is_selected: true }
                }
                return te
            })
        })
    }

    public reset_selected_time_entry () {
        this._entries$.update((time_entries) => {
            return time_entries.map((te) => {
                return { ...te, is_selected: false }
            })
        })
    }

    private set_state (id: number, state: Time_Entry_State) {
        this._entries$.update((time_entries) => {
            return time_entries.map((te) => {
                if (te.id === id) {
                    return { ...te, state }
                }
                return te
            })
        })
    }

    public flag_to_delete (id: number) {
        this.set_state(id, Time_Entry_State.ToDelete)
    }

    public flag_to_save (id: number) {
        this._entries$.update((time_entries) => {
            return time_entries.map((te) => {
                if (te.id === id) {
                    return {
                        ...te,
                        state: Time_Entry_State.ToSave,
                    }
                }
                return te
            })
        })
    }

    public delete (id: number) {
        this._entries$.update((time_entries) => {
            return time_entries.filter((te) => te.id !== id)
        })
    }

    public delete_batch (ids: number[]) {
        this._entries$.update((time_entries) => {
            return time_entries.filter((te) => !ids.includes(te.id))
        })
    }

    public set_time_range (id: number, start?: Date, end?: Date) {
        this.update_by_id(id, { start, end })
        this.flag_to_save(id)
    }

    public update_by_id (id: number, time_entry: Partial<Time_Entry>) {
        this._entries$.update((time_entries) => {
            return time_entries.map((te) => {
                if (te.id === id) {
                    return {
                        ...te,
                        ...time_entry,
                    }
                }
                return te
            })
        })
    }

    public update_by_batch (cmds: CMD_Update_Time_Entry_By_Id[]) {
        this._entries$.update((time_entries) => {
            return time_entries.map((te) => {
                const cmd = cmds.find((cmd) => cmd.id === te.id)
                if (cmd != null) {
                    return {
                        ...te,
                        ...cmd.time_entry,
                        // state: Time_Entry_State.Stable,
                    }
                }
                return te
            })
        })
    }

    public replace_time_entries_by_id (cmds: CMD_Replace_Time_Entry_By_Id[]) {
        const time_entries = get(this.entries$)
        const new_cmds: CMD_Replace_Time_Entry_By_Index[] = []
        for (const { id, time_entry } of cmds) {
            const index = time_entries.findIndex(te => te.id === id)
            new_cmds.push({
                index,
                time_entry,
            })
        }

        this.replace_time_entries_by_index(new_cmds)
    }

    public replace_time_entries_by_index (cmds: CMD_Replace_Time_Entry_By_Index[]): void {
        this._entries$.update((time_entries) => {
            const new_time_entries = [...time_entries]
            for (const { index, time_entry } of cmds) {
                // fix time order
                if (time_entry.start > time_entry.end) {
                    [time_entry.end, time_entry.start] = [time_entry.start, time_entry.end]
                }
                new_time_entries[index] = time_entry
            }
            return new_time_entries
        })
    }

    public replace_time_entries_by_time_range (time_entries_to_replace: Time_Entry[]) {
        this._entries$.update((time_entries) => {
            const new_time_entries = [...time_entries]

            for (const time_entry of time_entries_to_replace) {
                const index = time_entries.findIndex((te) => {
                    return Time_Entry.Is_Same_Range(te, time_entry)
                })
                new_time_entries[index] = time_entry
            }

            return new_time_entries
        })
    }
}

function derived_by_state (time_entries: Readable<Time_Entry[]>, state: Time_Entry_State): Readable<Time_Entry[]> {
    return derived(time_entries, (time_entries) => time_entries.filter((e) => e.state === state))
}

export interface CMD_Update_Time_Entry_By_Id {
    id:         number
    time_entry: Partial<Time_Entry>
}
export interface CMD_Replace_Time_Entry_By_Id {
    id:         number
    time_entry: Time_Entry
}

export interface CMD_Replace_Time_Entry_By_Index {
    index:      number
    time_entry: Time_Entry
}
