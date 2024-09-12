import { date_format_iso } from "../x/date"
import { type HTTP } from "../x/http"
import { Project_Details } from "./project_details"
import type { Project_Allocation, Project_v2 } from "./project_v2"

export class Project_API_V2 {
    constructor (
        public http:        HTTP,
        public base_url:    string,
        public employee_id: number
    ) {
        this.api_url = `heimat-core/projects`
    }

    private readonly api_url: string

    async fetch_projects (): Promise<Project_v2[]> {
        const url = this.url_projects()
        const resp = await this.http.get<Response_Project>(url)
        const projects = projects_from_response(resp.body)

        return projects
    }

	async fetch_project_details(id: number): Promise<Project_Details> {
		const url = this.url_project_details(id)
		const resp = await this.http.get<Response_Project_Details>(url)
		const project_details = project_detail_from_response(resp.body)
		return project_details
	}

	// heimat-core/projects/122
	private url_project_details(id:number): string {
		const api_path = [this.api_url, id].join("/")
		const url = new URL(api_path, this.base_url)
		return url.toString()
	}

    private url_projects(): string {
        const url = new URL(this.api_url, this.base_url)
        return url.toString()
    }
}

interface Response_Project {
    projects: {
        id:    number
        name:  string
    }[]
}

function projects_from_response (resp: Response_Project): Project_v2[] {
    const projects: Project_v2[] = []

    for (const p of resp.projects) {
        const new_project_v2: Project_v2 = {
            id:    p.id,
            name:  p.name,
        }
        projects.push(new_project_v2)
    }
    return projects
}


type Response_Project_Details = {
	id:    number,
	name:  string
	plannedAllocations: Response_Allocation[]
	unstaffedAllocations: Response_Allocation[]
}
type Response_Allocation = {
	id: number
	projectRole: string
}


function project_detail_from_response (resp: Response_Project_Details): Project_Details {
    const project_details: Project_Details = {
		id:    resp.id,
		name:  resp.name,
		allocations: [
			...resp.plannedAllocations.map((a) => allocation_from_response(a,true)),
			...resp.unstaffedAllocations.map((a) => allocation_from_response(a,false)),
		]
	}

	return project_details
}


function allocation_from_response(resp: Response_Allocation, is_staffed: boolean): Project_Allocation {
	return {
		id: resp.id,
		project_role: resp.projectRole,
		is_staffed: is_staffed
	}
}