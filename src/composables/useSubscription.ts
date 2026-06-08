import { ref, computed, watch } from 'vue'
import {
  createOrder,
  confirmPay,
  getPaymentStatus,
  type CreateOrderResult,
} from '@/services/api'

export type PlanType = 'free' | 'full' | 'premium'

const STORAGE_KEY = 'starorbit_plan'
const USER_ID_KEY = 'starorbit_user_id'

function loadPlan(): PlanType {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'full' || saved === 'premium') return saved
  } catch { /* ignore */ }
  return 'free'
}

function savePlan(plan: PlanType) {
  try {
    localStorage.setItem(STORAGE_KEY, plan)
  } catch { /* ignore */ }
}

function getUserId(): string {
  try {
    let id = localStorage.getItem(USER_ID_KEY)
    if (!id) {
      id = 'user_' + Math.random().toString(36).slice(2, 10)
      localStorage.setItem(USER_ID_KEY, id)
    }
    return id
  } catch {
    return 'user_default'
  }
}

const currentPlan = ref<PlanType>(loadPlan())
const userId = ref(getUserId())
const FREE_NODE_LIMIT = 10

// 支付状态
const isPaying = ref(false)
const currentOrder = ref<CreateOrderResult | null>(null)
const showQRCode = ref(false)

export function useSubscription() {
  const isFree = computed(() => currentPlan.value === 'free')
  const isFull = computed(() => currentPlan.value === 'full')
  const isPremium = computed(() => currentPlan.value === 'premium')
  const isPaid = computed(() => currentPlan.value !== 'free')

  const freeNodeLimit = FREE_NODE_LIMIT

  watch(currentPlan, (plan) => {
    savePlan(plan)
  })

  // 免费版：所有10个节点均可访问，不再有锁定
  function isNodeLocked(_nodeIndex: number): boolean {
    return false
  }

  function canAccessNode(_nodeIndex: number): boolean {
    return true
  }

  // 免费版截图无水印
  function canExportHD(): boolean {
    return true
  }

  // 视频导出：免费版带水印，付费版无水印
  function canExportVideo(): boolean {
    return true
  }

  function canExportVideoWithoutWatermark(): boolean {
    return currentPlan.value !== 'free'
  }

  // 皮肤：免费版只有1种，付费版有3种
  function canAccessAllSkins(): boolean {
    return currentPlan.value !== 'free'
  }

  // 自定义标题：仅付费版
  function canCustomTitle(): boolean {
    return currentPlan.value !== 'free'
  }

  function upgradeToFull() {
    currentPlan.value = 'full'
  }

  function upgradeToPremium() {
    currentPlan.value = 'premium'
  }

  // ========== 收款码支付流程 ==========
  async function startPayment(plan: 'full' | 'premium'): Promise<boolean> {
    isPaying.value = true

    try {
      const order = await createOrder(userId.value, plan)
      currentOrder.value = order

      showQRCode.value = true

      return true
    } catch (err) {
      console.error('[Pay] 创建订单失败:', err)
      return false
    } finally {
      isPaying.value = false
    }
  }

  // 用户扫码付款后点击"我已付款"
  async function userConfirmPay(): Promise<boolean> {
    if (!currentOrder.value) return false

    try {
      const result = await confirmPay(currentOrder.value.orderId, userId.value)

      if (result.success) {
        if (result.plan === 'full') {
          upgradeToFull()
        } else if (result.plan === 'premium') {
          upgradeToPremium()
        }
        showQRCode.value = false
        currentOrder.value = null
        return true
      }

      return false
    } catch (err) {
      console.error('[Pay] 确认支付失败:', err)
      return false
    }
  }

  // 从服务端同步付费状态
  async function syncPlanFromServer() {
    try {
      const status = await getPaymentStatus(userId.value)
      if (status.plan && status.plan !== currentPlan.value) {
        currentPlan.value = status.plan as PlanType
      }
    } catch { /* 网络错误时保持本地状态 */ }
  }

  // 兼容旧接口
  function simulatePayment(plan: 'full' | 'premium'): Promise<boolean> {
    return startPayment(plan)
  }

  return {
    currentPlan,
    userId,
    isFree,
    isFull,
    isPremium,
    isPaid,
    isPaying,
    freeNodeLimit,
    isNodeLocked,
    canAccessNode,
    canExportHD,
    canExportVideo,
    canExportVideoWithoutWatermark,
    canAccessAllSkins,
    canCustomTitle,
    upgradeToFull,
    upgradeToPremium,
    startPayment,
    userConfirmPay,
    simulatePayment,
    syncPlanFromServer,
    // 收款码相关
    currentOrder,
    showQRCode,
  }
}
