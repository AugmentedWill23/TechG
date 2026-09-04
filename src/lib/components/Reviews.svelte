<script lang="ts">
  export let reviews: { date: number; reviewerId: string; rating: number; text?: string }[] = [];

  function formatDate(ts: number) {
    return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(ts));
  }
</script>

<div class="reviews">
  {#if reviews.length === 0}
    <div>No reviews yet.</div>
  {:else}
    <div class="avg">
      <strong>Average:</strong>
      {Math.round(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length * 10) / 10} / 10 ({reviews.length} reviews)
    </div>

    <ul class="list">
      {#each reviews.slice().sort((a, b) => b.date - a.date) as r}
        <li class="review">
          <div class="meta">
            <span class="stars">{Array.from({ length: r.rating }).map(() => '★').join('')}{Array.from({ length: 10 - r.rating }).map(() => '☆').join('')}</span>
            <small>{r.reviewerId} • {formatDate(r.date)}</small>
          </div>
          <div class="text">{r.text}</div>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .list { list-style: none; padding: 0; margin: 0.5rem 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .review { background: var(--secondary-background-color); padding: 0.75rem; border-radius: 0.5rem; }
  .meta { display: flex; gap: 0.75rem; align-items: center; justify-content: space-between; }
  .stars { color: #f5c34a; font-weight: 600; letter-spacing: 0.05rem; }
  .text { margin-top: 0.5rem; color: var(--primary-foreground-color); }
</style>
