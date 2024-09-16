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
			<div class="progress-bar" role="progressbar" style="width: {progress_precent}%" aria-valuenow="{progress_precent}" aria-valuemin="0" aria-valuemax="100"></div>
		</div>
	</span>

{#if project_details_list.length > 0}
	<table class="table table-bordered">
		<thead>
			<tr>
				<th scope="col">Project</th>
				<th scope="col">Role</th>
				<th scope="col">Is Staffed</th>
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
					<td>{allocation.project_role}</td>
					<td>{allocation.is_staffed}</td>
				</tr>
			{/each}
		{/each}
	</tbody>
	</table>
{/if}
</main>

<style>
	main{
		margin: 20px;
	}
</style>


<script lang="ts">
    import type { Allocation, Project_Details } from "@heimtools/api";
	import {api} from "./api"
	import "./bootstrap.min.css"
    // import { waitForElement } from "./util";

	// Load our style
	const baseURL = new URL(import.meta.url)
    const cssURL = new URL("style.css", baseURL)
    const styleURL = cssURL.toString()

	let project_details_list: Project_Details[] = []

	let all_projects = 0
	let loaded_projects = 0
	$: progress_precent = all_projects?(loaded_projects / all_projects) * 100:0

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


	function row_style(is_staffed:boolean){
		if(is_staffed){
			return ""
		}
		return "table-danger"
	}
	
</script>