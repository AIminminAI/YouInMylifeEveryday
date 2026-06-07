<script setup lang="ts">
import { Share2, Copy, Check } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{
  nodeTitle: string
}>()

const copied = ref(false)
const showShareMenu = ref(false)

const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
const shareText = `我在「生命星轨」记录了"${props.nodeTitle}"，快来看看你的星轨 → `

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareText + shareUrl)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    // fallback
    const input = document.createElement('input')
    input.value = shareText + shareUrl
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

function shareToWeChat() {
  // 微信内使用 JS-SDK 分享，这里先复制链接
  copyLink()
  showShareMenu.value = false
}

function shareToWeibo() {
  const url = `https://service.weibo.com/share/share.php?title=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  window.open(url, '_blank', 'width=600,height=400')
  showShareMenu.value = false
}

function shareToTwitter() {
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
  window.open(url, '_blank', 'width=600,height=400')
  showShareMenu.value = false
}
</script>

<template>
  <div class="relative" @mouseleave="showShareMenu = false">
    <!-- 分享菜单 -->
    <Transition name="share">
      <div
        v-if="showShareMenu"
        class="absolute bottom-full right-0 mb-2 glass rounded-xl overflow-hidden min-w-[140px]"
      >
        <button
          class="w-full px-4 py-2.5 flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
          @click="copyLink"
        >
          <Check v-if="copied" :size="14" class="text-green-400" />
          <Copy v-else :size="14" />
          <span class="text-xs font-body">{{ copied ? '已复制' : '复制链接' }}</span>
        </button>
        <button
          class="w-full px-4 py-2.5 flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
          @click="shareToWeChat"
        >
          <span class="text-sm">💬</span>
          <span class="text-xs font-body">微信好友</span>
        </button>
        <button
          class="w-full px-4 py-2.5 flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
          @click="shareToWeibo"
        >
          <span class="text-sm">📢</span>
          <span class="text-xs font-body">微博</span>
        </button>
        <button
          class="w-full px-4 py-2.5 flex items-center gap-2 text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
          @click="shareToTwitter"
        >
          <span class="text-sm">🐦</span>
          <span class="text-xs font-body">Twitter</span>
        </button>
      </div>
    </Transition>

    <!-- 分享按钮 -->
    <button
      class="glow-btn glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 group"
      @click="showShareMenu = !showShareMenu"
    >
      <Share2 :size="16" class="transition-transform duration-300 group-hover:scale-110" />
      <span class="text-xs font-body tracking-wide">分享</span>
    </button>
  </div>
</template>

<style scoped>
.share-enter-active {
  transition: all 0.2s ease;
}
.share-leave-active {
  transition: all 0.15s ease;
}
.share-enter-from {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}
.share-leave-to {
  opacity: 0;
  transform: translateY(4px) scale(0.95);
}
</style>
