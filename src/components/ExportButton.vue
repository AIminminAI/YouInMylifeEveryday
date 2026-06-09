<script setup lang="ts">
import { Download, Film, Image, ChevronDown } from 'lucide-vue-next'
import { ref } from 'vue'

defineProps<{
  isExportingVideo: boolean
  exportProgress: number
}>()

const emit = defineEmits<{
  exportImage: []
  exportVideo: []
}>()

const showMenu = ref(false)

function toggleMenu() {
  showMenu.value = !showMenu.value
}

function handleImage() {
  showMenu.value = false
  emit('exportImage')
}

function handleVideo() {
  showMenu.value = false
  emit('exportVideo')
}

function onClickOutside() {
  showMenu.value = false
}
</script>

<template>
  <div class="fixed top-6 right-6 z-20 pointer-events-auto" @mouseleave="onClickOutside">
    <!-- 录制进度条 -->
    <div
      v-if="isExportingVideo"
      class="absolute -top-1 left-0 right-0 h-1 bg-white/10 rounded-full overflow-hidden"
    >
      <div
        class="h-full bg-gradient-to-r from-[#00d4ff] to-[#8b5cf6] transition-all duration-300"
        :style="{ width: `${exportProgress}%` }"
      ></div>
    </div>

    <!-- 下拉菜单 -->
    <Transition name="menu">
      <div
        v-if="showMenu && !isExportingVideo"
        class="absolute top-full right-0 mt-2 glass rounded-xl overflow-hidden min-w-[180px]"
      >
        <button
          class="w-full px-4 py-3.5 flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
          @click="handleImage"
        >
          <Image :size="16" />
          <div>
            <div class="text-sm font-body">保存截图</div>
            <div class="text-[10px] text-white/30 font-body">当前画面 PNG</div>
          </div>
        </button>
        <button
          class="w-full px-4 py-3.5 flex items-center gap-3 text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
          @click="handleVideo"
        >
          <Film :size="16" />
          <div>
            <div class="text-sm font-body">导出视频</div>
            <div class="text-[10px] text-white/30 font-body">完整星轨漫游 WebM</div>
          </div>
        </button>
      </div>
    </Transition>

    <!-- 主按钮 -->
    <button
      class="glow-btn glass rounded-xl px-4 py-2.5 flex items-center gap-2 text-white/70 hover:text-white transition-all duration-300 group"
      :disabled="isExportingVideo"
      @click="isExportingVideo ? null : toggleMenu()"
    >
      <Download
        v-if="!isExportingVideo"
        :size="16"
        class="transition-transform duration-300 group-hover:translate-y-0.5"
      />
      <div
        v-else
        class="w-4 h-4 border-2 border-t-[#00d4ff] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
      ></div>
      <span class="text-xs font-body tracking-wide">
        {{ isExportingVideo ? `录制中 ${exportProgress}%` : '导出' }}
      </span>
      <ChevronDown v-if="!isExportingVideo" :size="12" class="text-white/30" />
    </button>
  </div>
</template>

<style scoped>
.menu-enter-active {
  transition: all 0.2s ease;
}
.menu-leave-active {
  transition: all 0.15s ease;
}
.menu-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.95);
}
</style>
