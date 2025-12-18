<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

	let { user } = $props();
</script>

<header>
	<div class="logo">
		<a href="/">Cercle</a>
	</div>
	<nav>
		<ul>
			<li><a href="/pos">POS</a></li>
			<li><a href="/perm/open">Open Perm</a></li>
			<li><a href="/perm/close">Close Perm</a></li>
			{#if user?.droit === 'cercle' || user?.droit === 'cercleux'}
				<li><a href="/admin">Admin</a></li>
			{/if}
		</ul>
	</nav>
	<div class="auth">
		{#if user}
			<a href="/profile" class="username">{user.prenom} {user.nom}</a>
			<button onclick={() => signOut()}>Logout</button>
		{:else}
			<button onclick={() => signIn()}>Login</button>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background-color: #333;
		color: white;
	}
	.logo a {
		color: white;
		text-decoration: none;
		font-size: 1.5rem;
		font-weight: bold;
	}
	nav ul {
		display: flex;
		list-style: none;
		gap: 1.5rem;
		margin: 0;
		padding: 0;
	}
	nav a, .username {
		color: #ddd;
		text-decoration: none;
	}
	nav a:hover, .username:hover {
		color: white;
	}
	.auth {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	button {
		padding: 0.5rem 1rem;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
	button:hover {
		background-color: #0056b3;
	}
</style>
