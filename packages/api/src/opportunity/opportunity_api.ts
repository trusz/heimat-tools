import { Employee, Allocation } from "../employee"
import type { HTTP, JSON_Response } from "../x/http"
import { OppHistory } from "./history"
import { Comment } from "./comment"

export class Opportunity_API {
    constructor (
        public http:     HTTP,
        public base_url: string
    ) {}

    private readonly api_url: string = "heimat-core/opportunities"
	private readonly api_history_url = "history"
	private readonly api_comments_url = "comments"

	public async fetch_history(opp_id: number): Promise<OppHistory[]> {
		const url = this.url_history(opp_id)

		const resp: JSON_Response<OppHistory[]> = await this.http.get<OppHistory[]>(url.toString())
		const body = await resp.body

		return body
	}

	public async fetch_comments(opp_id:number): Promise<Comment[]> {
		const url = this.url_comments(opp_id)
		const resp: JSON_Response<Comment[]> = await this.http.get<Comment[]>(url.toString())
		const body = await resp.body

		return body
	}


	private url_history(opp_id: number): string {
		const path = [this.api_url, opp_id.toString(), this.api_history_url].join("/")
		const url = new URL(path, this.base_url)
		return url.toString()
	}
	private url_comments(opp_id: number): string {
		const path = [this.api_url, opp_id.toString(), this.api_comments_url].join("/")
		const url = new URL(path, this.base_url)
		return url.toString()
	}

    private url_employee(emp_id: number): string {
        const api_path = [this.api_url, emp_id].join("/")
        const url = new URL(api_path, this.base_url)
        return url.toString()
    }

    private url_allocations(emp_id: number): string {
        const api_path = [this.api_url, emp_id, "availability", "weeks"].join("/")
        const url = new URL(api_path, this.base_url)
        return url.toString()
    }
}