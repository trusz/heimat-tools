<script lang="ts">
	export let value: number
	export let max: number
	export let min: number
	export let step: number
</script>

<input 
	type="range" 
	bind:value
	{min}
	{max}
	{step}
/>