<script lang="ts">
	import { Employee } from "@heimtools/api"
    import type { Allocation_Map } from "./allocation_map";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Skeleton } from "$lib/components/ui/skeleton";
	import Allocation_Cell from "./allocation_cell.svelte"
	
	
	export let employees: Employee[]
	export let allocation_map: Allocation_Map

	function gather_calendar_weeks(emps: Employee[], allocation_map: Allocation_Map): string[]{
		if(emps.langth === 0 || !allocation_map) return []

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
		{#each employees as emp}
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