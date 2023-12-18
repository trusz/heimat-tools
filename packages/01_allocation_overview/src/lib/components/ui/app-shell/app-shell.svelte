
<div class="min-h-full">

	<main >
		<div class="_header">
			<slot name="header"></slot>
		</div>

		<div class="sidebar">
			<slot name="sidebar"></slot>
		</div>	

		<div class="content">
			<slot name="content"></slot>"	
		</div>
	</main>

</div>
  
<style>
	main{
		display: grid;
		grid-template-columns: minmax(150px, 25%) 1fr;
		padding: 0;
		margin: 0;
		gap: 2rem;
	}

	.sidebar{
		border: black thin solid;
		padding: 0.5rem;
		border-radius: 4px;
	}

	._header{
		grid-column: 1 / 3;
	}
</style>