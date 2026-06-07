<script setup lang="ts">
import { ref } from 'vue'
import { X, Sparkles, Crown, Check, Loader2 } from 'lucide-vue-next'
import { useSubscription } from '@/composables/useSubscription'

const props = defineProps<{
  visible: boolean
  trigger: 'node' | 'export-video' | 'export-hd' | 'skin'
}>()

const emit = defineEmits<{
  close: []
}>()

const { simulatePayment, upgradeToFull, upgradeToPremium } = useSubscription()

const isProcessing = ref(false)
const selectedPlan = ref<'full' | 'premium'>('full')

// 根据触发来源显示不同文案
const triggerTexts: Record<string, { title: string; desc: string }> = {
  node: {
    title: '解锁完整人生星轨',
    desc: '免费版仅可记录 3 个时光节点，升级后可记录 10 个珍贵瞬间',
  },
  'export-video': {
    title: '导出高清纪念视频',
    desc: '将你的生命星轨导出为高清视频，分享给最爱的人',
  },
  'export-hd': {
    title: '解锁高清导出',
    desc: '免费版导出含水印，升级后可获得无水印高清图片',
  },
  skin: {
    title: '解锁更多星轨皮肤',
    desc: '赛博朋克、水墨画卷、像素小镇... 每种风格都是一种心情',
  },
}

const currentText = triggerTexts[props.trigger] || triggerTexts.node

async function handlePay(plan: 'full' | 'premium') {
  isProcessing.value = true
  selectedPlan.value = plan

  // 模拟支付
  await simulatePayment(plan)

  isProcessing.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center px-4"
      >
        <!-- 遮罩 -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="!isProcessing && emit('close')"
        ></div>

        <!-- 弹窗主体 -->
        <div
          class="relative glass rounded-2xl max-w-md w-full overflow-hidden animate-in"
        >
          <!-- 关闭按钮 -->
          <button
            v-if="!isProcessing"
            class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>

          <!-- 顶部装饰 -->
          <div class="relative h-32 overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/20 via-[#8b5cf6]/20 to-[#e879f9]/20"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="text-3xl mb-1">
                  <Sparkles class="inline text-[#00d4ff]" :size="28" />
                </div>
                <h2 class="font-display text-lg text-white tracking-wide">
                  {{ currentText.title }}
                </h2>
              </div>
            </div>
          </div>

          <!-- 说明文字 -->
          <div class="px-6 pt-4 pb-2">
            <p class="text-white/50 text-sm text-center font-body">
              {{ currentText.desc }}
            </p>
          </div>

          <!-- 套餐选择 -->
          <div class="px-6 py-4 space-y-3">
            <!-- 完整版 -->
            <button
              class="w-full relative rounded-xl border transition-all duration-300 text-left group"
              :class="
                selectedPlan === 'full'
                  ? 'border-[#00d4ff]/60 bg-[#00d4ff]/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              "
              :disabled="isProcessing"
              @click="selectedPlan = 'full'"
            >
              <!-- 推荐标签 -->
              <div
                class="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00d4ff] text-black"
              >
                最受欢迎
              </div>

              <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <Sparkles :size="16" class="text-[#00d4ff]" />
                    <span class="text-white font-display text-sm">完整版</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[#00d4ff] font-display text-xl font-bold">¥19.9</span>
                    <span class="text-white/30 text-xs ml-1">/永久</span>
                  </div>
                </div>
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  <span class="flex items-center gap-1 text-white/50 text-xs">
                    <Check :size="12" class="text-[#00d4ff]" /> 10 个时光节点
                  </span>
                  <span class="flex items-center gap-1 text-white/50 text-xs">
                    <Check :size="12" class="text-[#00d4ff]" /> 高清视频导出
                  </span>
                  <span class="flex items-center gap-1 text-white/50 text-xs">
                    <Check :size="12" class="text-[#00d4ff]" /> 无水印截图
                  </span>
                  <span class="flex items-center gap-1 text-white/50 text-xs">
                    <Check :size="12" class="text-[#00d4ff]" /> 3 种场景皮肤
                  </span>
                </div>
              </div>
            </button>

            <!-- 纪念版 -->
            <button
              class="w-full relative rounded-xl border transition-all duration-300 text-left group"
              :class="
                selectedPlan === 'premium'
                  ? 'border-[#ffd700]/60 bg-[#ffd700]/10 shadow-[0_0_20px_rgba(255,215,0,0.15)]'
                  : 'border-white/10 bg-white/[0.03] hover:border-white/20'
              "
              :disabled="isProcessing"
              @click="selectedPlan = 'premium'"
            >
              <div class="p-4">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <Crown :size="16" class="text-[#ffd700]" />
                    <span class="text-white font-display text-sm">纪念版</span>
                  </div>
                  <div class="text-right">
                    <span class="text-[#ffd700] font-display text-xl font-bold">¥99</span>
                    <span class="text-white/30 text-xs ml-1">/永久</span>
                  </div>
                </div>
                <div class="flex flex-wrap gap-x-4 gap-y-1">
                  <span class="flex items-center gap-1 text-white/50 text-xs">
                    <Check :size="12" class="text-[#ffd700]" /> 完整版所有功能
                  </span>
                  <span class="flex items-center gap-1 text-white/50 text-xs">
                    <Check :size="12" class="text-[#ffd700]" /> AI 自动生成文案
                  </span>
                  <span class="flex items-center gap-1 text-white/50 text-xs">
                    <Check :size="12" class="text-[#ffd700]" /> 定制实体光栅画
                  </span>
                  <span class="flex items-center gap-1 text-white/50 text-xs">
                    <Check :size="12" class="text-[#ffd700]" /> 精装礼盒包装
                  </span>
                </div>
              </div>
            </button>
          </div>

          <!-- 支付按钮 -->
          <div class="px-6 pb-6">
            <button
              class="w-full py-3 rounded-xl font-display text-sm tracking-wide transition-all duration-300 disabled:opacity-50"
              :class="
                selectedPlan === 'full'
                  ? 'bg-gradient-to-r from-[#00d4ff] to-[#0099ff] text-black hover:shadow-[0_0_24px_rgba(0,212,255,0.4)]'
                  : 'bg-gradient-to-r from-[#ffd700] to-[#ff9500] text-black hover:shadow-[0_0_24px_rgba(255,215,0,0.4)]'
              "
              :disabled="isProcessing"
              @click="handlePay(selectedPlan)"
            >
              <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                <Loader2 :size="16" class="animate-spin" />
                处理中...
              </span>
              <span v-else>
                立即解锁 {{ selectedPlan === 'full' ? '完整版' : '纪念版' }}
                {{ selectedPlan === 'full' ? '¥19.9' : '¥99' }}
              </span>
            </button>

            <p class="text-white/20 text-[10px] text-center mt-3 font-body">
              支付即表示同意《用户协议》和《隐私政策》 · 一次购买永久使用
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active {
  transition: all 0.3s ease;
}
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from {
  opacity: 0;
}
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .glass {
  transform: scale(0.9) translateY(20px);
}
.animate-in {
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
