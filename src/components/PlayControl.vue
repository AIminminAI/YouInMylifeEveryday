<script setup lang="ts">
import { Play, Pause, RotateCcw } from 'lucide-vue-next'

defineProps<{
  isPlaying: boolean
}>()

const emit = defineEmits<{
  toggle: []
  replay: []
}>()
</script>

<template>
  <div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
    <div class="flex items-center gap-3">
      <!-- 重播按钮 -->
      <button
        class="glow-btn glass rounded-full w-9 h-9 flex items-center justify-center text-white/50 hover:text-white transition-all duration-300"
        @click="emit('replay')"
        title="从头播放"
      >
        <RotateCcw :size="14" />
      </button>

      <!-- 播放/暂停按钮 -->
      <button
        class="glow-btn glass rounded-full w-11 h-11 flex items-center justify-center transition-all duration-300"
        :class="isPlaying ? 'text-[#00d4ff] shadow-[0_0_16px_rgba(0,212,255,0.3)]' : 'text-white/70 hover:text-white'"
        @click="emit('toggle')"
        :title="isPlaying ? '暂停' : '播放'"
      >
        <Pause v-if="isPlaying" :size="18" />
        <Play v-else :size="18" class="ml-0.5" />
      </button>
    </div>
  </div>
</template>
