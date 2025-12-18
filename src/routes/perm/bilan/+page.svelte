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
	<h1>Bilan des perms</h1>
	
	<div class="list">
		{#each data.perms as perm}
			<a href="/perm/bilan/{perm.id}" class="perm-item">
				<div class="left">
					<span class="name">{perm.nom}</span>
					<span class="date">du {formatDate(perm.date)}</span>
				</div>
				<div class="right">
					<span class="price">{formatPrice(perm.total_vente)}</span>
					<span class="volume">{perm.total_litre} L</span>
				</div>
			</a>
		{/each}
	</div>
</div>

<style>
	.page {
		padding: 20px;
		max-width: 800px;
		margin: 0 auto;
	}
	
	.list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	
	.perm-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		background: #f8f9fa;
		border: 1px solid #ddd;
		border-radius: 5px;
		text-decoration: none;
		color: inherit;
		transition: background 0.2s;
	}
	
	.perm-item:hover {
		background: #e9ecef;
	}
	
	.left {
		display: flex;
		flex-direction: column;
	}
	
	.name {
		font-weight: bold;
		font-size: 1.1em;
	}
	
	.date {
		color: #666;
		font-size: 0.9em;
	}
	
	.right {
		text-align: right;
	}
	
	.price {
		display: block;
		font-weight: bold;
		color: green;
	}
	
	.volume {
		color: #666;
		font-size: 0.9em;
	}
</style>
