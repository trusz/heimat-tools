import type { HTTP, JSON_Response } from "../x/http"
import { Comment } from "./comment"
import { Contact } from "./contact"

export class Contact_API {
    constructor (
        public http:     HTTP,
        public base_url: string
    ) {}

    private readonly api_url: string = "heimat-core/contacts"
	private readonly api_comments_url = "comments"

	public async fetch_contact(id: number): Promise<Contact> {
		const url = this.url_contact(id)

		const resp: JSON_Response<Contact> = await this.http.get<Contact>(url.toString())
		const body = await resp.body

		return body
	}

	public async fetch_comments(opp_id:number): Promise<Comment[]> {
		const url = this.url_comments(opp_id)
		const resp: JSON_Response<Comment[]> = await this.http.get<Comment[]>(url.toString())
		const body = await resp.body

		return body
	}

	private url_comments(opp_id: number): string {
		const path = [this.api_url, opp_id.toString(), this.api_comments_url].join("/")
		const url = new URL(path, this.base_url)
		return url.toString()
	}

	private url_contact(id: number): string {
		const path = [this.api_url, id.toString()].join("/")
		const url = new URL(path, this.base_url)
		return url.toString()
	}

}