<script lang="ts">
	import { enhance } from '$app/forms';
	let { data } = $props();
	let activeTab = $state('drinks');
</script>

<div class="container">
	<h1>Manage Products</h1>

	<div class="tabs">
		<button class:active={activeTab === 'drinks'} onclick={() => activeTab = 'drinks'}>Drinks</button>
		<button class:active={activeTab === 'snacks'} onclick={() => activeTab = 'snacks'}>Snacks</button>
	</div>

	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Buying Price</th>
				<th>Selling Price</th>
				<th>Action</th>
			</tr>
		</thead>
		<tbody>
			{#if activeTab === 'drinks'}
				{#each data.drinks as item}
					<tr>
						<td>{item.name}</td>
						<td>{item.prix_achat?.toFixed(2) ?? '-'} €</td>
						<td>
							<form method="POST" action="?/updatePrice" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<input type="hidden" name="type" value="B" />
								<input type="number" step="0.01" name="price" value={item.prix_vente} class="price-input" />
								<button type="submit" class="btn-save">Save</button>
							</form>
						</td>
						<td>
							<!-- Future: Delete/Edit details -->
						</td>
					</tr>
				{/each}
			{:else}
				{#each data.snacks as item}
					<tr>
						<td>{item.name}</td>
						<td>{item.prix_achat?.toFixed(2) ?? '-'} €</td>
						<td>
							<form method="POST" action="?/updatePrice" use:enhance>
								<input type="hidden" name="id" value={item.id} />
								<input type="hidden" name="type" value="C" />
								<input type="number" step="0.01" name="price" value={item.prix_vente} class="price-input" />
								<button type="submit" class="btn-save">Save</button>
							</form>
						</td>
						<td></td>
					</tr>
				{/each}
			{/if}
		</tbody>
	</table>
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
	}
	.tabs {
		display: flex;
		margin-bottom: 1rem;
	}
	.tabs button {
		padding: 1rem 2rem;
		font-size: 1.2rem;
		cursor: pointer;
		background: #eee;
		border: none;
		border-bottom: 2px solid transparent;
	}
	.tabs button.active {
		background: #fff;
		border-bottom: 2px solid #007bff;
		font-weight: bold;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th, td {
		padding: 0.75rem;
		border-bottom: 1px solid #ddd;
		text-align: left;
	}
	th {
		background-color: #f8f9fa;
	}
	.price-input {
		width: 80px;
		padding: 0.25rem;
	}
	.btn-save {
		padding: 0.25rem 0.5rem;
		background-color: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
