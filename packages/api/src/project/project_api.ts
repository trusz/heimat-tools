import { date_format_iso } from "../x/date"
import { type HTTP } from "../x/http"
import type { Project } from "./project"
import type { Task } from "./task"

export class Project_API {
    constructor (
        public http:        HTTP,
        public base_url:    string,
        public employee_id: number
    ) {
        this.api_url = `employees/${employee_id}/projects`
    }

    private readonly api_url: string

    async fetch_projects (date: Date): Promise<Project[]> {
        const url = this.url_projects(date)
        const resp = await this.http.get<Response_Project>(url)
        const projects = projects_from_response(resp.body)

        return projects
    }

    private url_projects (date: Date): string {
        const url = new URL(this.api_url, this.base_url)
        url.searchParams.set("date", date_format_iso(date))
        return url.toString()
    }
}

interface Response_Project {
    projects: {
        id:    number
        name:  string
        tasks: {
            id:   number
            name: string
        }[]
    }[]
}

function projects_from_response (resp: Response_Project): Project[] {
    const projects: Project[] = []

    for (const p of resp.projects) {
        const new_project: Project = {
            id:    p.id,
            name:  p.name,
            tasks: []
        }
        for (const t of p.tasks) {
            const new_task: Task = {
                id:   t.id,
                name: t.name
            }
            new_project.tasks.push(new_task)
        }
        new_project.tasks.sort((ta, tb) => {
            if (ta.id > tb.id) { return 1 }
            if (ta.id < tb.id) { return -1 }
            return 0
        })
        projects.push(new_project)
    }
    return projects
}
