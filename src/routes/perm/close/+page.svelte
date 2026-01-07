<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	{#if data.perm}
		<h1>Bilan Perm: {data.perm.nom}</h1>
		<p>Date: {new Date(data.perm.datee * 1000).toLocaleDateString()}</p>

		<table>
			<thead>
				<tr>
					<th>Product</th>
					<th>Type</th>
					<th>Quantity</th>
					<th>Volume (L)</th>
					<th>Total Sales (€)</th>
				</tr>
			</thead>
			<tbody>
				{#each data.stats as item}
					<tr>
						<td>{item.nom}</td>
						<td>{item.type}</td>
						<td>{item.total_nb}</td>
						<td>{item.type !== 'C' ? item.volume.toFixed(2) : '-'}</td>
						<td>{item.total_prix.toFixed(2)}</td>
					</tr>
				{/each}
			</tbody>
			<tfoot>
				<tr>
					<td colspan="4" style="text-align: right; font-weight: bold;">Total:</td>
					<td style="font-weight: bold;">
						{data.stats.reduce((acc, item) => acc + item.total_prix, 0).toFixed(2)} €
					</td>
				</tr>
			</tfoot>
		</table>

		<div class="actions">
			<a href="/" class="btn">Back to Home</a>
		</div>
	{:else}
		<p>No active perm found.</p>
		<a href="/perm/open" class="btn">Open a Perm</a>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}
	th,
	td {
		padding: 0.75rem;
		border-bottom: 1px solid #ddd;
		text-align: left;
	}
	th {
		background-color: #f8f9fa;
	}
	.actions {
		margin-top: 2rem;
		text-align: center;
	}
	.btn {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background-color: #007bff;
		color: white;
		text-decoration: none;
		border-radius: 4px;
	}
</style>
