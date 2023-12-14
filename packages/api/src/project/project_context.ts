import { writable, type Writable, get } from "svelte/store"
import { getContext, setContext } from "svelte"
import { Projects } from "./project_store"
import type { Project } from "./project"

interface Project_Context {
    store_projects: Writable<Project[]>
    add_project:    typeof add_project
    set_projects:   typeof set_projects
}
const context_key = {}

export function init_project_context () {
    const project_context: Project_Context = {
        store_projects: writable<Project[]>([]),
        add_project,
        set_projects
    }
    setContext<Project_Context>(context_key, project_context)
}

export function use_project_context () {
    const ctx = getContext<Project_Context>(context_key)
    if (!ctx) {
        console.warn({ level: "warn", msg: "project context has not been initalized" })
    }
    return ctx
}

// TODO: rewrite with update
function add_project (...new_projects: Project[]) {
    const { store_projects } = use_project_context()
    const projects = get(store_projects)
    store_projects.set([...projects, ...new_projects])
}

function set_projects (projects: Project[]) {
    const { store_projects } = use_project_context()
    store_projects.set(projects)
}

const context_key_v2 = {}
export function context_project_init () {
    setContext<Projects>(context_key_v2, new Projects())
}

export function context_project_use (): Projects {
    const ctx = getContext<Projects>(context_key_v2)
    if (!ctx) {
        console.warn({ level: "warn", msg: "project context has not been initalized" })
    }
    return ctx
}
