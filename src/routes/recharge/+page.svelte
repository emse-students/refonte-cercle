<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();

	let searchQuery = $state('');
	let selectedUser = $state<any>(null);

	let filteredUsers = $derived(
		searchQuery.length > 1
			? data.users.filter(
					(u: any) =>
						u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
						u.login.includes(searchQuery)
				)
			: []
	);

	function selectUser(user: any) {
		selectedUser = user;
		searchQuery = '';
	}

	function reset() {
		selectedUser = null;
		searchQuery = '';
	}
</script>

<div class="container">
	<h1>Rechargement de compte</h1>

	{#if form?.message}
		<div class={form.success ? 'alert success' : 'alert error'}>
			{form.message}
		</div>
	{/if}

	<div class="recharge-box">
		{#if !selectedUser}
			<div class="search-section">
				<label for="search">Client :</label>
				<input
					type="text"
					id="search"
					placeholder="Tapez le nom du client"
					bind:value={searchQuery}
					class="search-input"
					autocomplete="off"
				/>

				{#if filteredUsers.length > 0}
					<ul class="results">
						{#each filteredUsers as user}
							<li>
								<button onclick={() => selectUser(user)}>
									{user.name}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>
		{:else}
			<div class="form-section">
				<h2>Client : {selectedUser.name}</h2>
				<p>Solde actuel : <strong>{selectedUser.solde.toFixed(2)} €</strong></p>

				<form
					method="POST"
					use:enhance={() => {
						return async ({ update, result }) => {
							await update();
							if (result.type === 'success') {
								reset();
							}
						};
					}}
				>
					<input type="hidden" name="userId" value={selectedUser.id_user} />

					<div class="form-group">
						<label for="amount">Montant (€) :</label>
						<input
							type="number"
							step="0.01"
							name="amount"
							id="amount"
							required
							min="0.01"
							class="amount-input"
						/>
					</div>

					<div class="quick-amounts">
						<button
							type="button"
							onclick={() => ((document.getElementById('amount') as HTMLInputElement).value = '5')}
							>5 €</button
						>
						<button
							type="button"
							onclick={() => ((document.getElementById('amount') as HTMLInputElement).value = '10')}
							>10 €</button
						>
						<button
							type="button"
							onclick={() => ((document.getElementById('amount') as HTMLInputElement).value = '20')}
							>20 €</button
						>
						<button
							type="button"
							onclick={() => ((document.getElementById('amount') as HTMLInputElement).value = '50')}
							>50 €</button
						>
					</div>

					<div class="actions">
						<button type="submit" class="btn-confirm">Valider</button>
						<button type="button" class="btn-cancel" onclick={reset}>Annuler</button>
					</div>
				</form>
			</div>
		{/if}
	</div>
</div>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
	}
	.recharge-box {
		background: #f8f9fa;
		padding: 2rem;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		min-height: 300px;
	}
	.search-input {
		width: 100%;
		padding: 1rem;
		font-size: 1.2rem;
		margin-top: 0.5rem;
	}
	.results {
		list-style: none;
		padding: 0;
		margin-top: 0.5rem;
		border: 1px solid #ddd;
		background: white;
		max-height: 200px;
		overflow-y: auto;
	}
	.results button {
		width: 100%;
		text-align: left;
		padding: 0.75rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 1.1rem;
	}
	.results button:hover {
		background: #f0f0f0;
	}
	.amount-input {
		width: 100%;
		padding: 1rem;
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}
	.quick-amounts {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.quick-amounts button {
		flex: 1;
		padding: 0.75rem;
		cursor: pointer;
		background: #e9ecef;
		border: 1px solid #ced4da;
		border-radius: 4px;
	}
	.actions {
		display: flex;
		gap: 1rem;
	}
	.btn-confirm {
		flex: 2;
		padding: 1rem;
		background: #28a745;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1.2rem;
		cursor: pointer;
	}
	.btn-cancel {
		flex: 1;
		padding: 1rem;
		background: #dc3545;
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 1.2rem;
		cursor: pointer;
	}
	.alert {
		padding: 1rem;
		margin-bottom: 1rem;
		border-radius: 4px;
		text-align: center;
	}
	.success {
		background: #d4edda;
		color: #155724;
	}
	.error {
		background: #f8d7da;
		color: #721c24;
	}
</style>
