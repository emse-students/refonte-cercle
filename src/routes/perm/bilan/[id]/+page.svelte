<script lang="ts">
	let { data } = $props();

	function formatPrice(price: number) {
		return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
	}

	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('fr-FR', { 
			day: '2-digit', month: '2-digit', year: '2-digit'
		}).format(date);
	}
</script>

<div class="page">
	<div class="header">
		<h1>{data.perm.nom}</h1>
		<p>{formatDate(data.perm.date)}</p>
	</div>

	<div class="summary">
		<div class="card">
			<h3>Total Vente</h3>
			<p class="value">{formatPrice(data.perm.total_vente)}</p>
		</div>
		<div class="card">
			<h3>Total Litres</h3>
			<p class="value">{data.perm.total_litre} L</p>
		</div>
	</div>

	{#if data.drinks.length > 0}
		<h2>Boissons Vendues</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Nom</th>
					<th>Contenant</th>
					<th>Quantité</th>
					<th>Total</th>
				</tr>
			</thead>
			<tbody>
				{#each data.drinks as item}
					<tr>
						<td>{item.nom}</td>
						<td>{item.contenant}</td>
						<td>{item.nb}</td>
						<td>{formatPrice(item.total_prix)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	{#if data.freeDrinks.length > 0}
		<h2>Boissons Offertes</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Nom</th>
					<th>Contenant</th>
					<th>Quantité</th>
					<th>Total (Valeur)</th>
				</tr>
			</thead>
			<tbody>
				{#each data.freeDrinks as item}
					<tr>
						<td>{item.nom}</td>
						<td>{item.contenant}</td>
						<td>{item.nb}</td>
						<td>{formatPrice(item.total_prix)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}

	{#if data.snacks.length > 0}
		<h2>Consommables</h2>
		<table class="table">
			<thead>
				<tr>
					<th>Nom</th>
					<th>Quantité</th>
					<th>Total</th>
				</tr>
			</thead>
			<tbody>
				{#each data.snacks as item}
					<tr>
						<td>{item.nom}</td>
						<td>{item.nb}</td>
						<td>{formatPrice(item.total_prix)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>

<style>
	.page {
		padding: 20px;
		max-width: 800px;
		margin: 0 auto;
	}
	
	.header {
		text-align: center;
		margin-bottom: 30px;
	}
	
	.summary {
		display: flex;
		gap: 20px;
		margin-bottom: 30px;
	}
	
	.card {
		flex: 1;
		background: #f8f9fa;
		padding: 20px;
		border-radius: 8px;
		text-align: center;
		border: 1px solid #ddd;
	}
	
	.value {
		font-size: 1.5em;
		font-weight: bold;
		color: #333;
	}
	
	.table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 30px;
	}
	
	.table th, .table td {
		padding: 10px;
		text-align: left;
		border-bottom: 1px solid #eee;
	}
	
	h2 {
		margin-top: 20px;
		border-bottom: 2px solid #eee;
		padding-bottom: 10px;
	}
</style>
