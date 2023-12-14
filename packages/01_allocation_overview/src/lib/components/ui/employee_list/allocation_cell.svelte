<script lang="ts">
	import { Allocation } from "@heimtools/api"

	// 
	// INPUT
	// 
	export let allocation: Allocation


	$: value = allocation.project_allocations.reduce((acc, cur) => acc + parseInt(cur.value), 0)
	$: shadow_size = `${(2/100) * value}rem`

</script>

{#if allocation}
	<span style:--shadow-size={shadow_size}>  
		<span class="value">
			{value}% 
		</span>
			
		<!-- ({allocation.project_allocations.length}) -->
	</span>
{/if}

<style>
	span{
		display: inline-grid;
		text-shadow: 0px 0px 2px white;
		place-content: center;
		width: 4rem;
		height: 4rem;
		box-shadow: inset 0 0 0 var(--shadow-size, 0px) green;
		border: black thin solid;
	}

	span:hover .value{
		opacity: 1;
	}

	.value{
		/* opacity: 0; */
	}
</style>