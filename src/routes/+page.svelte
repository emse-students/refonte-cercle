<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	let { data } = $props();
</script>

<div class="container">
	{#if data.user}
		<div class="dashboard">
			<h1>Welcome, {data.user.prenom}!</h1>

			<div class="grid">
				<a href="/profile" class="card profile">
					<h2>My Profile</h2>
					<p>Check balance & history</p>
				</a>

				<a href="/pos" class="card pos">
					<h2>Point of Sale</h2>
					<p>Sell drinks & snacks</p>
				</a>

				<a href="/perm" class="card action">
					<h2>Perm Dashboard</h2>
					<p>Manage current shift</p>
				</a>

				{#if data.user.droit === 'cercle' || data.user.droit === 'cercleux'}
					<a href="/recharge" class="card recharge">
						<h2>Recharge</h2>
						<p>Add funds to user</p>
					</a>
					<a href="/gestion" class="card admin">
						<h2>Gestion</h2>
						<p>Manage users & products</p>
					</a>
					<a href="/stats" class="card stats">
						<h2>Statistics</h2>
						<p>View global stats</p>
					</a>
				{/if}
			</div>
		</div>
	{:else}
		<div class="hero">
			<h1>Cercle Website</h1>
			<p>Please login to access the system.</p>
			<button class="btn-login" onclick={() => signIn()}>Login with CAS</button>
		</div>
	{/if}
</div>

<style>
	.container {
		max-width: 1000px;
		margin: 0 auto;
		padding: 2rem;
	}
	.hero {
		text-align: center;
		margin-top: 4rem;
	}
	.btn-login {
		padding: 1rem 2rem;
		font-size: 1.2rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 1.5rem;
		margin-top: 2rem;
	}
	.card {
		display: block;
		padding: 2rem;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.2s,
			box-shadow 0.2s;
	}
	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
	}
	.card h2 {
		margin-top: 0;
		color: #333;
	}
	.card p {
		color: #666;
		margin-bottom: 0;
	}
	.profile {
		border-left: 5px solid #17a2b8;
	}
	.pos {
		border-left: 5px solid #28a745;
	}
	.action {
		border-left: 5px solid #ffc107;
	}
	.admin {
		border-left: 5px solid #dc3545;
	}
	.stats {
		border-left: 5px solid #6610f2;
	}
</style>
