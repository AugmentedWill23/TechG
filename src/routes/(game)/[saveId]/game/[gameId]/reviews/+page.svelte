<script lang="ts">
	import Reviews from '$lib/components/Reviews.svelte';
	import { gameProjects } from '$lib/ts/stores/Stores';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let currentGame = null;

	$page.subscribe(($page) => {
		const gameId = $page.params.gameId;
		currentGame = get(gameProjects).find(g => g.id === gameId);
	});
</script>

{#if !currentGame}
	<div>No game found</div>
{:else}
	<h2>{currentGame.name} — Reviews</h2>
	<Reviews {reviews}={currentGame.reviews || []} />
{/if}

<style>
	h2 { margin-top: 0; }
</style>
