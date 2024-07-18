import { 
	Opportunity_API, 
	Contact_API,
	HTTP, 
	Auth_Module, 
	probability_text_to_percent	,
	type RevisionProperty,
} from "@heimtools/api"

export class API {
	private opp_api: Opportunity_API
	private contact_api: Contact_API

	public constructor () {	
		const auth = new Auth_Module()
		const jwt = auth.jwt_get()
		const http_module = new HTTP(jwt)
		this.opp_api = new Opportunity_API(http_module, window.location.origin)
		this.contact_api = new Contact_API(http_module, window.location.origin)
	}



	public async fetch_contact_new_comment_details(link: string): Promise<string> {
		const id = this.extract_id_from_link(link)
		const contact = await this.contact_api.fetch_contact(id)
		const comments = await this.contact_api.fetch_comments(id)
		const name = [contact.salutation, contact.title, contact.firstName, contact.lastName].filter(Boolean).join(" ")
		const detail = `${name}:\n${comments[0].comment}`
		return detail
	}

	public async fetch_contact_new(link:string): Promise<string> {

		const id = this.extract_id_from_link(link)
		const contact = await this.contact_api.fetch_contact(id)
		const name = [contact.salutation, contact.title, contact.firstName, contact.lastName].filter(Boolean).join(" ")
		return name
	}

	public async fetch_opportunity_new_comment_details(link: string): Promise<string> {
		const id = this.extract_id_from_link(link)
		const comments = await this.opp_api.fetch_comments(id) 
		
		return comments[0].comment
	}

	public async fetch_opportunity_last_history_change(property: string, link:string ): Promise<string>{
		const id = this.extract_id_from_link(link)
		const historyItems = await this.opp_api.fetch_history(id)

		// find owner revision
		let wantedRevision: RevisionProperty | undefined
		history_loop: for(const item of historyItems){
			for(const revisions of item.revisionProperties){
				if(revisions.property === property){
					wantedRevision = revisions
					break history_loop
				}
			}
		}

		const detail = `${wantedRevision?.oldValue} => ${wantedRevision?.newValue}`

		return detail
	}

	public async fetch_opportunity_new_probability(link: string): Promise<string>{
		const id = this.extract_id_from_link(link)
		const historyItems = await this.opp_api.fetch_history(id)

		// find owner revision
		let wantedRevision: RevisionProperty | undefined
		history_loop: for(const item of historyItems){
			for(const revisions of item.revisionProperties){
				if(revisions.property === "probability"){
					wantedRevision = revisions
					break history_loop
				}
			}
		}
		if (!wantedRevision) { return "no details available" }

		const oldValue = probability_text_to_percent[wantedRevision.oldValue]
		const newValue = probability_text_to_percent[wantedRevision.newValue]

		const detail = `${oldValue}% => ${newValue}%`

		return detail
	
	}

	// example link: /crm/opportunities/297
	private extract_id_from_link(link: string): number{
		const parts = link.split("/")
		const id = parts[parts.length - 1]
		return parseInt(id)
	}
}

export const api = new API()

