<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TimeNode } from '@/data/timelineData'

const props = defineProps<{
  node: TimeNode | null
  visible: boolean
}>()

const show = ref(false)
const imageLoaded = ref(false)
const imageError = ref(false)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      imageLoaded.value = false
      imageError.value = false
      setTimeout(() => {
        show.value = true
      }, 100)
    } else {
      show.value = false
    }
  },
)

watch(
  () => props.node?.id,
  () => {
    imageLoaded.value = false
    imageError.value = false
  },
)

function onImageLoad() {
  imageLoaded.value = true
}

function onImageError() {
  imageError.value = true
}
</script>

<template>
  <Transition name="card">
    <div
      v-if="show && node"
      class="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 w-[calc(100%-1rem)] sm:w-80 z-20 pointer-events-auto"
    >
      <div class="glass rounded-2xl overflow-hidden shadow-2xl">
        <!-- 图片区域 -->
        <div class="relative h-48 overflow-hidden">
          <div
            v-if="!imageLoaded && !imageError"
            class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0a0a2e] to-[#1a0a3e]"
          >
            <div class="flex flex-col items-center gap-2">
              <div
                class="w-8 h-8 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin"
              ></div>
              <span class="text-xs text-[#00d4ff]/60">加载中...</span>
            </div>
          </div>
          <img
            v-if="!imageError"
            :src="node.imageUrl"
            :alt="node.title"
            class="w-full h-full object-cover transition-opacity duration-500"
            :class="imageLoaded ? 'opacity-100' : 'opacity-0'"
            @load="onImageLoad"
            @error="onImageError"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-[#0a1a3e] to-[#1a0a4e] flex items-center justify-center"
          >
            <div class="text-center">
              <div class="text-4xl mb-2">&#10024;</div>
              <div class="text-sm text-white/40">{{ node.year }}</div>
            </div>
          </div>
          <!-- 图片底部渐变遮罩 -->
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
