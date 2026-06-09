<script setup lang="ts">
import { ref } from 'vue'
import { X, Sparkles } from 'lucide-vue-next'
import { TEMPLATES, createTemplateData, saveTimelineData, type TemplateMeta } from '@/data/timelineData'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select', templateId: string): void
}>()

const selectedId = ref<string | null>(null)
const confirming = ref(false)

function selectTemplate(template: TemplateMeta) {
  selectedId.value = template.id
  confirming.value = true
}

function confirmSelect() {
  if (!selectedId.value) return

  // 创建新模板数据
  const data = createTemplateData(selectedId.value)
  saveTimelineData(data)

  emit('select', selectedId.value)
  confirming.value = false
  selectedId.value = null
}

function cancelConfirm() {
  confirming.value = false
  selectedId.value = null
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
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="emit('close')"></div>

        <!-- 内容 -->
        <div class="relative w-full max-w-md max-h-[85vh] overflow-y-auto">
          <!-- 关闭按钮 -->
          <button
            class="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            @click="emit('close')"
          >
            <X :size="16" />
          </button>

          <!-- 标题 -->
          <div class="text-center mb-6">
            <div class="flex items-center justify-center gap-2 mb-2">
              <Sparkles class="text-[#00d4ff]" :size="18" />
              <h2 class="font-display text-xl text-white tracking-wider">选择你的星轨</h2>
            </div>
            <p class="text-white/40 text-xs font-body">每个模板都有专属的故事线，选一个最触动你的</p>
          </div>

          <!-- 模板列表 -->
          <div class="space-y-3">
            <button
              v-for="template in TEMPLATES"
              :key="template.id"
              class="w-full text-left glass rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
              :class="selectedId === template.id ? 'ring-2 ring-[#00d4ff]/50' : ''"
              @click="selectTemplate(template)"
            >
              <!-- 渐变预览条 -->
              <div
                class="h-2 w-full"
                :style="{ background: template.preview }"
              ></div>

              <div class="p-4">
                <div class="flex items-center justify-between mb-1">
                  <span class="font-display text-base text-white">{{ template.name }}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-body bg-white/5 text-white/40 border border-white/10">
                    {{ template.tag }}
                  </span>
                </div>
                <p class="text-sm text-[#00d4ff]/60 font-body mb-1">{{ template.subtitle }}</p>
                <p class="text-xs text-white/30 font-body">{{ template.description }}</p>
              </div>
            </button>
          </div>

          <!-- 确认弹窗 -->
          <Transition name="fade">
            <div
              v-if="confirming"
              class="fixed inset-0 z-[110] flex items-center justify-center px-4"
            >
              <div class="absolute inset-0 bg-black/60" @click="cancelConfirm"></div>
              <div class="relative glass rounded-2xl p-6 max-w-xs w-full text-center">
                <h3 class="font-display text-lg text-white mb-2">切换模板？</h3>
                <p class="text-white/40 text-xs font-body mb-4">
                  切换模板会替换当前所有节点数据。<br>已上传的照片和编辑的文案将丢失。
                </p>
                <div class="flex gap-3">
                  <button
                    class="flex-1 py-2.5 rounded-xl text-xs font-body bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-all"
                    @click="cancelConfirm"
                  >
                    取消
                  </button>
                  <button
                    class="flex-1 py-2.5 rounded-xl text-xs font-body bg-[#00d4ff]/20 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/30 transition-all"
                    @click="confirmSelect"
                  >
                    确认切换
                  </button>
                </div>
              </div>
            </div>
          </Transition>
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
.fade-enter-active { transition: all 0.2s ease; }
.fade-leave-active { transition: all 0.15s ease; }
.fade-enter-from { opacity: 0; transform: scale(0.95); }
.fade-leave-to { opacity: 0; transform: scale(0.95); }
</style>
