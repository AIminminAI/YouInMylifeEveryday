<script setup lang="ts">
import { ref } from 'vue'
import { X, Sparkles, Crown, Check, Loader2, Copy, CheckCircle } from 'lucide-vue-next'
import { useSubscription } from '@/composables/useSubscription'

const props = defineProps<{
  visible: boolean
  trigger: 'node' | 'export-video' | 'export-hd' | 'skin'
}>()

const emit = defineEmits<{
  close: []
}>()

const {
  simulatePayment,
  startPayment,
  userConfirmPay,
  currentOrder,
  showQRCode,
  isPaying,
} = useSubscription()

const isProcessing = ref(false)
const selectedPlan = ref<'full' | 'premium'>('full')
const payStep = ref<'select' | 'qrcode' | 'done'>('select')
const payChannel = ref<'wechat' | 'alipay'>('wechat')
const copied = ref(false)

// 根据触发来源显示不同文案
const triggerTexts: Record<string, { title: string; desc: string }> = {
  node: {
    title: '升级高级版',
    desc: '解锁无水印视频导出、更多星空皮肤和自定义标题',
  },
  'export-video': {
    title: '升级去除视频水印',
    desc: '升级高级版后，导出视频将不带水印，还可以使用更多皮肤',
  },
  'export-hd': {
    title: '升级高级版',
    desc: '升级后可使用更多星空皮肤和自定义标题',
  },
  skin: {
    title: '解锁更多星轨皮肤',
    desc: '赛博朋克、水墨画卷... 每种风格都是一种心情',
  },
}

const currentText = triggerTexts[props.trigger] || triggerTexts.node

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
        <!-- 遮罩 -->
        <div
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          @click="handleClose"
        ></div>

        <!-- 弹窗主体 -->
        <div class="relative glass rounded-2xl max-w-md w-full overflow-hidden animate-in">

          <!-- 关闭按钮 -->
          <button
            v-if="!isProcessing"
            class="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all z-10"
            @click="handleClose"
          >
            <X :size="16" />
          </button>

          <!-- ===== 步骤1：选择套餐 ===== -->
          <template v-if="payStep === 'select'">
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
              <!-- 高级版 -->
              <button
                class="w-full relative rounded-xl border transition-all duration-300 text-left"
                :class="selectedPlan === 'full' ? 'border-[#00d4ff]/60 bg-[#00d4ff]/10 shadow-[0_0_20px_rgba(0,212,255,0.15)]' : 'border-white/10 bg-white/[0.03] hover:border-white/20'"
                :disabled="isProcessing"
                @click="selectedPlan = 'full'"
              >
                <div class="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00d4ff] text-black">最受欢迎</div>
                <div class="p-4">
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <Sparkles :size="16" class="text-[#00d4ff]" />
                      <span class="text-white font-display text-sm">高级版</span>
                    </div>
                    <div class="text-right">
                      <span class="text-[#00d4ff] font-display text-xl font-bold">¥19.9</span>
                      <span class="text-white/30 text-xs ml-1">/永久</span>
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-x-4 gap-y-1">
                    <span class="flex items-center gap-1 text-white/50 text-xs"><Check :size="12" class="text-[#00d4ff]" /> 无水印视频导出</span>
                    <span class="flex items-center gap-1 text-white/50 text-xs"><Check :size="12" class="text-[#00d4ff]" /> 3 种星空皮肤</span>
                    <span class="flex items-center gap-1 text-white/50 text-xs"><Check :size="12" class="text-[#00d4ff]" /> 自定义标题</span>
                  </div>
                </div>
              </button>

              <!-- 纪念版 -->
              <button
                class="w-full relative rounded-xl border transition-all duration-300 text-left"
                :class="selectedPlan === 'premium' ? 'border-[#ffd700]/60 bg-[#ffd700]/10 shadow-[0_0_20px_rgba(255,215,0,0.15)]' : 'border-white/10 bg-white/[0.03] hover:border-white/20'"
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
                    <span class="flex items-center gap-1 text-white/50 text-xs"><Check :size="12" class="text-[#ffd700]" /> 高级版所有功能</span>
                    <span class="flex items-center gap-1 text-white/50 text-xs"><Check :size="12" class="text-[#ffd700]" /> AI 自动文案</span>
                    <span class="flex items-center gap-1 text-white/50 text-xs"><Check :size="12" class="text-[#ffd700]" /> 实体光栅画</span>
                  </div>
                </div>
              </button>
            </div>

            <!-- 支付按钮 -->
            <div class="px-6 pb-4">
              <button
                class="w-full py-3 rounded-xl font-display text-sm tracking-wide transition-all duration-300 disabled:opacity-50"
                :class="selectedPlan === 'full' ? 'bg-gradient-to-r from-[#00d4ff] to-[#0099ff] text-black hover:shadow-[0_0_24px_rgba(0,212,255,0.4)]' : 'bg-gradient-to-r from-[#ffd700] to-[#ff9500] text-black hover:shadow-[0_0_24px_rgba(255,215,0,0.4)]'"
                :disabled="isProcessing"
                @click="handlePay(selectedPlan)"
              >
                <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                  <Loader2 :size="16" class="animate-spin" /> 处理中...
                </span>
                <span v-else>
                  立即升级 {{ selectedPlan === 'full' ? '¥19.9' : '¥99' }}
                </span>
              </button>
            </div>

            <!-- 法律合规链接 -->
            <div class="px-6 pb-5 text-center">
              <p class="text-white/20 text-[10px] font-body">
                付款即表示同意
                <a href="/terms.html" target="_blank" class="text-white/30 hover:text-white/50 underline">用户协议</a>
                和
                <a href="/privacy.html" target="_blank" class="text-white/30 hover:text-white/50 underline">隐私政策</a>
              </p>
            </div>
          </template>

          <!-- ===== 步骤2：扫码支付 ===== -->
          <template v-if="payStep === 'qrcode'">
            <div class="p-6">
              <h3 class="font-display text-lg text-white text-center mb-4">扫码支付</h3>

              <!-- 收款码区域 -->
              <div class="flex flex-col items-center gap-4">
                <!-- 双收款码切换 -->
                <div class="flex gap-2 mb-2">
                  <button
                    class="px-3 py-1.5 rounded-lg text-xs font-body transition-all"
                    :class="payChannel === 'wechat' ? 'bg-[#07c160]/20 text-[#07c160] border border-[#07c160]/40' : 'bg-white/5 text-white/40 border border-white/10'"
                    @click="payChannel = 'wechat'"
                  >
                    微信支付
                  </button>
                  <button
                    class="px-3 py-1.5 rounded-lg text-xs font-body transition-all"
                    :class="payChannel === 'alipay' ? 'bg-[#1677ff]/20 text-[#1677ff] border border-[#1677ff]/40' : 'bg-white/5 text-white/40 border border-white/10'"
                    @click="payChannel = 'alipay'"
                  >
                    支付宝
                  </button>
                </div>

                <!-- 收款码图片 -->
                <div class="w-52 h-52 rounded-xl bg-white p-2 shadow-lg shadow-black/30">
                  <img
                    :src="payChannel === 'wechat' ? '/qr-wechat.jpg' : '/qr-alipay.jpg'"
                    :alt="payChannel === 'wechat' ? '微信收款码' : '支付宝收款码'"
                    class="w-full h-full object-contain rounded-lg"
                  />
                </div>

                <!-- 金额 -->
                <div class="text-center">
                  <span class="font-display text-2xl text-white font-bold">
                    ¥{{ currentOrder ? (currentOrder.amount / 100).toFixed(1) : '0' }}
                  </span>
                </div>

                <!-- 付款备注 -->
                <div class="w-full bg-white/5 rounded-lg p-3 border border-white/10">
                  <div class="text-white/40 text-xs mb-1 font-body">付款备注（重要）</div>
                  <div class="flex items-center justify-between">
                    <span class="text-[#00d4ff] font-mono text-lg font-bold tracking-widest">
                      {{ currentOrder?.orderSuffix }}
                    </span>
                    <button
                      class="flex items-center gap-1 text-white/40 hover:text-white/60 text-xs transition-colors"
                      @click="copyOrderSuffix"
                    >
                      <component :is="copied ? CheckCircle : Copy" :size="14" />
                      {{ copied ? '已复制' : '复制' }}
                    </button>
                  </div>
                </div>

                <!-- 提示 -->
                <p class="text-white/30 text-xs text-center font-body leading-relaxed">
                  请使用{{ payChannel === 'wechat' ? '微信' : '支付宝' }}扫描上方收款码<br/>
                  付款时备注填写上方数字，方便我们确认
                </p>

                <!-- 我已付款按钮 -->
                <button
                  class="w-full py-3 rounded-xl font-display text-sm tracking-wide bg-gradient-to-r from-[#00d4ff] to-[#0099ff] text-black hover:shadow-[0_0_24px_rgba(0,212,255,0.4)] transition-all disabled:opacity-50"
                  :disabled="isProcessing"
                  @click="handleConfirmPay"
                >
                  <span v-if="isProcessing" class="flex items-center justify-center gap-2">
                    <Loader2 :size="16" class="animate-spin" /> 确认中...
                  </span>
                  <span v-else>我已付款</span>
                </button>
              </div>
            </div>
          </template>

          <!-- ===== 步骤3：支付成功 ===== -->
          <template v-if="payStep === 'done'">
            <div class="p-8 flex flex-col items-center gap-4">
              <div class="w-16 h-16 rounded-full bg-[#00d4ff]/20 flex items-center justify-center">
                <CheckCircle :size="32" class="text-[#00d4ff]" />
              </div>
              <h3 class="font-display text-xl text-white">升级成功</h3>
              <p class="text-white/50 text-sm text-center font-body">
                你已解锁高级版全部功能<br/>开始体验更多精彩吧
              </p>
              <button
                class="mt-2 px-8 py-2.5 rounded-xl font-display text-sm bg-gradient-to-r from-[#00d4ff] to-[#0099ff] text-black"
                @click="handleClose"
              >
                开始探索
              </button>
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
