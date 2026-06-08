<script setup lang="ts">
import { ref, computed } from 'vue'
import { X, Sparkles, Crown, Check, Loader2, Copy, CheckCircle, Star, Palette, PenTool, Bot } from 'lucide-vue-next'
import { useSubscription } from '@/composables/useSubscription'

const props = defineProps<{
  visible: boolean
  trigger: 'node' | 'export-video' | 'export-hd' | 'skin'
}>()

const emit = defineEmits<{
  close: []
}>()

const {
  startPayment,
  userConfirmPay,
  currentOrder,
  isPaying,
} = useSubscription()

const isProcessing = ref(false)
const selectedPlan = ref<'full' | 'premium'>('full')
const payStep = ref<'select' | 'qrcode' | 'done'>('select')
const payChannel = ref<'wechat' | 'alipay'>('wechat')
const copied = ref(false)

// 根据触发来源显示不同文案 - 诚实描述，不夸大
const triggerTexts: Record<string, { title: string; desc: string; icon: string }> = {
  node: {
    title: '解锁更多可能',
    desc: '升级后可使用多种星空皮肤、自定义标题和 AI 智能文案',
    icon: 'star',
  },
  'export-video': {
    title: '解锁更多可能',
    desc: '升级后可使用多种星空皮肤、自定义标题和 AI 智能文案',
    icon: 'star',
  },
  'export-hd': {
    title: '解锁更多可能',
    desc: '升级后可使用多种星空皮肤、自定义标题和 AI 智能文案',
    icon: 'star',
  },
  skin: {
    title: '解锁更多星轨皮肤',
    desc: '赛博朋克、水墨画卷... 每种风格都是一种心情',
    icon: 'palette',
  },
}

const currentText = computed(() => triggerTexts[props.trigger] || triggerTexts.node)

// 套餐功能列表
const fullFeatures = [
  { icon: Palette, text: '3 种星空皮肤' },
  { icon: PenTool, text: '自定义标题' },
  { icon: Bot, text: 'AI 智能文案' },
]

const premiumFeatures = [
  { icon: Check, text: '高级版所有功能' },
  { icon: Bot, text: 'AI 深度文案' },
  { icon: Star, text: '实体光栅画' },
]

async function handlePay(plan: 'full' | 'premium') {
  isProcessing.value = true
  selectedPlan.value = plan

  try {
    await startPayment(plan)
    payStep.value = 'qrcode'
  } catch (err) {
    console.error('支付失败:', err)
  }

  isProcessing.value = false
}

async function handleConfirmPay() {
  isProcessing.value = true
  try {
    const success = await userConfirmPay()
    if (success) {
      payStep.value = 'done'
    }
  } catch (err) {
    console.error('确认支付失败:', err)
  }
  isProcessing.value = false
}

function copyOrderSuffix() {
  if (currentOrder?.value?.orderSuffix) {
    navigator.clipboard.writeText(currentOrder.value.orderSuffix)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function handleClose() {
  if (!isProcessing.value) {
    payStep.value = 'select'
    emit('close')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center px-4"
      >
        <!-- 遮罩 - 半透明毛玻璃，隐约可见 3D 场景 -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-md"
          @click="handleClose"
        ></div>

        <!-- 弹窗主体 - 圆润、融入星空风格 -->
        <div class="relative w-full max-w-sm overflow-hidden animate-in">

          <!-- 关闭按钮 -->
          <button
            v-if="!isProcessing"
            class="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/10 transition-all"
            @click="handleClose"
          >
            <X :size="14" />
          </button>

          <!-- ===== 步骤1：选择套餐 ===== -->
          <template v-if="payStep === 'select'">
            <div class="glass rounded-2xl overflow-hidden">
              <!-- 顶部 - 渐变装饰条 -->
              <div class="h-1 bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#ffd700]"></div>

              <!-- 标题区 -->
              <div class="px-6 pt-6 pb-3 text-center">
                <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#00d4ff]/20 to-[#8b5cf6]/20 mb-3">
                  <Sparkles class="text-[#00d4ff]" :size="20" />
                </div>
                <h2 class="font-display text-lg text-white tracking-wide">
                  {{ currentText.title }}
                </h2>
                <p class="text-white/40 text-xs mt-1.5 font-body leading-relaxed">
                  {{ currentText.desc }}
                </p>
              </div>

              <!-- 免费版已包含的提示 - 诚实透明 -->
              <div class="mx-6 mb-3 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <p class="text-white/30 text-[10px] font-body text-center">
                  免费版已包含：10个节点 · 自动播放 · 截图导出 · 视频导出
                </p>
              </div>

              <!-- 套餐选择 -->
              <div class="px-5 pb-3 space-y-2.5">
                <!-- 高级版 -->
                <button
                  class="w-full relative rounded-xl border transition-all duration-300 text-left"
                  :class="selectedPlan === 'full' ? 'border-[#00d4ff]/50 bg-[#00d4ff]/[0.07]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'"
                  :disabled="isProcessing"
                  @click="selectedPlan = 'full'"
                >
                  <div class="absolute -top-2 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#00d4ff] text-black">推荐</div>
                  <div class="p-3.5">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <Sparkles :size="14" class="text-[#00d4ff]" />
                        <span class="text-white font-display text-sm">高级版</span>
                      </div>
                      <div>
                        <span class="text-[#00d4ff] font-display text-lg font-bold">¥19.9</span>
                        <span class="text-white/20 text-[10px] ml-0.5">永久</span>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span v-for="f in fullFeatures" :key="f.text" class="flex items-center gap-1 text-white/40 text-[10px]">
                        <component :is="f.icon" :size="10" class="text-[#00d4ff]/60" />
                        {{ f.text }}
                      </span>
                    </div>
                  </div>
                </button>

                <!-- 纪念版 -->
                <button
                  class="w-full relative rounded-xl border transition-all duration-300 text-left"
                  :class="selectedPlan === 'premium' ? 'border-[#ffd700]/50 bg-[#ffd700]/[0.07]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'"
                  :disabled="isProcessing"
                  @click="selectedPlan = 'premium'"
                >
                  <div class="p-3.5">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <Crown :size="14" class="text-[#ffd700]" />
                        <span class="text-white font-display text-sm">纪念版</span>
                      </div>
                      <div>
                        <span class="text-[#ffd700] font-display text-lg font-bold">¥99</span>
                        <span class="text-white/20 text-[10px] ml-0.5">永久</span>
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span v-for="f in premiumFeatures" :key="f.text" class="flex items-center gap-1 text-white/40 text-[10px]">
                        <component :is="f.icon" :size="10" class="text-[#ffd700]/60" />
                        {{ f.text }}
                      </span>
                    </div>
                  </div>
                </button>
              </div>

              <!-- 支付按钮 -->
              <div class="px-5 pb-3">
                <button
                  class="w-full py-2.5 rounded-xl font-display text-sm tracking-wide transition-all duration-300 disabled:opacity-50"
                  :class="selectedPlan === 'full' ? 'bg-gradient-to-r from-[#00d4ff] to-[#0099ff] text-black' : 'bg-gradient-to-r from-[#ffd700] to-[#ff9500] text-black'"
                  :disabled="isProcessing"
                  @click="handlePay(selectedPlan)"
                >
                  <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                    <Loader2 :size="14" class="animate-spin" /> 处理中...
                  </span>
                  <span v-else>
                    升级 {{ selectedPlan === 'full' ? '¥19.9' : '¥99' }}
                  </span>
                </button>
              </div>

              <!-- 法律合规链接 -->
              <div class="px-5 pb-4 text-center">
                <p class="text-white/15 text-[9px] font-body">
                  付款即表示同意
                  <a href="/terms.html" target="_blank" class="text-white/25 hover:text-white/40 underline">用户协议</a>
                  和
                  <a href="/privacy.html" target="_blank" class="text-white/25 hover:text-white/40 underline">隐私政策</a>
                </p>
              </div>
            </div>
          </template>

          <!-- ===== 步骤2：扫码支付 ===== -->
          <template v-if="payStep === 'qrcode'">
            <div class="glass rounded-2xl overflow-hidden">
              <div class="h-1 bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#ffd700]"></div>
              <div class="p-5">
                <h3 class="font-display text-base text-white text-center mb-4">扫码支付</h3>

                <div class="flex flex-col items-center gap-3">
                  <!-- 双收款码切换 -->
                  <div class="flex gap-2">
                    <button
                      class="px-3 py-1 rounded-lg text-[11px] font-body transition-all"
                      :class="payChannel === 'wechat' ? 'bg-[#07c160]/15 text-[#07c160] border border-[#07c160]/30' : 'bg-white/[0.03] text-white/30 border border-white/[0.06]'"
                      @click="payChannel = 'wechat'"
                    >
                      微信支付
                    </button>
                    <button
                      class="px-3 py-1 rounded-lg text-[11px] font-body transition-all"
                      :class="payChannel === 'alipay' ? 'bg-[#1677ff]/15 text-[#1677ff] border border-[#1677ff]/30' : 'bg-white/[0.03] text-white/30 border border-white/[0.06]'"
                      @click="payChannel = 'alipay'"
                    >
                      支付宝
                    </button>
                  </div>

                  <!-- 收款码图片 -->
                  <div class="w-44 h-44 rounded-xl bg-white p-1.5 shadow-lg shadow-black/30">
                    <img
                      :src="payChannel === 'wechat' ? '/qr-wechat.jpg' : '/qr-alipay.jpg'"
                      :alt="payChannel === 'wechat' ? '微信收款码' : '支付宝收款码'"
                      class="w-full h-full object-contain rounded-lg"
                    />
                  </div>

                  <!-- 金额 -->
                  <span class="font-display text-xl text-white font-bold">
                    ¥{{ currentOrder ? (currentOrder.amount / 100).toFixed(1) : '0' }}
                  </span>

                  <!-- 付款备注 -->
                  <div class="w-full bg-white/[0.03] rounded-lg p-2.5 border border-white/[0.06]">
                    <div class="text-white/30 text-[10px] mb-1 font-body">付款备注（重要）</div>
                    <div class="flex items-center justify-between">
                      <span class="text-[#00d4ff] font-mono text-base font-bold tracking-widest">
                        {{ currentOrder?.orderSuffix }}
                      </span>
                      <button
                        class="flex items-center gap-1 text-white/30 hover:text-white/50 text-[10px] transition-colors"
                        @click="copyOrderSuffix"
                      >
                        <component :is="copied ? CheckCircle : Copy" :size="12" />
                        {{ copied ? '已复制' : '复制' }}
                      </button>
                    </div>
                  </div>

                  <p class="text-white/25 text-[10px] text-center font-body leading-relaxed">
                    请使用{{ payChannel === 'wechat' ? '微信' : '支付宝' }}扫码付款<br/>
                    付款时备注填写上方数字
                  </p>

                  <!-- 我已付款按钮 -->
                  <button
                    class="w-full py-2.5 rounded-xl font-display text-sm tracking-wide bg-gradient-to-r from-[#00d4ff] to-[#0099ff] text-black transition-all disabled:opacity-50"
                    :disabled="isProcessing"
                    @click="handleConfirmPay"
                  >
                    <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                      <Loader2 :size="14" class="animate-spin" /> 确认中...
                    </span>
                    <span v-else>我已付款</span>
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- ===== 步骤3：支付成功 ===== -->
          <template v-if="payStep === 'done'">
            <div class="glass rounded-2xl overflow-hidden">
              <div class="h-1 bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#ffd700]"></div>
              <div class="p-6 flex flex-col items-center gap-3">
                <div class="w-14 h-14 rounded-full bg-[#00d4ff]/15 flex items-center justify-center">
                  <CheckCircle :size="28" class="text-[#00d4ff]" />
                </div>
                <h3 class="font-display text-lg text-white">升级成功</h3>
                <p class="text-white/40 text-xs text-center font-body">
                  你已解锁高级版全部功能<br/>开始体验更多精彩吧
                </p>
                <button
                  class="mt-1 px-6 py-2 rounded-xl font-display text-sm bg-gradient-to-r from-[#00d4ff] to-[#0099ff] text-black"
                  @click="handleClose"
                >
                  开始探索
                </button>
              </div>
            </div>
          </template>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active { transition: all 0.3s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from { opacity: 0; }
.modal-leave-to { opacity: 0; }
.animate-in { animation: slideUp 0.3s ease; }
@keyframes slideUp {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
