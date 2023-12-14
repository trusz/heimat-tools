import type { Project, Task } from "../project"
import { defaults } from "lodash"

export class Time_Entry {
    public id:           number            = -1 * (Math.random() * 10000 | 0)
    public start:        Date              = new Date()
    public end:          Date              = new Date()
    public state:        Time_Entry_State  = Time_Entry_State.In_Progress
    public project?:     Project           = undefined
    public task?:        Task              = undefined
    public description?: string            = undefined
    public is_selected:  boolean           = false

    constructor (time_entry?: Partial<Time_Entry>) {
        const new_this: Time_Entry = {
            ...structuredClone(this),
            ...time_entry,
        }
        Object.setPrototypeOf(new_this, Time_Entry.prototype)
        return new_this
    }

    public static Is_Same_Range (a: Time_Entry, b: Time_Entry): boolean {
        return a.start.getTime() === b.start.getTime() &&
               a.end.getTime() === b.end.getTime()
    }
}

function time_entry_default (): Time_Entry {
    return {
        id:          -1 * (Math.random() * 10000 | 0),
        start:       new Date(),
        end:         new Date(),
        state:       Time_Entry_State.In_Progress,
        is_selected: false,
    }
}

export function new_time_entry (
    id = -1 * (Math.random() * 10000 | 0),
    start = new Date(),
    end = new Date(),
    state = Time_Entry_State.In_Progress,
    project?: Project,
    task?: Task,
    description?: string,
    is_selected = false,
): Time_Entry {
    return {
        id,
        start,
        end,
        state,
        project,
        task,
        description,
        is_selected,
    }
}

/**
 * @deprecated use the contructor instead
 * @param time_entry
 * @returns
 */
export function new_time_entry2 (
    time_entry: Partial<Time_Entry>,
): Time_Entry {
    const final_time_entry = defaults(time_entry, time_entry_default())

    return final_time_entry
}

export function time_entry_overlap (a: Time_Entry, b: Time_Entry): boolean {
    return Math.max(a.start.getTime(), b.start.getTime()) < Math.min(a.end.getTime(), b.end.getTime())
}

const hour_in_minutes = 60

//
// Slot Transformation
//
export function date_to_slot (
    d:               Date,
    start_hour:      number,
    step_in_minutes: number,
): number {
    const hours = d.getHours()
    const minutes = d.getMinutes()
    const diff_minutes = (hours * hour_in_minutes) + minutes - start_hour * hour_in_minutes
    const diff_steps = Math.floor(diff_minutes / step_in_minutes)
    const slot_number = diff_steps

    return slot_number
}

export function slot_to_minutes (
    slot:            number,
    start_hour:      number,
    step_in_minutes: number,
): number {
    const diff_minutes = slot * step_in_minutes
    const start_minutes = start_hour * hour_in_minutes
    const minutes = start_minutes + diff_minutes

    return minutes
}

//
// State Machine
//

export enum Time_Entry_State {
    In_Progress = "In_Progress",
    Error       = "Error",
    ToSave      = "ToSave",
    Saving      = "Saving",
    Stable      = "Stable",
    ToDelete    = "ToSDelete",
    Deleting    = "Deleting",
}

export enum Time_Entry_Action {
    Creation_Progression = "Creation_Progression",
    Form_Changes         = "Form_Changes",
    Form_Finished        = "Form_Finished",
    Form_Or_Time_Changes = "Form_Or_Time_Changes",
    Save_Success         = "Save_Success",
    Save_Error           = "Save_Error",
    Delete               = "Delete",
    Start_Saving         = "Start_Saving",
    Start_Deleting       = "Start_Deleting",
}

type State_Machine = {
    [key in Time_Entry_State]: {
        [key in Time_Entry_Action]?: Time_Entry_State
    }
}
const state_machine: State_Machine = {
    [Time_Entry_State.In_Progress]: {
        [Time_Entry_Action.Creation_Progression]: Time_Entry_State.In_Progress,
        [Time_Entry_Action.Form_Changes]:         Time_Entry_State.In_Progress,
        [Time_Entry_Action.Form_Finished]:        Time_Entry_State.ToSave,
        [Time_Entry_Action.Delete]:               Time_Entry_State.ToDelete,
    },
    [Time_Entry_State.ToSave]: {
        [Time_Entry_Action.Start_Saving]: Time_Entry_State.Saving,
        [Time_Entry_Action.Save_Error]:   Time_Entry_State.Error,
    },
    [Time_Entry_State.ToDelete]: {
        [Time_Entry_Action.Start_Deleting]: Time_Entry_State.Deleting,
        [Time_Entry_Action.Save_Error]:     Time_Entry_State.Error,
    },
    [Time_Entry_State.Stable]: {
        [Time_Entry_Action.Form_Finished]:        Time_Entry_State.ToSave,
        [Time_Entry_Action.Delete]:               Time_Entry_State.ToDelete,
        [Time_Entry_Action.Form_Or_Time_Changes]: Time_Entry_State.In_Progress,
    },
    [Time_Entry_State.Error]: {
        [Time_Entry_Action.Form_Or_Time_Changes]: Time_Entry_State.In_Progress,
        [Time_Entry_Action.Form_Finished]:        Time_Entry_State.ToSave,
    },
    [Time_Entry_State.Deleting]: {
        [Time_Entry_Action.Save_Success]: Time_Entry_State.Stable,
        [Time_Entry_Action.Save_Error]:   Time_Entry_State.Error,
    },
    [Time_Entry_State.Saving]: {
        [Time_Entry_Action.Save_Success]: Time_Entry_State.Stable,
        [Time_Entry_Action.Save_Error]:   Time_Entry_State.Error,
    },
}

export function time_entry_execute_action (
    time_entry: Time_Entry,
    action:     Time_Entry_Action,
): Time_Entry {
    const mutated_time_entry = { ...time_entry }
    const possible_actions = state_machine[time_entry.state]
    const new_state = possible_actions[action]

    if (!new_state) {
        return time_entry
    }

    mutated_time_entry.state = new_state
    return mutated_time_entry
}
