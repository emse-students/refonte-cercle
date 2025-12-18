<script lang="ts">
	let { data } = $props();

	function formatPrice(price: number) {
		const absPrice = Math.abs(price);
		const sign = price < 0 ? '-' : '+';
		return `${sign} ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(absPrice)}`;
	}

	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('fr-FR', { 
			day: '2-digit', month: '2-digit', year: '2-digit', 
			hour: '2-digit', minute: '2-digit' 
		}).format(date);
	}
</script>

<div class="page">
	{#if data.targetUser}
		<h1>Compte de {data.targetUser.prenom} {data.targetUser.nom}</h1>
		<div class="info-box">
			<p><strong>Solde:</strong> <span class:negative={data.targetUser.solde < 0}>{formatPrice(data.targetUser.solde)}</span></p>
			<p><strong>Promo:</strong> {data.targetUser.promo}</p>
			<p><strong>Login:</strong> {data.targetUser.login}</p>
		</div>
	{:else}
		<h1>Historique Global</h1>
	{/if}

	<table class="transactions">
		<thead>
			<tr>
				<th>Date</th>
				{#if data.isGlobal}
					<th>Utilisateur</th>
				{/if}
				<th>Perm</th>
				<th>Article</th>
				<th>Quantité</th>
				<th>Prix</th>
			</tr>
		</thead>
		<tbody>
			{#each data.transactions as t}
				<tr>
					<td>{formatDate(t.date)}</td>
					{#if data.isGlobal}
						<td>{t.prenom} {t.nom}</td>
					{/if}
					<td>{t.perm_nom || 'N/A'}</td>
					<td>{t.item_nom}</td>
					<td>{t.nb}</td>
					<td class:negative={t.prix < 0} class:positive={t.prix > 0}>
						{formatPrice(t.prix)}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.page {
		padding: 20px;
		max-width: 1000px;
		margin: 0 auto;
	}

	.info-box {
		background: #f8f9fa;
		padding: 15px;
		border-radius: 5px;
		margin-bottom: 20px;
		border: 1px solid #ddd;
	}

	.transactions {
		width: 100%;
		border-collapse: collapse;
	}

	.transactions th, .transactions td {
		padding: 10px;
		text-align: left;
		border-bottom: 1px solid #eee;
	}

	.negative { color: red; }
	.positive { color: green; }
</style>
