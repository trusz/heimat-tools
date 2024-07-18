<svelte:head>
    <link rel="stylesheet" href={styleURL}>
</svelte:head>



<style>
	
</style>


<script lang="ts">
	import {api} from "./api"
    import { waitForElement } from "./util";

	// Load our style
	const baseURL = new URL(import.meta.url)
    const cssURL = new URL("style.css", baseURL)
    const styleURL = cssURL.toString()

	// API

	async function init(){
		await waitForElement("h6")
		const titleElements = document.querySelectorAll("h6")
		console.log({"level":"debug", msg:"found title elements", titleElements})
	
		for(const titleElement of titleElements){
			const title = titleElement.textContent??""

			const itemRootElement = titleElement.parentElement?.parentElement?.parentElement
			if(!itemRootElement){ continue }

			const linkElement = itemRootElement.querySelector("a")
			if(!linkElement){ continue }
			const link = linkElement.getAttribute("href")??""

			const parent = titleElement.parentElement
			if(!parent){ continue }
	
			const detailParent = parent.nextElementSibling
			if(!detailParent){ continue }
	
			const detailElement = detailParent.querySelector("span")
			if(!detailElement){ continue }
	
			const detail = detailElement.textContent??""

			const newsType = determineType(title)
			if(!newsType){ continue }
	
			const loader = typeLoaderMap[newsType]
			const details = await loader(link)

			const summary_paragraph = itemRootElement.querySelector("h4")
			if(!summary_paragraph){ continue }

			const detail_element = document.createElement("pre")
			detail_element.classList.add("news-detail")
			detail_element.innerHTML = details
			summary_paragraph?.appendChild(detail_element)
			// console.log(detail_element)
			// console.log({"level":"debug", msg:"news items", newsType, title, detail, link, details})
		}

	}
	init()


	enum NewsType {
		CRM_Opp_NewComment = "CRM_Opp_NewComment",
		CRM_Opp_NewProbability = "CRM_Opp_NewProbability",
		CRM_Opp_NewBudget = "CRM_Opp_NewBudget",
		CRM_Opp_NewOwner = "CRM_Opp_NewOwner",
		CRM_Opp_NewStartDate = "CRM_Opp_NewStartDate",
		CRM_Opp_NewDuration = "CRM_Opp_NewDuration", 
		CRM_Contact_NewComment = "CRM_Contact_NewComment",
		CRM_NewContact = "CRM_NewContact",
		CRM_NewOpp = "CRM_NewOpp",
	}

	type DetailLoader = (link:string) => Promise<string>

	async function noopLoader(link:string): Promise<string>{
		return "No details available"
	}

	const typeLoaderMap: {[key in NewsType]: DetailLoader} = {
		[NewsType.CRM_Opp_NewComment]: api.fetch_opportunity_new_comment_details.bind(api),
		[NewsType.CRM_Opp_NewBudget]: api.fetch_opportunity_last_history_change.bind(api, "budget"),
		[NewsType.CRM_Opp_NewOwner]: api.fetch_opportunity_last_history_change.bind(api, "owner"),
		[NewsType.CRM_Opp_NewProbability]: api.fetch_opportunity_new_probability.bind(api),
		[NewsType.CRM_Opp_NewStartDate]: api.fetch_opportunity_last_history_change.bind(api, "start"),
		[NewsType.CRM_Opp_NewDuration]: api.fetch_opportunity_last_history_change.bind(api, "duration"),
		[NewsType.CRM_Contact_NewComment]: api.fetch_contact_new_comment_details.bind(api),
		[NewsType.CRM_NewContact]: api.fetch_contact_new.bind(api),
		[NewsType.CRM_NewOpp]: noopLoader,
	}

	const titleTypeMap: {[key: string]: NewsType} = {
		// EN
		"New opportunity": NewsType.CRM_NewOpp,
		"New comment for opportunity": NewsType.CRM_Opp_NewComment,
		"New probability of occurrence": NewsType.CRM_Opp_NewProbability,
		"Budget change for opportunity": NewsType.CRM_Opp_NewBudget,
		"New contact": NewsType.CRM_NewContact,
		"New comment for contact": NewsType.CRM_Contact_NewComment,
		"New opportunity owner": NewsType.CRM_Opp_NewOwner,
		"New opportunity start date": NewsType.CRM_Opp_NewStartDate,
		// DE
		"Neue Opportunity": NewsType.CRM_NewOpp,
		"Neuer Kommentar bei Opportunity": NewsType.CRM_Opp_NewComment,
		"Neue Eintrittswahrscheinlichkeit": NewsType.CRM_Opp_NewProbability,
		"Budgetänderung bei Opportunity": NewsType.CRM_Opp_NewBudget,
		"Neuer Kontakt": NewsType.CRM_NewContact,
		"Neuer Kommentar bei Kontakt": NewsType.CRM_Contact_NewComment,
		"Neue:r Opportunity Inhaber:in": NewsType.CRM_Opp_NewOwner,
		"Neues Opportunity Startdatum": NewsType.CRM_Opp_NewStartDate,
	}
	function determineType(title: string): NewsType | undefined {
		const type = titleTypeMap[title]
		if(!type){
			// console.error({"level":"error", msg:"could not determine type", title})
			return
		}
		return type
	}


</script>