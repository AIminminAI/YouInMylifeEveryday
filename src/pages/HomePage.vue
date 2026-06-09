<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Sparkles, RotateCcw } from 'lucide-vue-next'
import { useThreeScene } from '@/composables/useThreeScene'
import { useSubscription } from '@/composables/useSubscription'
import { timelineData, saveTimelineData, createDefaultData, type TimeNode } from '@/data/timelineData'
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
const { isFree, isPaid } = useSubscription()
const showPaywall = ref(false)
const paywallTrigger = ref<'node' | 'export-video' | 'export-hd' | 'skin'>('node')

// 重置确认
const showResetConfirm = ref(false)

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
  startVideoExport()
}

function handleNavGoto(index: number) {
  goToNode(index)
}

function handleNavNext() {
  nextNode()
}

// 更新节点数据（编辑文案/上传照片后触发）
function handleUpdateNode(updatedNode: TimeNode) {
  const index = timelineData.nodes.findIndex(n => n.id === updatedNode.id)
  if (index >= 0) {
    timelineData.nodes[index] = updatedNode
    saveTimelineData(timelineData)
  }
}

// 重置所有数据
function handleResetData() {
  const fresh = createDefaultData()
  timelineData.title = fresh.title
  timelineData.subtitle = fresh.subtitle
  timelineData.nodes = fresh.nodes
  saveTimelineData(timelineData)
  showResetConfirm.value = false
  window.location.reload()
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

    <!-- 左上角：标题 -->
    <TitleOverlay :title="timelineData.title" :subtitle="timelineData.subtitle" />

    <!-- 左上角标题下方：升级按钮 / 重置按钮 -->
    <div class="fixed top-[88px] left-6 z-20 pointer-events-auto flex flex-col gap-2">
      <button
        v-if="isFree"
        class="glass rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-white/[0.08] transition-all"
        @click="showPaywall = true; paywallTrigger = 'node'"
      >
        <Sparkles class="text-[#00d4ff]/50" :size="12" />
        <span class="text-[10px] text-white/30 font-body">升级</span>
      </button>
      <div
        v-if="isPaid"
        class="glass rounded-lg px-3 py-1.5 flex items-center gap-1.5 pointer-events-none"
      >
        <span class="text-[10px] text-[#ffd700]/70 font-body">PRO</span>
      </div>
      <button
        class="glass rounded-lg px-3 py-1.5 flex items-center gap-1.5 hover:bg-white/[0.08] transition-all"
        title="重置数据"
        @click="showResetConfirm = true"
      >
        <RotateCcw class="text-white/20" :size="12" />
        <span class="text-[10px] text-white/20 font-body">重置</span>
      </button>
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

    <!-- 图文卡片 - 支持编辑和上传照片 -->
    <InfoCard
      :node="timelineData.nodes[activeNodeIndex]"
      :visible="cardVisible"
      @update-node="handleUpdateNode"
    />

    <!-- 导航控制 -->
    <NavControls
      :current-index="activeNodeIndex"
      :total-nodes="timelineData.nodes.length"
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

    <!-- 重置确认弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showResetConfirm"
          class="fixed inset-0 z-[100] flex items-center justify-center px-4"
        >
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showResetConfirm = false"></div>
          <div class="relative glass rounded-2xl p-6 max-w-xs w-full text-center">
            <h3 class="font-display text-lg text-white mb-2">重置所有数据？</h3>
            <p class="text-white/40 text-xs font-body mb-5">将清除你上传的照片和编辑的文案，恢复为默认模板。此操作不可撤销。</p>
            <div class="flex gap-3">
              <button
                class="flex-1 py-2 rounded-xl text-xs font-body bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-all"
                @click="showResetConfirm = false"
              >
                取消
              </button>
              <button
                class="flex-1 py-2 rounded-xl text-xs font-body bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all"
                @click="handleResetData"
              >
                确认重置
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
.modal-enter-active { transition: all 0.3s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
</style>
