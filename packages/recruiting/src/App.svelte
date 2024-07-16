<svelte:head>
    <link rel="stylesheet" href={styleURL}>
</svelte:head>


<main>
	<ul>
		{#each Object.values(statusConfigs) as status }
			{@const cssClass = status.selected?"":"a-button--accent"}
			<li>
				<!-- 
					we key the selected state so the "a" tag
					does not get the focus state, because it has 
					styles I don't want
				 -->
				{#key status.selected}
				<a class={`a-button ${cssClass}`} on:click|preventDefault={() => toggle(status)} href="_">
					<span>{status.name}</span>
				</a>
				{/key}
			</li>
		{/each}
	</ul>
</main>

<style>
  ul{
	list-style-type: none;
	padding: 0;
	display: flex;
	flex-direction: row;
	gap:0.5rem;
  }
  a{
	font-size: 0.9rem;
	padding: 0.2rem 0.5rem;
	margin: 0;
	transition: none;
  }
  
</style>


<script lang="ts">


	const baseURL = new URL(import.meta.url)
    const cssURL = new URL("style.css", baseURL)
    const styleURL = cssURL.toString()

	function toggle(status: StatusObj){
		if(!status){ return }

		status.selected = !status.selected
		statusConfigs = {...statusConfigs}
	}

	$: filterRows(statusConfigs)
	function filterRows(statuses: StatusConfig){
		const rows = Array.from( document.querySelectorAll(".v-applicants__applicant__content") ) as HTMLElement[]
		for(let row of rows){
			const statusCell = row.querySelector(".l-applicant-card__applicant__statusinterview")
			if(!statusCell){ continue }
			const rowStatus = statusCell.textContent??""
			const normalizedRowStatus = rowStatus.toLocaleLowerCase().trim()

			const config = determineConfig(statuses, normalizedRowStatus)
			if(!config){
				console.error({"level":"error", msg:"could not determine config", row, normalizedRowStatus})
			}
			if(config.selected){
				row.style.display = "block"
			}else{
				row.style.display = "none"
			}
		}

	}


	

	type StatusObj = {
		name: string
		selected: boolean
		key: Status
	}
	enum Status {
		Reject = "Reject",
		PhoneInterview = "PhoneInterview",
		Interview = "Interview",
		Hospitation = "Hospitation"
	}

	let statusConfigs: {[key in Status]: StatusObj} = {
		Reject: {name: "Reject", selected: true, key: Status.Reject},
		PhoneInterview: {name: "Phone Interview", selected: true, key: Status.PhoneInterview},
		Interview: {name: "Interview", selected: true, key: Status.Interview},
		Hospitation: {name: "Hospitation", selected: true, key: Status.Hospitation},
	}
	type StatusConfig = typeof statusConfigs

	const rowStatusStatusObjMap: {[key: string]: Status} = {
		"reject": Status.Reject,
		"phone interview": Status.PhoneInterview,
		"interview": Status.Interview,
		"hospitation": Status.Hospitation
	}
	function determineConfig(configs: StatusConfig, byRowStatus: string): StatusObj{
		const status = rowStatusStatusObjMap[byRowStatus.toLocaleLowerCase().trim()]

		return configs[status]
	}


</script>