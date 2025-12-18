<script lang="ts">
	let { data, form } = $props();
</script>

<div class="container">
	<h1>Ouvrir une perm</h1>

	{#if form?.message}
		<p class="error">{form.message}</p>
	{/if}

	<form method="POST">
		<div class="form-group">
			<label for="permTypeId">Select Perm Type:</label>
			<select name="permTypeId" id="permTypeId" required>
				<option value="">-- Select a type --</option>
				{#each data.permTypes as type}
					<option value={type.id}>{type.nom} ({type.annee})</option>
				{/each}
			</select>
		</div>

		<button type="submit" class="btn">Open Perm</button>
	</form>
</div>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
	}
	.form-group {
		margin-bottom: 1.5rem;
	}
	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: bold;
	}
	select {
		width: 100%;
		padding: 0.5rem;
		font-size: 1rem;
	}
	.btn {
		display: inline-block;
		padding: 1rem 2rem;
		background-color: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1.1rem;
	}
	.error {
		color: red;
		margin-bottom: 1rem;
	}
</style>
