<script>
  import { api } from "$lib/api.js";
  import { auth, isAdmin } from "$lib/auth.svelte.js";

  let roles = $state([]);
  let error = $state("");
  let name = $state("");
  let description = $state("");

  async function load() {
    try {
      roles = await api.roles(auth.token);
    } catch (err) {
      error = err.message;
    }
  }

  $effect(() => {
    if (auth.token) load();
  });

  async function createRole(event) {
    event.preventDefault();
    try {
      await api.createRole(auth.token, { name, description });
      name = "";
      description = "";
      await load();
    } catch (err) {
      error = err.message;
    }
  }

  async function remove(role) {
    if (!confirm(`¿Eliminar el rango ${role.name}?`)) return;
    try {
      await api.deleteRole(auth.token, role.id);
      await load();
    } catch (err) {
      error = err.message;
    }
  }
</script>

<section>
  <p class="font-display text-xs tracking-[0.45em] text-gilt">ORDEN SAGRADO</p>
  <h2 class="font-ornate mt-2 text-4xl">Jerarquías</h2>
  <div class="hud-line my-6 max-w-xl"></div>
  {#if error}<p class="mb-4 text-ember">{error}</p>{/if}

  <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
    <div class="grid gap-4">
      {#each roles as role}
        <article class="ornate-panel p-5">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h3 class="font-display text-xl uppercase text-bone">{role.name}</h3>
              <p class="mt-1 text-sm text-mist">{role.description || "Sin litania"}</p>
            </div>
            {#if isAdmin()}
              <button class="btn-ghost px-2 py-1 text-[10px] text-ember" type="button" onclick={() => remove(role)}>
                Borrar
              </button>
            {/if}
          </div>
        </article>
      {/each}
    </div>

    {#if isAdmin()}
      <form class="ornate-panel h-fit p-6" onsubmit={createRole}>
        <h3 class="font-display text-lg">Forjar rango</h3>
        <input class="field mt-4 w-full px-3 py-2" placeholder="nombre" bind:value={name} required />
        <textarea class="field mt-3 w-full px-3 py-2" rows="3" placeholder="descripcion" bind:value={description}></textarea>
        <button class="btn-blood mt-4 w-full py-2 text-xs" type="submit">Crear</button>
      </form>
    {/if}
  </div>
</section>
