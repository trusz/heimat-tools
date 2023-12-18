<script lang="ts">
	import { Employee } from "@heimtools/api"
    import type { Allocation_Map } from "./allocation_map";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import Allocation_Cell from "./allocation_cell.svelte"
	import { filter_context_get } from "../../../filter.ts"
	
	// 
	// INPUT
	// 
	export let employees: Employee[]
	export let allocation_map: Allocation_Map

	const {
		max_occupancy_rate,
		min_occupancy_rate,
		max_occupancy_rate_some_or_every,
		min_occupancy_rate_some_or_every,
		employee,
		project,
	} = filter_context_get()

	$: filtered_employees = filter_employees(
		employees, 
		allocation_map, 
		$max_occupancy_rate, 
		$min_occupancy_rate,
		$max_occupancy_rate_some_or_every,
		$min_occupancy_rate_some_or_every,
		$employee,
		$project,
	)
	
	function filter_employees(
		employees: Employee[], 
		allocation_map: Allocation_Map, 
		max_occupancy_rate: number, 
		min_occupancy_rate: number,
		max_occupancy_rate_some_or_every: "some" | "every",
		min_occupancy_rate_some_or_every: "some" | "every",
		employee: string,
		project: string,
	){ 
		if (!employees) return []

		const filtered_emps =  employees.filter(emp => {

			if(!allocation_map) { return false }

			const allocations = allocation_map[emp.id]
			if(!allocations || allocations?.length === 0) { return false }
			
			let has_under_max_occupancy_rate = false
			let has_over_min_occupancy_rate = false

			if(max_occupancy_rate_some_or_every === "some"){
				has_under_max_occupancy_rate = allocations.some((allocation)=>{
					const occupancy_rate = allocation.project_allocations.reduce((acc, cur) => acc + parseInt(cur.value), 0)
					return occupancy_rate <= max_occupancy_rate
				})
			} else {
				has_under_max_occupancy_rate = allocations.every((allocation)=>{
					const occupancy_rate = allocation.project_allocations.reduce((acc, cur) => acc + parseInt(cur.value), 0)
					return occupancy_rate <= max_occupancy_rate
				})
			}
			
			if(min_occupancy_rate_some_or_every === "some"){
				has_over_min_occupancy_rate = allocations.some((allocation)=>{
					const occupancy_rate = allocation.project_allocations.reduce((acc, cur) => acc + parseInt(cur.value), 0)
					return occupancy_rate >= min_occupancy_rate
				})
			} else {
				has_over_min_occupancy_rate = allocations.every((allocation)=>{
					const occupancy_rate = allocation.project_allocations.reduce((acc, cur) => acc + parseInt(cur.value), 0)
					return occupancy_rate >= min_occupancy_rate
				})
			}


			const name = `${emp.first_name} ${emp.last_name}`
			const name_matches = name.toLocaleLowerCase().includes(employee.toLocaleLowerCase())

			let project_matches = true

			if(project !== ""){
				project_matches = allocations.some((allocation)=>{
					return allocation.project_allocations.some((project_allocation)=>{
						return project_allocation.project_or_task_name.toLocaleLowerCase().includes(project.toLocaleLowerCase())
					})
				})
			}


			let filtered = true
			filtered = filtered && has_under_max_occupancy_rate
			filtered = filtered && has_over_min_occupancy_rate
			filtered = filtered && name_matches
			filtered = filtered && project_matches

			return filtered
		})
		
		return filtered_emps
 	}

	function gather_calendar_weeks(emps: Employee[], allocation_map: Allocation_Map): string[]{

		if(!emps || emps.length === 0 || !allocation_map) return []

		const calendar_weeks: Set<string> = new Set()

		for(const emp of emps){
			const allocation = allocation_map[emp.id]
			if(!allocation) { continue }

			for(const alloc of allocation){
				calendar_weeks.add(alloc.calendar_week)
			}
		}

		return Array.from(calendar_weeks)
	}

	

</script>


<table>
	<thead>
		<tr>
			<th>Employee</th>
			<th>&nbsp;</th>
			{#each gather_calendar_weeks(employees, allocation_map) as calendar_week}
				<th>{calendar_week}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each filtered_employees as emp}
		<!-- {#each employees.slice(0,10) as emp} -->
		<tr>
			<td>
				<Avatar.Root>
					<Avatar.Image src={emp.image} alt="{`${emp.first_name} ${emp.last_name}`}" />
					<!-- <Avatar.Fallback>CN</Avatar.Fallback> -->
				</Avatar.Root>
			</td>

			<td>
				<span>
					<a href={`/core/heimat/employees/${emp.id}/profile`}>
					{emp.first_name} {emp.last_name}
					</a>
				</span> 
			</td>

				
			{#if allocation_map && allocation_map[emp.id]}
			{@const allocations = allocation_map[emp.id]}
			{#each allocations as allocation}
				<td class="allocations">
					<Allocation_Cell allocation={allocation} />
				</td>
			{/each}
			{:else}
				<Skeleton class="h-4 w-[250px]" />
			{/if}
		</tr>
		{/each}
	</tbody>
</table>



<style>

	table{
		width: 100%;
	}

	tr{
		height: 4rem;
	}
	td{
		vertical-align: middle;
	}
	.allocations{
		font-family: monospace;
	}

</style>