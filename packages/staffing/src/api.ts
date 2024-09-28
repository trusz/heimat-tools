import {
	HTTP, 
	Auth_Module, 
	probability_text_to_percent	,
	type RevisionProperty,
	Project_API_V2,
	type Project_v2,
	type Project_Details,
} from "@heimtools/api"

export class API {
	private project_api: Project_API_V2

	public constructor () {	
		const auth = new Auth_Module()
		const jwt = auth.jwt_get()
		const http_module = new HTTP(jwt)
		this.project_api = new Project_API_V2(http_module, window.location.origin, 1)
	}


	public async fetch_projects(): Promise<Project_v2[]> {
		const projects = await this.project_api.fetch_projects()
		return projects
	}

	public async fetch_project_details(id: number): Promise<Project_Details> {
		const project_details = await this.project_api.fetch_project_details(id)
		return project_details
	}

}

export const api = new API()
