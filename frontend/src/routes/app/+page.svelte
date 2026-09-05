<script>
  import { auth } from "$lib/auth.svelte.js";
</script>

<section>
  <p class="font-display text-xs tracking-[0.45em] text-gilt">NÚCLEO DE CONTROL</p>
  <h2 class="font-ornate mt-2 text-4xl text-bone">Bienvenido, {auth.user?.full_name}</h2>
  <div class="hud-line my-6 max-w-xl"></div>
  <p class="max-w-2xl text-lg text-mist">
    Este altar digital gobierna usuarios, roles y crónicas del sistema. El estilo mezcla catedral oscura con interfaz de
    nave: oro, sangre y un pulso cian.
  </p>

  <div class="mt-10 grid gap-5 md:grid-cols-3">
    <a class="ornate-panel p-6 hover:border-ember/60" href="/app/users">
      <p class="text-xs tracking-[0.3em] text-cyan">01</p>
      <h3 class="font-display mt-2 text-xl">Vigilantes</h3>
      <p class="mt-2 text-sm text-mist">Crear, sellar y desactivar cuentas.</p>
    </a>
    <a class="ornate-panel p-6 hover:border-ember/60" href="/app/roles">
      <p class="text-xs tracking-[0.3em] text-cyan">02</p>
      <h3 class="font-display mt-2 text-xl">Jerarquías</h3>
      <p class="mt-2 text-sm text-mist">Admin, supervisor y operador.</p>
    </a>
    <a class="ornate-panel p-6 hover:border-ember/60" href="/app/audit">
      <p class="text-xs tracking-[0.3em] text-cyan">03</p>
      <h3 class="font-display mt-2 text-xl">Crónicas</h3>
      <p class="mt-2 text-sm text-mist">Bitácora de ritos y mutaciones.</p>
    </a>
  </div>
</section>
