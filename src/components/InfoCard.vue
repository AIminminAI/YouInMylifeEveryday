<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { Camera, Pencil, Check, X, Trash2 } from 'lucide-vue-next'
import type { TimeNode } from '@/data/timelineData'

const props = defineProps<{
  node: TimeNode | null
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update-node', node: TimeNode): void
}>()

const show = ref(false)
const isEditing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editYear = ref(2000)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      setTimeout(() => { show.value = true }, 100)
    } else {
      show.value = false
      isEditing.value = false
    }
  },
)

watch(() => props.node, (node) => {
  if (node) {
    editTitle.value = node.title
    editDescription.value = node.description
    editYear.value = node.year
  }
})

function startEdit() {
  if (!props.node) return
  editTitle.value = props.node.title
  editDescription.value = props.node.description
  editYear.value = props.node.year
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
}

function saveEdit() {
  if (!props.node) return
  const updated = {
    ...props.node,
    title: editTitle.value || props.node.title,
    description: editDescription.value || props.node.description,
    year: editYear.value || props.node.year,
  }
  emit('update-node', updated)
  isEditing.value = false
}

function handleUploadPhoto() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment' // 移动端优先使用相机
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file || !props.node) return

    // 压缩图片
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 800
        let w = img.width
        let h = img.height
        if (w > maxSize || h > maxSize) {
          if (w > h) { h = h * maxSize / w; w = maxSize }
          else { w = w * maxSize / h; h = maxSize }
        }
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        const base64 = canvas.toDataURL('image/jpeg', 0.7)

        const updated = { ...props.node!, userPhoto: base64 }
        emit('update-node', updated)
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }
  input.click()
}

function removePhoto() {
  if (!props.node) return
  const updated = { ...props.node, userPhoto: '' }
  emit('update-node', updated)
}
</script>

<template>
  <Transition name="card">
    <div
      v-if="show && node"
      class="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 w-[calc(100%-1rem)] sm:w-80 z-20 pointer-events-auto"
    >
      <div class="glass rounded-2xl overflow-hidden shadow-2xl">
        <!-- 图片区域 -->
        <div class="relative h-48 overflow-hidden group">
          <!-- 用户上传的照片 -->
          <img
            v-if="node.userPhoto"
            :src="node.userPhoto"
            alt="照片"
            class="w-full h-full object-cover"
          />
          <!-- 渐变色块（无照片时） -->
          <div
            v-else
            class="w-full h-full flex items-center justify-center"
            :style="{ background: node.gradient || 'linear-gradient(135deg, #0a1a3e 0%, #1a0a4e 100%)' }"
          >
            <div class="text-center">
              <div class="text-5xl font-display text-white/30 mb-1">{{ node.year }}</div>
              <div class="text-sm text-white/50 font-body">{{ node.title }}</div>
            </div>
          </div>
          <!-- 底部渐变遮罩 -->
          <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[rgba(10,10,26,0.9)] to-transparent"></div>

          <!-- 悬浮操作按钮 -->
          <div class="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              class="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all"
              title="上传照片"
              @click="handleUploadPhoto"
            >
              <Camera :size="14" />
            </button>
            <button
              v-if="node.userPhoto"
              class="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-red-400/70 hover:text-red-400 hover:bg-black/60 transition-all"
              title="移除照片"
              @click="removePhoto"
            >
              <Trash2 :size="14" />
            </button>
          </div>

          <!-- 无照片时的上传提示 -->
          <button
            v-if="!node.userPhoto"
            class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
            @click="handleUploadPhoto"
          >
            <div class="flex flex-col items-center gap-1 text-white/70">
              <Camera :size="24" />
              <span class="text-xs">点击上传照片</span>
            </div>
          </button>
        </div>

        <!-- 文字区域 -->
        <div class="p-5">
          <!-- 编辑模式 -->
          <template v-if="isEditing">
            <div class="mb-3">
              <label class="block text-[10px] text-white/30 mb-1">年份</label>
              <input
                v-model.number="editYear"
                type="number"
                min="1900"
                max="2099"
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/80 text-sm font-body focus:outline-none focus:border-[#00d4ff]/50"
              />
            </div>
            <div class="mb-3">
              <label class="block text-[10px] text-white/30 mb-1">标题</label>
              <input
                v-model="editTitle"
                type="text"
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/80 text-sm font-body focus:outline-none focus:border-[#00d4ff]/50"
              />
            </div>
            <div class="mb-3">
              <label class="block text-[10px] text-white/30 mb-1">描述</label>
              <textarea
                v-model="editDescription"
                rows="3"
                class="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white/80 text-sm font-body resize-none focus:outline-none focus:border-[#00d4ff]/50"
              ></textarea>
            </div>
            <div class="flex gap-2">
              <button
                class="flex-1 py-1.5 rounded-lg text-xs font-body bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-all flex items-center justify-center gap-1"
                @click="cancelEdit"
              >
                <X :size="12" /> 取消
              </button>
              <button
                class="flex-1 py-1.5 rounded-lg text-xs font-body bg-[#00d4ff]/20 border border-[#00d4ff]/30 text-[#00d4ff] hover:bg-[#00d4ff]/30 transition-all flex items-center justify-center gap-1"
                @click="saveEdit"
              >
                <Check :size="12" /> 保存
              </button>
            </div>
          </template>

          <!-- 展示模式 -->
          <template v-else>
            <!-- 年份标签 -->
            <div class="flex items-center gap-2 mb-3">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#00d4ff]/15 text-[#00d4ff] border border-[#00d4ff]/20">
                {{ node.year }}
              </span>
              <div class="h-px flex-1 bg-gradient-to-r from-[#00d4ff]/20 to-transparent"></div>
              <!-- 编辑按钮 -->
              <button
                class="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                title="编辑"
                @click="startEdit"
              >
                <Pencil :size="12" />
              </button>
            </div>

            <!-- 标题 -->
            <h3 class="font-display text-2xl text-white mb-3 tracking-wide">
              {{ node.title }}
            </h3>

            <!-- 描述 -->
            <p class="text-sm text-white/60 leading-relaxed font-body">
              {{ node.description }}
            </p>
          </template>
        </div>

        <!-- 底部装饰线 -->
        <div class="h-0.5 bg-gradient-to-r from-[#00d4ff] via-[#8b5cf6] to-[#ffd700] opacity-40"></div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.card-enter-active {
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.card-leave-active {
  transition: all 0.4s cubic-bezier(0.7, 0, 0.84, 0);
}
.card-enter-from {
  opacity: 0;
  transform: translate(20px, -50%);
}
.card-leave-to {
  opacity: 0;
  transform: translate(20px, -50%);
}

@media (max-width: 640px) {
  .card-enter-from {
    opacity: 0;
    transform: translate(-50%, 40px);
  }
  .card-leave-to {
    opacity: 0;
    transform: translate(-50%, 40px);
  }
}
</style>
