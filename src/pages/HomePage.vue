<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useThreeScene } from '@/composables/useThreeScene'
import { useSubscription } from '@/composables/useSubscription'
import { timelineData } from '@/data/timelineData'
import InfoCard from '@/components/InfoCard.vue'
import NavControls from '@/components/NavControls.vue'
import ScrollHint from '@/components/ScrollHint.vue'
import TitleOverlay from '@/components/TitleOverlay.vue'
import ExportButton from '@/components/ExportButton.vue'
import PlayControl from '@/components/PlayControl.vue'
import PaywallModal from '@/components/PaywallModal.vue'
import ShareButton from '@/components/ShareButton.vue'
import DevTools from '@/components/DevTools.vue'

const sceneContainer = ref<HTMLElement | null>(null)
const activeNodeIndex = ref(0)
const cardVisible = ref(false)

// 付费状态
const { isFree, isPaid, isNodeLocked } = useSubscription()
const showPaywall = ref(false)
const paywallTrigger = ref<'node' | 'export-video' | 'export-hd' | 'skin'>('node')

const {
  isLoading,
  isPlaying,
  isExportingVideo,
  exportProgress,
  init,
  dispose,
  goToNode,
  nextNode,
  prevNode,
  replay,
  toggleAutoPlay,
  exportScreenshot,
  startVideoExport,
} = useThreeScene({
  container: sceneContainer,
  nodes: timelineData.nodes,
  onNodeChange: (index: number) => {
    cardVisible.value = false
    setTimeout(() => {
      activeNodeIndex.value = index
      cardVisible.value = true
    }, 300)
  },
  onPaywallRequired: (trigger: 'node' | 'export-video' | 'export-hd' | 'skin') => {
    showPaywall.value = true
    paywallTrigger.value = trigger
  },
})

onMounted(() => {
  init()
})

onUnmounted(() => {
  dispose()
})

function handleExportImage() {
  exportScreenshot()
}

function handleExportVideo() {
  if (isFree.value) {
    showPaywall.value = true
    paywallTrigger.value = 'export-video'
    return
  }
  startVideoExport()
}

function handleNavGoto(index: number) {
  if (isNodeLocked(index)) {
    showPaywall.value = true
    paywallTrigger.value = 'node'
    return
  }
  goToNode(index)
}

function handleNavNext() {
  const nextIdx = activeNodeIndex.value + 1
  if (isNodeLocked(nextIdx)) {
    showPaywall.value = true
    paywallTrigger.value = 'node'
    return
  }
  nextNode()
}
</script>

<template>
  <div class="relative w-full h-full overflow-hidden bg-[#0a0a1a]">
    <!-- 加载画面 -->
    <Transition name="loading">
      <div
        v-if="isLoading"
        class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a1a]"
      >
        <div class="relative mb-8">
          <div class="w-16 h-16 border-2 border-[#00d4ff]/30 rounded-full animate-ping"></div>
          <div
            class="absolute inset-0 w-16 h-16 border-2 border-t-[#00d4ff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
          ></div>
        </div>
        <div class="font-display text-xl text-white/60 tracking-widest">生命星轨</div>
        <div class="text-xs text-white/30 mt-2 font-body">正在构建星空...</div>
      </div>
    </Transition>

    <!-- 3D 场景容器 -->
    <div ref="sceneContainer" class="absolute inset-0"></div>

    <!-- 标题 -->
    <TitleOverlay :title="timelineData.title" :subtitle="timelineData.subtitle" />

    <!-- 免费版标识 -->
    <div
      v-if="isFree"
      class="fixed top-6 left-6 z-20 pointer-events-auto"
    >
      <div class="glass rounded-lg px-3 py-1.5 flex items-center gap-2">
        <span class="text-[10px] text-white/40 font-body">免费版</span>
        <span class="text-[10px] text-white/20">·</span>
        <button
          class="text-[10px] text-[#00d4ff]/70 hover:text-[#00d4ff] transition-colors font-body"
          @click="showPaywall = true; paywallTrigger = 'node'"
        >
          解锁完整版
        </button>
      </div>
    </div>

    <!-- 已付费标识 -->
    <div
      v-if="isPaid"
      class="fixed top-6 left-6 z-20 pointer-events-none"
    >
      <div class="glass rounded-lg px-3 py-1.5 flex items-center gap-1.5">
        <span class="text-[10px] text-[#ffd700]/70 font-body">PRO</span>
      </div>
    </div>

    <!-- 导出按钮 -->
    <ExportButton
      @export-image="handleExportImage"
      @export-video="handleExportVideo"
      :is-exporting-video="isExportingVideo"
      :export-progress="exportProgress"
    />

    <!-- 分享按钮 -->
    <div class="fixed top-6 right-6 sm:right-[100px] z-20 pointer-events-auto">
      <ShareButton :node-title="timelineData.nodes[activeNodeIndex].title" />
    </div>

    <!-- 播放控制 -->
    <PlayControl
      :is-playing="isPlaying"
      @toggle="toggleAutoPlay"
      @replay="replay"
    />

    <!-- 图文卡片 -->
    <InfoCard :node="timelineData.nodes[activeNodeIndex]" :visible="cardVisible" />

    <!-- 导航控制 -->
    <NavControls
      :current-index="activeNodeIndex"
      :total-nodes="timelineData.nodes.length"
      :free-limit="isFree ? 3 : -1"
      @prev="prevNode"
      @next="handleNavNext"
      @goto="handleNavGoto"
    />

    <!-- 滚动提示 -->
    <ScrollHint />

    <!-- 付费弹窗 -->
    <PaywallModal
      :visible="showPaywall"
      :trigger="paywallTrigger"
      @close="showPaywall = false"
    />

    <!-- 开发者工具 -->
    <DevTools />
  </div>
</template>

<style scoped>
.loading-leave-active {
  transition: all 1s ease;
}
.loading-leave-to {
  opacity: 0;
}
</style>
