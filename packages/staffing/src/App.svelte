<svelte:head>
    <link rel="stylesheet" href={styleURL}>
</svelte:head>


<main>
	<h1>
		Planned Positions
	</h1>


	<span>
		Searching projects {loaded_projects}/{all_projects}
		<div class="progress">
			<div class="progress-bar" role="progressbar" style="width: {progress_percent}%" aria-valuenow="{progress_percent}" aria-valuemin="0" aria-valuemax="100"></div>
		</div>
	</span>

{#if project_details_list.length > 0}
	<table class="table table-bordered">
		<thead>
			<tr>
				<th scope="col">Project</th>
				<th scope="col">Category</th>
				<th scope="col">Role</th>
				<th scope="col">Is Staffed</th>
				<th scope="col">Is Acute</th>
				<th scope="col">Start</th>
				<th scope="col">End</th>
			</tr>
		</thead>
		<tbody>
		{#each project_details_list as project_details}
			{#each project_details.allocations as allocation}
				<tr class={row_style(allocation.is_staffed)}>
					<td>
						<a href={`https://heimat.sprinteins.com/core/heimat/projects/${project_details.id}`}>
							 {project_details.name} 
						</a>
					</td>
					<td>{project_details.priority}</td>
					<td>{allocation.project_role}</td>
					<td>{allocation.is_staffed}</td>
					<td>{acute_icon(allocation.start, allocation.is_staffed)}</td>
					<td>{date_format_iso(allocation.start)}</td>
					<td>{date_format_iso(allocation.end)}</td>
				</tr>
			{/each}
		{/each}
	</tbody>
	</table>
{/if}
</main>

<style>
	@import url("./bootstrap.min.css");
	main{
		margin: 20px;
		/* font-family: monospace; */
	}
	
</style>


<script lang="ts">
    import type { Allocation, Project_Details } from "@heimtools/api";
	// import { date_format_iso } from "../x/date"
	import { date_format_iso } from "@heimtools/api"
	import {api} from "./api"

	// Load our style
	const baseURL = new URL(import.meta.url)
    const cssURL = new URL("style.css", baseURL)
    const styleURL = cssURL.toString()

	let project_details_list: Project_Details[] = []

	let all_projects = 0
	let loaded_projects = 0
	$: progress_percent = all_projects?(loaded_projects / all_projects) * 100:0

	async function init() {
		const projects = await api.fetch_projects()
		projects.sort((a, b) => b.id - a.id)
		all_projects = projects.length
		for(const project of projects) {
			const project_details = await api.fetch_project_details(project.id)
			loaded_projects++
			project_details_list = [...project_details_list, project_details]
		}
	}
	init()

	function acute_icon(start_date: Date, is_staffed: boolean){
		if(is_staffed){
			return "✅"
		}

		const now = new Date().getTime()
		const is_acute = start_date.getTime() <= now
		if(is_acute){
			return "🚨"
		}else{
			return "🔜"
		}
	}

	function category_icon(category: string){
		const default_icon = "？"
		const icon_map: {[cat: string]: string} = {
			"A":"🅐",
			"B":"🄱",
			"C":"Ⓒ",
		}
		const icon = icon_map[category] ?? default_icon
		return icon
	}


	function row_style(is_staffed:boolean){
		if(is_staffed){
			return ""
		}
		return "table-danger"
	}
	
</script>