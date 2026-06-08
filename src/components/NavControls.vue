<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

const props = defineProps<{
  currentIndex: number
  totalNodes: number
}>()

const emit = defineEmits<{
  prev: []
  next: []
  goto: [index: number]
}>()

const progress = computed(() => {
  return ((props.currentIndex + 1) / props.totalNodes) * 100
})
</script>

<template>
  <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
    <div class="glass rounded-full px-5 py-3 flex items-center gap-3">
      <!-- 上一步 -->
      <button
        class="glow-btn w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="currentIndex <= 0"
        @click="emit('prev')"
      >
        <ChevronLeft :size="18" />
      </button>

      <!-- 节点指示器 -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="i in totalNodes"
          :key="i"
          class="relative rounded-full transition-all duration-500 flex items-center justify-center"
          :class="
            i - 1 === currentIndex
              ? 'w-5 h-2 bg-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.6)]'
              : i - 1 < currentIndex
                ? 'w-2 h-2 bg-[#8b5cf6]/60'
                : 'w-2 h-2 bg-white/20 hover:bg-white/40'
          "
          @click="emit('goto', i - 1)"
        >
          <span
            v-if="i - 1 === currentIndex"
            class="absolute inset-0 rounded-full bg-[#00d4ff] animate-ping opacity-30"
          ></span>
        </button>
      </div>

      <!-- 下一步 -->
      <button
        class="glow-btn w-9 h-9 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        :disabled="currentIndex >= totalNodes - 1"
        @click="emit('next')"
      >
        <ChevronRight :size="18" />
      </button>
    </div>

    <!-- 进度条 -->
    <div class="mt-2 mx-6 h-0.5 bg-white/10 rounded-full overflow-hidden">
      <div
        class="h-full bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] rounded-full transition-all duration-700 ease-out"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </div>
</template>
