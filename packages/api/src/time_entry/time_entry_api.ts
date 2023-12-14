import { new_project, new_task } from "../project"
import { date_format_iso, date_format_time } from "../x/date"
import { type HTTP } from "../x/http"
import type { Date_ISO, Time_String } from "../x/types"
import { Time_Entry, Time_Entry_State } from "./time_entry"

export class Time_Entry_API {
    constructor (
        public http:        HTTP,
        public base_url:    string,
        public employee_id: number,
    ) {
        this.api_url = `employees/${employee_id}/trackedtimes`
    }

    private readonly api_url: string

    //
    // Fetching
    //
    public async fetch_time_entries (from: Date, to: Date): Promise<Time_Entry[]> {
        const url = this.url_tracked_times(from, to)
        const resp = await this.http.get<Response_Tracked_Times>(url)
        const time_entries = time_entries_from_response(resp.body)

        return time_entries
    }

    private url_tracked_times (from: Date, to: Date): string {
        const url = new URL(this.api_url, this.base_url)
        url.searchParams.set("start", date_format_iso(from))
        url.searchParams.set("end", date_format_iso(to))
        return url.toString()
    }

    //
    // Saving / Creating
    //
    public async save_time_entry (time_entry: Time_Entry): Promise<void> {
        const url = this.url_post_tracked_times()
        const payload = time_entry_to_post_tracked_times(time_entry, this.employee_id)

        await this.http.post(url, payload)
    }

    private url_post_tracked_times () {
        const url = new URL("trackedtimes", this.base_url)
        return url.toString()
    }

    //
    // Updating
    //
    public async update_time_entry (time_entry: Time_Entry): Promise<void> {
        const url = this.url_update_tracked_times(time_entry.id)
        // Should we creat its own mapper?
        const payload = time_entry_to_put_tracked_times(time_entry)
        await this.http.put(url, payload)
    }

    private url_update_tracked_times (id: number): string {
        const path = ["trackedtimes", id].join("/")
        const url = new URL(path, this.base_url)
        return url.toString()
    }

    //
    // Deleting
    //
    public async delete_time_entry (time_entry: Time_Entry): Promise<void> {
        const url = this.url_delete_tracked_times(time_entry.id)
        await this.http.delete(url)
    }

    private url_delete_tracked_times (id: number): string {
        const path = ["trackedtimes", id].join("/")
        const url = new URL(path, this.base_url)
        return url.toString()
    }
}

interface Response_Tracked_Times {
    id:               number // employee id
    types:            ("WORKING_HOURS" | "PUBLIC_HOLIDAY")[]
    firstName:        string
    lastName:         string
    lockStatus:       { id: number } // 1=locked, 2=editable
    projectIds:       null
    trackedTimesDate: {
        date:                Date_ISO
        plannedWorkingHours: number
        publicHoliday:       null | string
        trackedTimes: {
            id:       number
            date:     Date_ISO
            employee: { id: number }
            start:    Time_String
            end:      Time_String
            note:     string // -> description
            status:   { id: 1 }
            project:  { id: number, name: string }
            task:     { id: number, name: string, isBillable: null }
            type:     "WORKING_HOURS" | "PUBLIC_HOLIDAY" | "FLEXIDAY"
        }[]
    }[]
}

const time_entry_type = {
    WORKING_HOURS:  "WORKING_HOURS",
    PUBLIC_HOLIDAY: "PUBLIC_HOLIDAY",
    FLEXIDAY:       "FLEXIDAY",
} as const

function time_entries_from_response (resp: Response_Tracked_Times): Time_Entry[] {
    const time_entires: Time_Entry[] = []

    for (const ttd of resp.trackedTimesDate) {
        for (const tt of ttd.trackedTimes) {
            // debugger;
            if (tt.type !== time_entry_type.WORKING_HOURS) { continue }

            const time_entry = new Time_Entry({
                id:          tt.id,
                start:       new Date(`${tt.date} ${tt.start}`),
                end:         new Date(`${tt.date} ${tt.end}`),
                state:       Time_Entry_State.Stable,
                project:     new_project(tt.project.id, tt.project.name),
                task:        new_task(tt.task.id, tt.task.name),
                description: tt.note,
            })
            time_entires.push(time_entry)
        }
    }
    return time_entires
}

interface Post_Tracked_Times {
    date:         Date_ISO
    employee:     { id: number }
    trackedTimes: {
        start: Time_String
        end:   Time_String
        note:  string
        task:  { id: number }
    }[]
}

function time_entry_to_post_tracked_times (time_entry: Time_Entry, employee_id: number): Post_Tracked_Times {
    if (time_entry.task === undefined) {
        throw new Error("time_entry_to_post_tracked_times: time entry must have a task")
    }

    return {
        date:         date_format_iso(time_entry.start),
        employee:     { id: employee_id },
        trackedTimes: [{
            start: date_format_time(time_entry.start),
            end:   date_format_time(time_entry.end),
            note:  time_entry.description ?? "",
            task:  { id: time_entry.task.id },
        }],
    }
}

interface Put_Tracked_Times {
    date:         Date_ISO
    trackedTimes: {
        start: Time_String
        end:   Time_String
        note:  string
        task:  { id: number }
    }[]
}

function time_entry_to_put_tracked_times (time_entry: Time_Entry): Put_Tracked_Times {
    if (time_entry.task === undefined) {
        throw new Error("time_entry_to_put_tracked_times: time entry must have a task")
    }

    return {
        date:         date_format_iso(time_entry.start),
        trackedTimes: [{
            start: date_format_time(time_entry.start),
            end:   date_format_time(time_entry.end),
            note:  time_entry.description ?? "",
            task:  { id: time_entry.task?.id },
        }],
    }
}
