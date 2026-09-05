<script>
  import { api } from "$lib/api.js";
  import { auth } from "$lib/auth.svelte.js";

  let logs = $state([]);
  let error = $state("");

  $effect(() => {
    if (!auth.token) return;
    api
      .auditLogs(auth.token)
      .then((data) => (logs = data))
      .catch((err) => (error = err.message));
  });
</script>

<section>
  <p class="font-display text-xs tracking-[0.45em] text-gilt">MEMORIA DE MÁQUINA</p>
  <h2 class="font-ornate mt-2 text-4xl">Crónicas</h2>
  <div class="hud-line my-6 max-w-xl"></div>
  {#if error}
    <p class="text-ember">{error}</p>
    <p class="mt-2 text-sm text-mist">Solo el rango admin puede leer esta cripta.</p>
  {/if}

  <div class="space-y-3">
    {#each logs as log}
      <article class="ornate-panel p-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <p class="font-display uppercase tracking-widest text-cyan">{log.action}</p>
          <p class="text-xs text-mist">{new Date(log.created_at).toLocaleString()}</p>
        </div>
        <p class="mt-2 text-sm">
          {log.entity} {log.entity_id || ""} · {log.users?.email || "sello anónimo"}
        </p>
      </article>
    {/each}
  </div>
</section>
