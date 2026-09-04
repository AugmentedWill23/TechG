<script lang="ts">
  import Reviews from '$lib/components/Reviews.svelte';
  import { page } from '$app/stores';
  import { gameProjects } from '$lib/ts/stores/Stores';
  import { get } from 'svelte/store';

  let currentGame = null;

  page.subscribe(($page) => {
    const gameId = $page.params.gameId;
    currentGame = get(gameProjects).find((g) => g.id === gameId) ?? null;
  });
</script>

{#if currentGame}
  <h2>{currentGame.name} — Reviews</h2>
  <Reviews reviews={currentGame.reviews ?? []} />
{:else}
  <div>No game found</div>
{/if}

<style>
  h2 { margin-top: 0; }
</style>
