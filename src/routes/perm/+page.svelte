<script lang="ts">
	let { data } = $props();
</script>

<div class="container">
	{#if data.perm}
		<h1>{data.perm.nom}</h1>
		
		<div class="info-box">
			<p class="total-sales">Total des ventes : <strong>{data.perm.total_vente.toFixed(2)} €</strong></p>
			<p>Date : {new Date(data.perm.datee * 1000).toLocaleDateString()}</p>
		</div>

		<div class="actions">
			<a href="/perm/open" class="btn btn-config">
				<span>⚙️</span> Modifier la perm
			</a>
			
			<a href="/perm/bilan" class="btn btn-bilan">
				<span>📊</span> Bilan des perms
			</a>

			<a href="/pos" class="btn btn-pos">
				<span>🍺</span> Accéder au POS
			</a>
		</div>

		{#if data?.history?.length ?? 0 > 0}
			<h2>Historique des 10 dernières opérations :</h2>
			<div class="history-grid">
				{#each data.history as t}
					<div class="history-card">
						<div class="user">{t.prenom} {t.nom}</div>
						<div class="details">
							<span class="qty">{t.nb} x</span>
							<span class="article">{t.article}</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	{:else}
		<h1>Aucune perm active</h1>
		<a href="/perm/open" class="btn btn-primary">Ouvrir une perm</a>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		text-align: center;
	}
	.info-box {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 8px;
		margin: 2rem 0;
		box-shadow: 0 2px 4px rgba(0,0,0,0.1);
	}
	.total-sales {
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}
	.actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}
	.btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 1.5rem;
		width: 100%;
		max-width: 400px;
		text-decoration: none;
		color: white;
		border-radius: 8px;
		font-size: 1.2rem;
		font-weight: bold;
		transition: transform 0.2s;
	}
	.btn:hover {
		transform: translateY(-2px);
	}
	.btn-config { background-color: #6c757d; }
	.btn-bilan { background-color: #17a2b8; }
	.btn-pos { background-color: #28a745; }
	.btn-primary { background-color: #007bff; }

	.history-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.history-card {
		border: 2px solid #c8331e;
		border-radius: 5px;
		padding: 10px;
		color: #c8331e;
		background: white;
		text-align: left;
	}

	.user {
		font-weight: bold;
		margin-bottom: 5px;
	}

	.details {
		display: flex;
		gap: 5px;
	}
</style>
