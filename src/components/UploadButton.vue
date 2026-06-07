<script setup lang="ts">
import { ref } from 'vue'
import { addTimelineNode } from '@/services/api'

const props = defineProps<{
  userId: string
}>()

const emit = defineEmits<{
  (e: 'node-added', node: any): void
}>()

const isUploading = ref(false)
const showForm = ref(false)
const previewUrl = ref('')
const selectedFile = ref<File | null>(null)
const formYear = ref(new Date().getFullYear())
const formTitle = ref('')
const aiDescription = ref('')
const isGeneratingAI = ref(false)

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  showForm.value = true

  // 自动从文件名提取年份
  const yearMatch = file.name.match(/(19|20)\d{2}/)
  if (yearMatch) {
    formYear.value = parseInt(yearMatch[0])
  }
}

async function handleSubmit() {
  if (!selectedFile.value) return

  isUploading.value = true
  try {
    const result = await addTimelineNode(props.userId, {
      year: formYear.value,
      title: formTitle.value || undefined,
    })

    if (result.error) {
      alert('上传失败：' + result.error)
      return
    }

    emit('node-added', result)
    resetForm()
  } catch (err) {
    alert('上传失败，请重试')
  } finally {
    isUploading.value = false
  }
}

function resetForm() {
  showForm.value = false
  previewUrl.value = ''
  selectedFile.value = null
  formTitle.value = ''
  aiDescription.value = ''
}

function toggleUpload() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = handleFileSelect
  input.click()
}
</script>

<template>
  <!-- 上传按钮 -->
  <button
    class="fixed bottom-6 left-6 z-20 pointer-events-auto
           w-12 h-12 rounded-full
           bg-white/10 backdrop-blur-md border border-white/20
           flex items-center justify-center
           hover:bg-white/20 transition-all duration-300
           group"
    title="添加时光节点"
    @click="toggleUpload"
  >
    <svg class="w-5 h-5 text-white/60 group-hover:text-white/90 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
    </svg>
  </button>

  <!-- 上传表单弹窗 -->
  <Transition name="modal">
    <div
      v-if="showForm"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- 遮罩 -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="resetForm" />

      <!-- 表单卡片 -->
      <div class="relative w-full max-w-md bg-[#1a1a2e]/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl">
        <h3 class="font-display text-lg text-white/90 mb-4">添加时光节点</h3>

        <!-- 图片预览 -->
        <div class="mb-4 rounded-xl overflow-hidden border border-white/10">
          <img :src="previewUrl" alt="预览" class="w-full h-48 object-cover" />
        </div>

        <!-- 年份 -->
        <div class="mb-3">
          <label class="block text-xs text-white/40 mb-1 font-body">年份</label>
          <input
            v-model.number="formYear"
            type="number"
            min="1900"
            max="2099"
            class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm font-body focus:outline-none focus:border-white/30"
          />
        </div>

        <!-- 标题 -->
        <div class="mb-3">
          <label class="block text-xs text-white/40 mb-1 font-body">标题</label>
          <input
            v-model="formTitle"
            type="text"
            placeholder="如：降生、求学、遇见你..."
            class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white/80 text-sm font-body placeholder:text-white/20 focus:outline-none focus:border-white/30"
          />
        </div>

        <!-- AI 文案提示 -->
        <div v-if="isGeneratingAI" class="mb-3 flex items-center gap-2 text-xs text-white/40">
          <div class="w-3 h-3 border-2 border-white/30 border-t-white/60 rounded-full animate-spin" />
          AI 正在为你生成感人文案...
        </div>

        <!-- 按钮 -->
        <div class="flex gap-3 mt-5">
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-body
                   bg-white/5 border border-white/10 text-white/60
                   hover:bg-white/10 transition-all"
            @click="resetForm"
          >
            取消
          </button>
          <button
            class="flex-1 py-2.5 rounded-xl text-sm font-body
                   bg-gradient-to-r from-indigo-500/80 to-purple-500/80
                   text-white shadow-lg shadow-indigo-500/20
                   hover:shadow-indigo-500/40 transition-all
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isUploading"
            @click="handleSubmit"
          >
            {{ isUploading ? '上传中...' : '添加到星轨' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
