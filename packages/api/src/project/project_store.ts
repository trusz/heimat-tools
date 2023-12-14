import { derived, writable } from "svelte/store"
import type { Project } from "./project"
import type { Date_ISO } from "../x/types"

export class Projects {
    private readonly _store = writable<DateProjectMap>(new Map())
    public store = derived(this._store, (p) => p)

    public set_projects (date: Date_ISO, projects: Project[]) {
        this._store.update((projects_map) => {
            return projects_map.set(date, projects)
        })
    }

    public create_project (date: Date_ISO, project: Project) {
        this._store.update((projects) => {
            const projects_for_date = projects.get(date) ?? []
            return projects.set(date, [...projects_for_date, project])
        })
    }
}

export type DateProjectMap = Map<Date_ISO, Project[]>
