import { ref, computed, watch } from 'vue'

export type PlanType = 'free' | 'full' | 'premium'

const STORAGE_KEY = 'starorbit_plan'

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

const currentPlan = ref<PlanType>(loadPlan())
const FREE_NODE_LIMIT = 3

export function useSubscription() {
  const isFree = computed(() => currentPlan.value === 'free')
  const isFull = computed(() => currentPlan.value === 'full')
  const isPremium = computed(() => currentPlan.value === 'premium')
  const isPaid = computed(() => currentPlan.value !== 'free')

  const freeNodeLimit = FREE_NODE_LIMIT

  // 监听付费状态变化，持久化
  watch(currentPlan, (plan) => {
    savePlan(plan)
  })

  function isNodeLocked(nodeIndex: number): boolean {
    return currentPlan.value === 'free' && nodeIndex >= FREE_NODE_LIMIT
  }

  function canAccessNode(nodeIndex: number): boolean {
    return !isNodeLocked(nodeIndex)
  }

  function canExportHD(): boolean {
    return currentPlan.value !== 'free'
  }

  function canExportVideo(): boolean {
    return currentPlan.value !== 'free'
  }

  function upgradeToFull() {
    currentPlan.value = 'full'
  }

  function upgradeToPremium() {
    currentPlan.value = 'premium'
  }

  function simulatePayment(plan: 'full' | 'premium'): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (plan === 'full') {
          upgradeToFull()
        } else {
          upgradeToPremium()
        }
        resolve(true)
      }, 1500)
    })
  }

  return {
    currentPlan,
    isFree,
    isFull,
    isPremium,
    isPaid,
    freeNodeLimit,
    isNodeLocked,
    canAccessNode,
    canExportHD,
    canExportVideo,
    upgradeToFull,
    upgradeToPremium,
    simulatePayment,
  }
}
