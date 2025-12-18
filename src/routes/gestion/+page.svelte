<script lang="ts">
	import { enhance } from '$app/forms';
	
	let { data } = $props();
	
	let activeSection = $state<string | null>(null);
	
	function toggle(section: string) {
		if (activeSection === section) {
			activeSection = null;
		} else {
			activeSection = section;
		}
	}

	// Search states
	let boissonSearch = $state('');
	let compteSearch = $state('');
	let permSearch = $state('');
	let newUserSearch = $state('');

	// Selected items
	let selectedBoisson = $state<any>(null);
	let selectedUser = $state<any>(null);

	// Derived
	let filteredBoissons = $derived(
		data.contenus.filter(c => c.nom.toLowerCase().includes(boissonSearch.toLowerCase()))
	);

	let filteredUsers = $derived(
		data.users.filter(u => 
			(u.nom?.toLowerCase().includes(compteSearch.toLowerCase()) || 
			 u.prenom?.toLowerCase().includes(compteSearch.toLowerCase()) ||
			 u.login?.toLowerCase().includes(compteSearch.toLowerCase()))
		)
	);

	let filteredPerms = $derived(
		data.perms.filter(p => p.nom.toLowerCase().includes(permSearch.toLowerCase()))
	);

	function formatPrice(price: number) {
		return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
	}
</script>

<div class="page">
	<h1>Gestion</h1>
	
	<div class="center-container">
		
		<!-- Boissons -->
		<div class="accordion" class:active={activeSection === 'boissons'} onclick={() => toggle('boissons')}>
			<div class="icon">{activeSection === 'boissons' ? '▼' : '▶'}</div>
			<div class="title">Boissons</div>
		</div>
		{#if activeSection === 'boissons'}
			<div class="screen">
				<div class="form-row">
					<label>Nom de la boisson :</label>
					<div class="search-container">
						<input type="text" placeholder="Taper le nom d'une boisson" bind:value={boissonSearch} />
						{#if boissonSearch && !selectedBoisson}
							<div class="autocomplete">
								{#each filteredBoissons as item}
									<div class="autocomplete-item" onclick={() => { selectedBoisson = item; boissonSearch = ''; }}>
										{item.nom}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>

				{#if selectedBoisson}
					<div class="details">
						<h2>{selectedBoisson.nom}</h2>
						<div class="form-row">
							<label>Type:</label>
							<span>{selectedBoisson.type}</span>
						</div>
						<div class="form-row">
							<label>Degré:</label>
							<span>{selectedBoisson.degre}°</span>
						</div>
						
						<h3>Contenants</h3>
						{#each selectedBoisson.contenants as contenant}
							<div class="contenant-row">
								<span>{contenant.nom}</span>
								<span>{formatPrice(contenant.prix_vente)}</span>
							</div>
						{/each}
						
						<button onclick={() => selectedBoisson = null}>Fermer</button>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Contenants -->
		<div class="accordion" class:active={activeSection === 'contenants'} onclick={() => toggle('contenants')}>
			<div class="icon">{activeSection === 'contenants' ? '▼' : '▶'}</div>
			<div class="title">Contenants</div>
		</div>
		{#if activeSection === 'contenants'}
			<div class="screen">
				{#each data.contenants as contenant}
					<div class="list-item">
						<input type="text" value={contenant.nom} />
						<input type="number" value={contenant.capacite} step="0.01" /> L
						<select value={contenant.type}>
							<option value="fut">Fût</option>
							<option value="bouteille_unique">Bouteille vendue entière</option>
							<option value="bouteille_partage">Bouteille servie en eco cup</option>
							<option value="cubi">Cubi</option>
							<option value="verre">Eco Cup</option>
						</select>
						<button>Modifier</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Comptes -->
		<div class="accordion" class:active={activeSection === 'comptes'} onclick={() => toggle('comptes')}>
			<div class="icon">{activeSection === 'comptes' ? '▼' : '▶'}</div>
			<div class="title">Comptes</div>
		</div>
		{#if activeSection === 'comptes'}
			<div class="screen">
				<div class="form-row">
					<label>Recherche :</label>
					<input type="text" bind:value={compteSearch} />
				</div>
				
				<table class="users-table">
					<thead>
						<tr>
							<th>Prénom</th>
							<th>Nom</th>
							<th>Promo</th>
							<th>Droit</th>
							<th>Solde</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{#each filteredUsers.slice(0, 50) as user}
							<tr>
								<td>{user.prenom}</td>
								<td>{user.nom}</td>
								<td>{user.promo}</td>
								<td>{user.droit}</td>
								<td class:negative={user.solde < 0}>{formatPrice(user.solde)}</td>
								<td>
									<a href="/compte?id={user.id}" class="button">Historique</a>
									<a href="/stats?id={user.id}" class="button">Stats</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		<!-- Perm -->
		<div class="accordion" class:active={activeSection === 'perm'} onclick={() => toggle('perm')}>
			<div class="icon">{activeSection === 'perm' ? '▼' : '▶'}</div>
			<div class="title">Perm</div>
		</div>
		{#if activeSection === 'perm'}
			<div class="screen">
				<div class="form-row">
					<label>Recherche :</label>
					<input type="text" bind:value={permSearch} />
				</div>
				{#each filteredPerms as perm}
					<div class="list-item">
						<span>{perm.nom}</span>
						<button>Désactiver</button>
						<div class="members">
							{#each perm.membres as membre}
								<span class="tag">{membre.prenom} {membre.nom}</span>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Constantes -->
		<div class="accordion" class:active={activeSection === 'constantes'} onclick={() => toggle('constantes')}>
			<div class="icon">{activeSection === 'constantes' ? '▼' : '▶'}</div>
			<div class="title">Constantes</div>
		</div>
		{#if activeSection === 'constantes'}
			<div class="screen">
				{#each data.constantes as constante}
					<div class="list-item">
						<label>{constante.nom}</label>
						<input type="number" value={constante.valeur} step="0.01" />
						<button>Modifier</button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Nouvelle Perm (Team) -->
		<div class="accordion" class:active={activeSection === 'new_perm'} onclick={() => toggle('new_perm')}>
			<div class="icon">{activeSection === 'new_perm' ? '▼' : '▶'}</div>
			<div class="title">Nouvelle perm (Équipe)</div>
		</div>
		{#if activeSection === 'new_perm'}
			<div class="screen">
				<form method="POST" action="?/createPermTeam">
					<div class="form-row">
						<label>Nom de la nouvelle perm :</label>
						<input type="text" name="nom" required />
					</div>
					<button type="submit">Créer la perm</button>
				</form>
			</div>
		{/if}

		<!-- Nouveau Compte -->
		<div class="accordion" class:active={activeSection === 'new_user'} onclick={() => toggle('new_user')}>
			<div class="icon">{activeSection === 'new_user' ? '▼' : '▶'}</div>
			<div class="title">Nouveau compte</div>
		</div>
		{#if activeSection === 'new_user'}
			<div class="screen">
				<div class="form-row">
					<label>Recherche utilisateur (CAS) :</label>
					<input type="text" bind:value={newUserSearch} placeholder="Rechercher..." />
				</div>
				<!-- This would need a search against all users or an external directory -->
				<p>Pour créer un compte, l'utilisateur doit s'être connecté au moins une fois via le CAS.</p>
			</div>
		{/if}

	</div>
</div>

<style>
	.page {
		padding: 20px;
		max-width: 1000px;
		margin: 0 auto;
	}
	
	.accordion {
		background: #eee;
		padding: 15px;
		margin-top: 10px;
		cursor: pointer;
		display: flex;
		align-items: center;
		border-radius: 5px;
		user-select: none;
	}
	
	.accordion.active {
		background: #ddd;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
	
	.icon {
		margin-right: 10px;
		width: 20px;
		text-align: center;
	}
	
	.screen {
		border: 1px solid #ddd;
		border-top: none;
		padding: 20px;
		margin-bottom: 10px;
		background: white;
		border-bottom-left-radius: 5px;
		border-bottom-right-radius: 5px;
	}
	
	.form-row {
		margin-bottom: 15px;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.search-container {
		position: relative;
		flex-grow: 1;
	}
	
	.autocomplete {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 1px solid #ddd;
		max-height: 200px;
		overflow-y: auto;
		z-index: 10;
	}
	
	.autocomplete-item {
		padding: 10px;
		cursor: pointer;
	}
	
	.autocomplete-item:hover {
		background: #f0f0f0;
	}
	
	.users-table {
		width: 100%;
		border-collapse: collapse;
	}
	
	.users-table th, .users-table td {
		padding: 10px;
		text-align: left;
		border-bottom: 1px solid #eee;
	}
	
	.negative {
		color: red;
	}
	
	.list-item {
		padding: 10px;
		border-bottom: 1px solid #eee;
		display: flex;
		align-items: center;
		gap: 10px;
	}
	
	.tag {
		background: #e0e0e0;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.9em;
	}
	
	button {
		padding: 5px 10px;
		cursor: pointer;
	}
</style>
