<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	{#if data.isUserStats}
		<h1>Statistics for {data.user.prenom} {data.user.nom}</h1>

		<div class="chart-section">
			<h2>Consumption by Type</h2>
			<table>
				<thead>
					<tr>
						<th>Type</th>
						<th>Count</th>
					</tr>
				</thead>
				<tbody>
					{#each data.consumptionByType as item}
						<tr>
							<td>{item.type}</td>
							<td>{item.count}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<div class="chart-section">
			<h2>Top 5 Drinks</h2>
			<table>
				<thead>
					<tr>
						<th>Drink</th>
						<th>Count</th>
					</tr>
				</thead>
				<tbody>
					{#each data.topDrinks as item}
						<tr>
							<td>{item.nom}</td>
							<td>{item.count}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<h1>Global Statistics</h1>

		<div class="stats-grid">
			<div class="stat-card">
				<h2>Total Revenue</h2>
				<p class="value">{data.totalRevenue.toFixed(2)} €</p>
			</div>
			<div class="stat-card">
				<h2>Total Volume Sold</h2>
				<p class="value">{data.totalVolume.toFixed(2)} L</p>
			</div>
		</div>

		<div class="chart-section">
			<h2>Top 10 Drinks</h2>
			<table>
				<thead>
					<tr>
						<th>Rank</th>
						<th>Product</th>
						<th>Quantity Sold</th>
					</tr>
				</thead>
				<tbody>
					{#each data.topDrinks as drink, i}
						<tr>
							<td>{i + 1}</td>
							<td>{drink.nom_contenu} ({drink.nom_contenant})</td>
							<td>{drink.total_sold}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 2rem;
		margin-bottom: 3rem;
	}
	.stat-card {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 8px;
		text-align: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}
	.stat-card h2 {
		margin-top: 0;
		font-size: 1.2rem;
		color: #666;
	}
	.stat-card .value {
		font-size: 2.5rem;
		font-weight: bold;
		color: #007bff;
		margin: 0;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th,
	td {
		padding: 1rem;
		border-bottom: 1px solid #eee;
		text-align: left;
	}
	th {
		background-color: #f8f9fa;
	}
</style>
