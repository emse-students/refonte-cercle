<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data, form } = $props();

	let searchQuery = $state('');
	let selectedUser = $state<any>(null);
	let cart = $state<any[]>([]);
	let activeTab = $state('drinks'); // 'drinks' or 'snacks'

	// Filter users
	let filteredUsers = $derived(
		searchQuery.length > 1 
			? data.users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.login.includes(searchQuery))
			: []
	);

	function addToCart(item: any) {
		const existing = cart.find(i => i.id === item.id && i.type === item.type);
		if (existing) {
			existing.quantity++;
		} else {
			cart.push({ ...item, quantity: 1, price: item.prix_vente });
		}
		// Trigger reactivity (push doesn't always trigger in Svelte 5 proxies if deep? No, $state array should work)
		// But to be safe/explicit with runes:
		cart = [...cart];
	}

	function removeFromCart(index: number) {
		cart.splice(index, 1);
		cart = [...cart];
	}

	let total = $derived(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0));

	function selectUser(user: any) {
		selectedUser = user;
		searchQuery = '';
	}

	function clearCart() {
		cart = [];
		selectedUser = null;
	}
</script>

<div class="pos-container">
	<div class="products-section">
		<div class="tabs">
			<button class:active={activeTab === 'drinks'} onclick={() => activeTab = 'drinks'}>Drinks</button>
			<button class:active={activeTab === 'snacks'} onclick={() => activeTab = 'snacks'}>Snacks</button>
		</div>

		<div class="product-grid">
			{#if activeTab === 'drinks'}
				{#each data.drinks as drink}
					<button class="product-card" onclick={() => addToCart(drink)}>
						<div class="name">{drink.name}</div>
						<div class="price">{drink.prix_vente.toFixed(2)} €</div>
					</button>
				{/each}
			{:else}
				{#each data.snacks as snack}
					<button class="product-card" onclick={() => addToCart(snack)}>
						<div class="name">{snack.name}</div>
						<div class="price">{snack.prix_vente.toFixed(2)} €</div>
					</button>
				{/each}
			{/if}
		</div>
	</div>

	<div class="cart-section">
		<div class="perm-info">
			<h2>Perm: {data.perm.nom}</h2>
		</div>

		<div class="user-selection">
			{#if selectedUser}
				<div class="selected-user">
					<h3>Customer: {selectedUser.name}</h3>
					<p>Balance: {selectedUser.solde.toFixed(2)} €</p>
					<button class="btn-small" onclick={() => selectedUser = null}>Change</button>
				</div>
			{:else}
				<input 
					type="text" 
					placeholder="Search user..." 
					bind:value={searchQuery}
					class="search-input"
				/>
				{#if filteredUsers.length > 0}
					<ul class="user-results">
						{#each filteredUsers as user}
							<li>
								<button onclick={() => selectUser(user)}>
									{user.name} ({user.solde.toFixed(2)} €)
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			{/if}
		</div>

		<div class="cart-items">
			<h3>Cart</h3>
			{#if cart.length === 0}
				<p class="empty-cart">Cart is empty</p>
			{:else}
				<ul>
					{#each cart as item, i}
						<li>
							<span>{item.name} x {item.quantity}</span>
							<span>{(item.price * item.quantity).toFixed(2)} €</span>
							<button class="btn-remove" onclick={() => removeFromCart(i)}>X</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<div class="cart-total">
			<h3>Total: {total.toFixed(2)} €</h3>
		</div>

		<form 
			method="POST" 
			action="?/transaction" 
			use:enhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						clearCart();
						alert('Transaction successful!');
					} else if (result.type === 'failure') {
						alert('Transaction failed: ' + result.data?.message);
					}
				};
			}}
		>
			<input type="hidden" name="userId" value={selectedUser?.id_user} />
			<input type="hidden" name="permId" value={data.perm.id} />
			<input type="hidden" name="cart" value={JSON.stringify(cart.map(i => ({
				id: i.id,
				type: i.type,
				price: i.price,
				quantity: i.quantity,
				volume: i.volume
			})))} />

			<button 
				type="submit" 
				class="btn-pay" 
				disabled={!selectedUser || cart.length === 0}
			>
				PAY
			</button>
		</form>
	</div>
</div>

<style>
	.pos-container {
		display: flex;
		height: calc(100vh - 60px); /* Adjust based on header */
		gap: 1rem;
		padding: 1rem;
	}
	.products-section {
		flex: 2;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
	}
	.cart-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: #f8f9fa;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #ddd;
	}
	.tabs {
		display: flex;
		margin-bottom: 1rem;
	}
	.tabs button {
		flex: 1;
		padding: 1rem;
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
	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 1rem;
		overflow-y: auto;
	}
	.product-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
		cursor: pointer;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100px;
		transition: transform 0.1s;
	}
	.product-card:active {
		transform: scale(0.98);
	}
	.product-card .name {
		font-weight: bold;
	}
	.product-card .price {
		color: #28a745;
		font-weight: bold;
	}
	.search-input {
		width: 100%;
		padding: 0.5rem;
		font-size: 1rem;
		margin-bottom: 0.5rem;
	}
	.user-results {
		list-style: none;
		padding: 0;
		max-height: 200px;
		overflow-y: auto;
		background: white;
		border: 1px solid #ddd;
	}
	.user-results button {
		width: 100%;
		text-align: left;
		padding: 0.5rem;
		border: none;
		background: none;
		cursor: pointer;
	}
	.user-results button:hover {
		background: #f0f0f0;
	}
	.cart-items {
		flex: 1;
		overflow-y: auto;
		margin: 1rem 0;
	}
	.cart-items ul {
		list-style: none;
		padding: 0;
	}
	.cart-items li {
		display: flex;
		justify-content: space-between;
		padding: 0.5rem 0;
		border-bottom: 1px solid #eee;
	}
	.btn-remove {
		background: #dc3545;
		color: white;
		border: none;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		cursor: pointer;
		margin-left: 0.5rem;
	}
	.cart-total {
		font-size: 1.5rem;
		font-weight: bold;
		text-align: right;
		margin-bottom: 1rem;
	}
	.btn-pay {
		width: 100%;
		padding: 1.5rem;
		font-size: 1.5rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 8px;
		cursor: pointer;
	}
	.btn-pay:disabled {
		background: #ccc;
		cursor: not-allowed;
	}
	.btn-small {
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
		cursor: pointer;
	}
</style>
