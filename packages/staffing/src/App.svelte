<svelte:head>
    <link rel="stylesheet" href={styleURL}>
</svelte:head>


<h1>
	Planned Positions
</h1>

{#if project_details_list.length > 0}
	<table>
		<thead>
			<tr>
				<th>Project</th>
				<th>Role</th>
				<th>Is Staffed</th>
			</tr>
		</thead>
	{#each project_details_list as project_details}
		{#each project_details.allocations as allocation}
			<tr style={row_style(allocation.is_staffed)}>
				<td>{project_details.name}</td>
				<td>{allocation.project_role}</td>
				<td>{allocation.is_staffed}</td>
			</tr>
		{/each}
	{/each}
	</table>
{/if}


<style>
	
</style>


<script lang="ts">
    import type { Allocation, Project_Details } from "@heimtools/api";
	import {api} from "./api"
    // import { waitForElement } from "./util";

	// Load our style
	const baseURL = new URL(import.meta.url)
    const cssURL = new URL("style.css", baseURL)
    const styleURL = cssURL.toString()

	const urlAllProjects = "https://heimat.sprinteins.com/heimat-core/projects/overview/"

	let project_details_list: Project_Details[] = []

	async function init() {
		const projects = await api.fetch_projects()
		projects.sort((a, b) => b.id - a.id)
		for(const project of projects) {
			const project_details = await api.fetch_project_details(project.id)
			project_details_list = [...project_details_list, project_details]
		}
	}
	init()


	function row_style(is_staffed:boolean){
		if(is_staffed){
			return "color: green;"
		}
		return "color: red;"
	}
	
</script>