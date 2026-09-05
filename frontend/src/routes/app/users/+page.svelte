<script>
  import { api } from "$lib/api.js";
  import { auth, isAdmin } from "$lib/auth.svelte.js";

  let users = $state([]);
  let roles = $state([]);
  let error = $state("");
  let notice = $state("");
  let loading = $state(true);
  let modal = $state(null);
  let form = $state({
    email: "",
    password: "",
    full_name: "",
    role_id: "",
    is_active: true,
  });
  let editingId = $state(null);

  async function load() {
    loading = true;
    error = "";
    try {
      users = await api.users(auth.token);
      roles = await api.roles(auth.token);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (auth.token) load();
  });

  function openCreate() {
    editingId = null;
    form = { email: "", password: "", full_name: "", role_id: roles[0]?.id || "", is_active: true };
    modal = "user";
  }

  function openEdit(user) {
    editingId = user.id;
    form = {
      email: user.email,
      password: "",
      full_name: user.full_name,
      role_id: user.role_id,
      is_active: user.is_active,
    };
    modal = "user";
  }

  function openPassword(user) {
    editingId = user.id;
    form = { ...form, password: "" };
    modal = "password";
  }

  async function saveUser(event) {
    event.preventDefault();
    error = "";
    try {
      if (editingId) {
        await api.updateUser(auth.token, editingId, {
          email: form.email,
          full_name: form.full_name,
          role_id: form.role_id,
          is_active: form.is_active,
        });
        notice = "Vigilante actualizado";
      } else {
        await api.createUser(auth.token, form);
        notice = "Vigilante creado";
      }
      modal = null;
      await load();
    } catch (err) {
      error = err.message;
    }
  }

  async function savePassword(event) {
    event.preventDefault();
    try {
      await api.changePassword(auth.token, editingId, form.password);
      notice = "Clave reescrita";
      modal = null;
    } catch (err) {
      error = err.message;
    }
  }

  async function remove(user) {
    if (!confirm(`¿Eliminar a ${user.email}?`)) return;
    try {
      await api.deleteUser(auth.token, user.id);
      notice = "Vigilante eliminado";
      await load();
    } catch (err) {
      error = err.message;
    }
  }
</script>

<section>
  <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p class="font-display text-xs tracking-[0.45em] text-gilt">REGISTRO DE ALMAS</p>
      <h2 class="font-ornate mt-2 text-4xl">Vigilantes</h2>
    </div>
    {#if isAdmin()}
      <button class="btn-blood px-5 py-3 text-xs" type="button" onclick={openCreate}>Nuevo sello</button>
    {/if}
  </div>

  {#if notice}<p class="mb-4 text-sm text-cyan">{notice}</p>{/if}
  {#if error}<p class="mb-4 text-sm text-ember">{error}</p>{/if}
  {#if loading}<p class="text-mist">Invocando registros...</p>{/if}

  <div class="ornate-panel overflow-x-auto">
    <table class="w-full min-w-[720px] text-left text-sm">
      <thead class="border-b border-gilt/20 text-xs tracking-[0.25em] text-gilt uppercase">
        <tr>
          <th class="px-4 py-4">Nombre</th>
          <th class="px-4 py-4">Correo</th>
          <th class="px-4 py-4">Rango</th>
          <th class="px-4 py-4">Estado</th>
          {#if isAdmin()}<th class="px-4 py-4">Ritos</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each users as user}
          <tr class="border-b border-white/5">
            <td class="px-4 py-4 font-display">{user.full_name}</td>
            <td class="px-4 py-4 text-mist">{user.email}</td>
            <td class="px-4 py-4 uppercase tracking-widest text-cyan">{user.roles?.name}</td>
            <td class="px-4 py-4">{user.is_active ? "activo" : "sellado"}</td>
            {#if isAdmin()}
              <td class="px-4 py-4">
                <div class="flex flex-wrap gap-2">
                  <button class="btn-ghost px-2 py-1 text-[10px]" type="button" onclick={() => openEdit(user)}>Editar</button>
                  <button class="btn-ghost px-2 py-1 text-[10px]" type="button" onclick={() => openPassword(user)}>Clave</button>
                  <button class="btn-ghost px-2 py-1 text-[10px] text-ember" type="button" onclick={() => remove(user)}>Borrar</button>
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

{#if modal === "user"}
  <div class="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4">
    <form class="ornate-panel w-full max-w-lg p-6" onsubmit={saveUser}>
      <h3 class="font-display text-2xl">{editingId ? "Reescribir vigilante" : "Nuevo vigilante"}</h3>
      <div class="mt-5 grid gap-4">
        <input class="field px-3 py-2" placeholder="Nombre" bind:value={form.full_name} required />
        <input class="field px-3 py-2" type="email" placeholder="Correo" bind:value={form.email} required />
        {#if !editingId}
          <input class="field px-3 py-2" type="password" placeholder="Contraseña (8+)" bind:value={form.password} minlength="8" required />
        {/if}
        <select class="field px-3 py-2" bind:value={form.role_id}>
          {#each roles as role}
            <option value={role.id}>{role.name}</option>
          {/each}
        </select>
        <label class="flex items-center gap-2 text-sm text-mist">
          <input type="checkbox" bind:checked={form.is_active} /> Activo
        </label>
      </div>
      <div class="mt-6 flex justify-end gap-3">
        <button class="btn-ghost px-4 py-2 text-xs" type="button" onclick={() => (modal = null)}>Cancelar</button>
        <button class="btn-blood px-4 py-2 text-xs" type="submit">Conservar</button>
      </div>
    </form>
  </div>
{/if}

{#if modal === "password"}
  <div class="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4">
    <form class="ornate-panel w-full max-w-md p-6" onsubmit={savePassword}>
      <h3 class="font-display text-2xl">Nueva clave</h3>
      <input class="field mt-5 w-full px-3 py-2" type="password" minlength="8" bind:value={form.password} required />
      <div class="mt-6 flex justify-end gap-3">
        <button class="btn-ghost px-4 py-2 text-xs" type="button" onclick={() => (modal = null)}>Cancelar</button>
        <button class="btn-blood px-4 py-2 text-xs" type="submit">Reescribir</button>
      </div>
    </form>
  </div>
{/if}
