<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TimeNode } from '@/data/timelineData'

const props = defineProps<{
  node: TimeNode | null
  visible: boolean
}>()

const show = ref(false)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      setTimeout(() => {
        show.value = true
      }, 100)
    } else {
      show.value = false
    }
  },
)
</script>

<template>
  <Transition name="card">
    <div
      v-if="show && node"
      class="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 w-[calc(100%-1rem)] sm:w-80 z-20 pointer-events-auto"
    >
      <div class="glass rounded-2xl overflow-hidden shadow-2xl">
        <!-- 渐变色块替代图片 -->
        <div class="relative h-48 overflow-hidden">
          <div
            class="w-full h-full flex items-center justify-center"
            :style="{ background: node.gradient || 'linear-gradient(135deg, #0a1a3e 0%, #1a0a4e 100%)' }"
          >
            <div class="text-center">
              <div class="text-5xl font-display text-white/30 mb-1">{{ node.year }}</div>
              <div class="text-sm text-white/50 font-body">{{ node.title }}</div>
            </div>
          </div>
          <!-- 底部渐变遮罩 -->
          <div
            class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[rgba(10,10,26,0.9)] to-transparent"
          ></div>
        </div>

        <!-- 文字区域 -->
        <div class="p-5">
          <!-- 年份标签 -->
          <div class="flex items-center gap-2 mb-3">
            <span
              class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/20"
            >
              {{ node.year }}
            </span>
            <div class="h-px flex-1 bg-gradient-to-r from-[#00d4ff]/20 to-transparent"></div>
          </div>

          <!-- 标题 -->
          <h3 class="font-display text-2xl text-white mb-3 tracking-wide">
            {{ node.title }}
          </h3>

          <!-- 描述 -->
          <p class="text-sm text-white/60 leading-relaxed font-body">
            {{ node.description }}
          </p>
        </div>

        <!-- 底部装饰线 -->
        <div class="h-0.5 bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#ffd700] opacity-40"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.card-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.card-leave-active {
  transition: all 0.4s cubic-bezier(0.7, 0, 0.84, 0);
}

.card-enter-from {
  opacity: 0;
  transform: translate(20px, -50%);
}
.card-leave-to {
  opacity: 0;
  transform: translate(20px, -50%);
}

@media (max-width: 640px) {
  .card-enter-from {
    opacity: 0;
    transform: translate(-50%, 40px);
  }
  .card-leave-to {
    opacity: 0;
    transform: translate(-50%, 40px);
  }
}
</style>
