<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="fixed top-6 left-6 z-20 pointer-events-none">
    <h1 class="font-display text-3xl text-white/90 tracking-widest mb-1">
      {{ title }}
    </h1>
    <p class="text-sm text-white/40 font-body tracking-wider">
      {{ subtitle }}
    </p>
    <div class="mt-3 h-px w-24 bg-gradient-to-r from-[#00d4ff]/60 to-transparent"></div>
  </div>
</template>
