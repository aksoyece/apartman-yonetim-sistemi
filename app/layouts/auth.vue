<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.25),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(15,23,42,0.9),_#020617)]" />
    <div class="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
    <div class="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-8">
      <slot />
    </div>
  </div>
</template>
