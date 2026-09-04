<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let initial = {
    multiplayer: 'None',
    proceduralDepth: 'None',
    storyQuality: 'Normal'
  };

  let multiplayer = initial.multiplayer;
  let proceduralDepth = initial.proceduralDepth;
  let storyQuality = initial.storyQuality;
  let open = false;

  function apply() {
    dispatch('apply', { multiplayer, proceduralDepth, storyQuality });
    open = false;
  }

  function cancel() {
    dispatch('cancel');
    open = false;
  }
</script>

<button on:click={() => (open = true)} class="dev-choices-button">Development Choices</button>

{#if open}
  <div class="overlay">
    <div class="modal">
      <h3>Development Choices</h3>

      <label>Multiplayer
        <select bind:value={multiplayer}>
          <option value="None">None</option>
          <option value="Local">Local</option>
          <option value="OnlineSmall">Online (small)</option>
          <option value="OnlineLarge">Online (large)</option>
        </select>
      </label>

      <label>Procedural Generation
        <select bind:value={proceduralDepth}>
          <option value="None">None</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </label>

      <label>Story Quality
        <select bind:value={storyQuality}>
          <option value="Poor">Poor</option>
          <option value="Normal">Normal</option>
          <option value="Good">Good</option>
          <option value="Exceptional">Exceptional</option>
        </select>
      </label>

      <div class="actions">
        <button on:click={apply}>Apply</button>
        <button on:click={cancel}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dev-choices-button { padding: 0.5rem 1rem; }
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; }
  .modal { background: var(--tertiary-background-color); padding:1rem; border-radius:0.5rem; width:320px; }
  .modal label { display:block; margin:0.5rem 0; }
  .actions { display:flex; gap:0.5rem; margin-top:1rem; justify-content:flex-end; }
</style>
