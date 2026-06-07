<script setup lang="ts">
import { ref } from 'vue'
import { useSubscription } from '@/composables/useSubscription'
import { Bug, ChevronRight, RotateCcw } from 'lucide-vue-next'

const { currentPlan, isFree, isPaid, isFull, isPremium, upgradeToFull, upgradeToPremium } = useSubscription()

const isOpen = ref(false)

// 检测是否为开发环境
const isDev = import.meta.env.DEV

function resetToFree() {
  // 直接修改 localStorage 并刷新
  localStorage.setItem('starorbit_plan', 'free')
  window.location.reload()
}
</script>

<template>
  <!-- 仅开发环境显示 -->
  <div v-if="isDev" class="fixed bottom-24 left-4 z-[90] pointer-events-auto">
    <!-- 折叠按钮 -->
    <button
      class="glass rounded-lg w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-all"
      @click="isOpen = !isOpen"
      title="开发者工具 (Dev)"
    >
      <Bug :size="14" />
    </button>

    <!-- 展开面板 -->
    <Transition name="devpanel">
      <div
        v-if="isOpen"
        class="absolute bottom-10 left-0 glass rounded-xl p-4 min-w-[220px]"
      >
        <div class="text-[10px] text-white/30 font-body mb-3 uppercase tracking-widest">Dev Tools</div>

        <!-- 当前状态 -->
        <div class="mb-3 space-y-1">
          <div class="flex items-center justify-between text-xs">
            <span class="text-white/40 font-body">当前套餐</span>
            <span
              class="font-body font-bold"
              :class="{
                'text-white/30': isFree,
                'text-[#00d4ff]': isFull,
                'text-[#ffd700]': isPremium,
              }"
            >
              {{ isFree ? '免费版' : isFull ? '完整版' : '纪念版' }}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-white/40 font-body">节点限制</span>
            <span class="text-white/60 font-body">{{ isFree ? '3/10' : '10/10' }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-white/40 font-body">截图水印</span>
            <span class="font-body" :class="isFree ? 'text-red-400/70' : 'text-green-400/70'">
              {{ isFree ? '有' : '无' }}
            </span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="text-white/40 font-body">视频导出</span>
            <span class="font-body" :class="isFree ? 'text-red-400/70' : 'text-green-400/70'">
              {{ isFree ? '锁定' : '可用' }}
            </span>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="space-y-2">
          <button
            v-if="isFree"
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#00d4ff]/10 border border-[#00d4ff]/20 text-[#00d4ff]/80 hover:bg-[#00d4ff]/20 transition-all text-xs font-body"
            @click="upgradeToFull()"
          >
            <span>模拟 ¥19.9 付费</span>
            <ChevronRight :size="12" />
          </button>

          <button
            v-if="isFree"
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#ffd700]/10 border border-[#ffd700]/20 text-[#ffd700]/80 hover:bg-[#ffd700]/20 transition-all text-xs font-body"
            @click="upgradeToPremium()"
          >
            <span>模拟 ¥99 付费</span>
            <ChevronRight :size="12" />
          </button>

          <button
            v-if="isPaid"
            class="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/80 hover:bg-red-500/20 transition-all text-xs font-body"
            @click="resetToFree()"
          >
            <span>重置为免费版</span>
            <RotateCcw :size="12" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.devpanel-enter-active {
  transition: all 0.2s ease;
}
.devpanel-leave-active {
  transition: all 0.15s ease;
}
.devpanel-enter-from,
.devpanel-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}
</style>
