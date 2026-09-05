<script>
  import { goto } from "$app/navigation";
  import { api } from "$lib/api.js";
  import { auth, setSession } from "$lib/auth.svelte.js";

  let email = $state("admin@empresa.com");
  let password = $state("Admin1234");
  let error = $state("");
  let loading = $state(false);

  $effect(() => {
    if (auth.token) goto("/app");
  });

  async function submit(event) {
    event.preventDefault();
    error = "";
    loading = true;
    try {
      const data = await api.login(email, password);
      setSession(data.token, data.user);
      goto("/app");
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<main class="relative min-h-screen overflow-hidden px-6 py-10">
  <div class="pointer-events-none absolute -left-24 top-16 h-72 w-72 rotate-12 border border-gilt/20"></div>
  <div class="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 -rotate-6 border border-blood/30"></div>

  <div class="mx-auto flex min-h-[88vh] max-w-6xl items-center gap-16">
    <section class="hidden flex-1 lg:block">
      <p class="font-display text-xs tracking-[0.55em] text-gilt">PROTOCOLUM · NOX</p>
      <h1 class="font-ornate mt-4 text-6xl leading-none text-bone">
        Sanctum<br /><span class="text-ember">Administrare</span>
      </h1>
      <div class="hud-line my-8 max-w-md"></div>
      <p class="max-w-md text-lg leading-relaxed text-mist">
        Acceso al núcleo. Criptas de datos, vigilantes y ritos de control bajo un halo gótico y un pulso de máquina.
      </p>
      <div class="mt-10 flex items-center gap-4 text-xs tracking-[0.35em] text-cyan/80">
        <span class="pulse-core inline-block h-2 w-2 rounded-full bg-ember"></span>
        SISTEMA EN LINEA · EAST US
      </div>
    </section>

    <form class="ornate-panel w-full max-w-md p-8 lg:p-10" onsubmit={submit}>
      <p class="font-display text-center text-xs tracking-[0.5em] text-gilt">INGRESO AL SANCTUM</p>
      <h2 class="font-ornate mt-3 text-center text-3xl text-bone">Nox Admin</h2>
      <div class="hud-line my-6"></div>

      <label class="mb-2 block text-xs tracking-[0.28em] text-mist" for="email">CORREO</label>
      <input id="email" class="field mb-5 w-full px-4 py-3" type="email" bind:value={email} autocomplete="username" />

      <label class="mb-2 block text-xs tracking-[0.28em] text-mist" for="password">CLAVE</label>
      <input
        id="password"
        class="field mb-6 w-full px-4 py-3"
        type="password"
        bind:value={password}
        autocomplete="current-password"
      />

      {#if error}
        <p class="mb-4 border border-blood/50 bg-blood/10 px-3 py-2 text-sm text-ember">{error}</p>
      {/if}

      <button class="btn-blood w-full py-3 text-sm font-semibold disabled:opacity-60" type="submit" disabled={loading}>
        {loading ? "Abriendo puertas..." : "Desellar acceso"}
      </button>
      <p class="mt-5 text-center text-xs tracking-widest text-mist">bcrypt · jwt · supabase</p>
    </form>
  </div>
</main>
