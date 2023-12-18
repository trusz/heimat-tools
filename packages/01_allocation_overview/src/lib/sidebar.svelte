<script lang="ts">
	import { Checkbox } from "$lib/components/ui/checkbox";
    import { Label } from "$lib/components/ui/label";
	import { Slider } from "$lib/components/ui/slider";
    import type { Allocation_Map } from "$lib/components/ui/employee_list";
	import { filter_context_get } from "./filter"

	export let allocation_map: Allocation_Map

	let group_by_project = false

	const {
		max_occupancy_rate,
		min_occupancy_rate,
		max_occupancy_rate_some_or_every,
		min_occupancy_rate_some_or_every,
		employee,
		project,
	} = filter_context_get()

	$: projects = gather_projects(allocation_map)

	function gather_projects(allocation_map: Allocation_Map): string[]{
		if(!allocation_map) return []

		const projects: Set<string> = new Set()

		for(const emp_id in allocation_map){
			const allocations = allocation_map[emp_id]

			for(const alloc of allocations){
				for(const project_alloc of alloc.project_allocations){
					projects.add(project_alloc.project_or_task_name)
				}
			}
		}

		return Array.from(projects)
	
	}

</script>

<div>
	Filters

	<div class="toolbar">

		<div>
			<label for="employee-filter">Employee</label>
			<input id="employee-filter" type="text" bind:value={$employee} />
		</div>

		<div class="grid columns-1">
			<label for="project_filter">Employees that are in project:</label>
			<select id="project_filter" bind:value={$project}>
				<option value="">All</option>
				{#each projects as project}
					<option value={project}>{project}</option>
				{/each}
			</select>
			<span class="warning">
				Warning: The allocations are still shown as the sum of all projects not just the filtered one.
			</span>

		</div>

		<div>
			<div class="grid gap-4">
				<div class="flex items-center justify-between">
					<Label for="maxlength">
						Employees that have 
						<select bind:value={$max_occupancy_rate_some_or_every}>
							<option value="some">some</option>
							<option value="every">every</option>
						</select>
						occupancy rate under
					</Label>
					<span
						class="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border"
					>
						{$max_occupancy_rate}%
					</span>
				</div>
				<Slider
					id="max_occupancy_rate"
					max={100}
					min={0}
					bind:value={$max_occupancy_rate}
					step={10}
					aria-label="Maximum Occupancy Rate"
				/>
			</div>
		</div>
		
		<div>
			<div class="grid gap-4">
				<div class="flex items-center justify-between">
					<Label for="min_occupancy_rate">
						Employees that have
						<select bind:value={$min_occupancy_rate_some_or_every}>
							<option value="some">some</option>
							<option value="every">every</option>
						</select>
						occupancy rate over</Label>
					<span
						class="w-12 rounded-md border border-transparent px-2 py-0.5 text-right text-sm text-muted-foreground hover:border-border"
					>
						{$min_occupancy_rate}%
					</span>
				</div>
				<Slider
					id="min_occupancy_rate"
					max={100}
					min={0}
					bind:value={$min_occupancy_rate}
					step={10}
					aria-label="Maximum Occupancy Rate"
				/>
			</div>
		</div>




    </div>
</div>


<style>

	select{
		max-width: 100%;
	}

	input[type="text"] {
		border: 1px solid #ccc;
		border-radius: 4px;
		padding: 0.5rem;
	}

	.warning{
		font-size: 0.75rem;
	}

	.toolbar{
		display: flex;
		flex-direction: column;
		gap:2rem;
	}
</style>