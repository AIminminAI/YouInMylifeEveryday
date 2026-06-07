<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const show = ref(true)
let timer: number

onMounted(() => {
  timer = window.setTimeout(() => {
    show.value = false
  }, 5000)
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<template>
  <Transition name="hint">
    <div
      v-if="show"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none"
    >
      <div class="flex flex-col items-center gap-2 text-white/30">
        <div class="text-xs font-body tracking-wider">滚动鼠标或点击节点探索星轨</div>
        <div class="animate-bounce">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.hint-enter-active {
  transition: all 0.8s ease;
}

.hint-leave-active {
  transition: all 1s ease;
}

.hint-enter-from {
  opacity: 0;
  transform: translate(-50%, 10px);
}

.hint-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}
</style>
