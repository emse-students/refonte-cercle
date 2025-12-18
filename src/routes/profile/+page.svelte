<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	<h1>My Profile</h1>

	<div class="balance-card">
		<h2>Current Balance</h2>
		<p class="balance" class:negative={data.user.solde < 0}>
			{data.user.solde.toFixed(2)} €
		</p>
	</div>

	<div class="history-section">
		<h2>Recent Transactions</h2>
		<table>
			<thead>
				<tr>
					<th>Date</th>
					<th>Description</th>
					<th>Amount</th>
				</tr>
			</thead>
			<tbody>
				{#each data.transactions as t}
					<tr>
						<td>{new Date(t.datee * 1000).toLocaleString()}</td>
						<td>
							{t.label}
							{#if t.nb > 1}
								x {t.nb}
							{/if}
						</td>
						<td class={t.prix > 0 ? 'positive' : 'negative'}>
							{t.prix > 0 ? '+' : ''}{t.prix.toFixed(2)} €
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}
	.balance-card {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 8px;
		text-align: center;
		margin-bottom: 2rem;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
	.balance {
		font-size: 3rem;
		font-weight: bold;
		color: #28a745;
		margin: 0;
	}
	.balance.negative {
		color: #dc3545;
	}
	table {
		width: 100%;
		border-collapse: collapse;
	}
	th, td {
		padding: 1rem;
		border-bottom: 1px solid #eee;
		text-align: left;
	}
	th {
		background-color: #f8f9fa;
	}
	.positive { color: #28a745; font-weight: bold; }
	.negative { color: #dc3545; font-weight: bold; }
</style>
