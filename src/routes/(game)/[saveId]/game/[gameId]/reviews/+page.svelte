<!-- Reviews page for a specific game -->
<script lang="ts">
  import { page } from '$app/stores';
  import { gameProjects, language } from '$lib/ts/stores/Stores';
  import Reviews from '$lib/components/Reviews.svelte';
  import { get } from 'svelte/store';
  import backIcon from '$lib/assets/icons/icon_back.svg';

  let gameId: string | null = null;
  let saveId: string | null = null;
  let game = null;

  $: {
    const params = $page.params;
    gameId = params.gameId;
    saveId = params.saveId;
    game = $gameProjects.find((g) => g.id === gameId);
  }
</script>

<header class="back">
  <a href="javascript:history.back()" class="back">
    <img src={backIcon} alt="" />
    <span>{$language.BACK}</span>
  </a>
  <h1>{$language.REVIEWS || 'Reviews'}</h1>
</header>

<main>
  {#if game}
    <h2>{game.name}</h2>
    <Reviews reviews={game.reviews || []} />
  {:else}
    <p>Game not found</p>
  {/if}
</main>

<style>
  main { padding: 1rem; }
  header.back { display:flex; align-items:center; gap:1rem; padding: 1rem }
</style>
