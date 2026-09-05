<script>
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { auth, clearSession } from "$lib/auth.svelte.js";

  let { children } = $props();

  const links = [
    { href: "/app", label: "Núcleo" },
    { href: "/app/users", label: "Vigilantes" },
    { href: "/app/roles", label: "Jerarquías" },
    { href: "/app/audit", label: "Crónicas" },
  ];

  $effect(() => {
    if (!auth.token) goto("/");
  });

  function logout() {
    clearSession();
    goto("/");
  }

  function active(href) {
    if (href === "/app") return page.url.pathname === "/app";
    return page.url.pathname.startsWith(href);
  }
</script>

{#if auth.token}
  <div class="grid min-h-screen lg:grid-cols-[260px_1fr]">
    <aside class="border-b border-gilt/20 bg-crypt/90 lg:border-b-0 lg:border-r">
      <div class="px-6 py-7">
        <p class="font-display text-[10px] tracking-[0.5em] text-gilt">NOX · V.1</p>
        <h1 class="font-ornate mt-2 text-2xl text-bone">Sanctum</h1>
      </div>
      <nav class="flex gap-2 overflow-x-auto px-3 pb-4 lg:flex-col lg:gap-1">
        {#each links as link}
          <a
            class="nav-link whitespace-nowrap px-4 py-3 text-sm tracking-[0.2em] text-mist uppercase"
            class:active={active(link.href)}
            href={link.href}
          >
            {link.label}
          </a>
        {/each}
      </nav>
      <div class="mt-auto hidden border-t border-gilt/15 px-6 py-5 lg:block">
        <p class="text-sm text-bone">{auth.user?.full_name}</p>
        <p class="text-xs tracking-widest text-mist uppercase">{auth.user?.roles?.name}</p>
        <button class="btn-ghost mt-4 w-full px-3 py-2 text-xs" type="button" onclick={logout}>Cerrar sello</button>
      </div>
    </aside>

    <div class="flex min-h-screen flex-col">
      <header class="flex items-center justify-between border-b border-gilt/15 px-6 py-4">
        <div class="flex items-center gap-3">
          <span class="pulse-core h-2 w-2 rounded-full bg-cyan"></span>
          <span class="text-xs tracking-[0.35em] text-mist">ENLACE SUPABASE ESTABLE</span>
        </div>
        <button class="btn-ghost px-3 py-2 text-xs lg:hidden" type="button" onclick={logout}>Salir</button>
      </header>
      <main class="flex-1 p-6 lg:p-10">
        {@render children()}
      </main>
    </div>
  </div>
{/if}
