<template>
  <div class="px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">配件管理</h1>
    <div class="relative w-64 mb-6">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索配件..." 
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute right-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- 添加配件按钮 -->
    <button 
      @click="openAddModal" 
      class="bg-primary text-black px-4 py-2 rounded-md hover:bg-blue-600 mb-6"
    >
      添加配件
    </button>

    <!-- 配件列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="part in filteredParts" 
        :key="part.id" 
        class="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center">
          <div class="w-16 h-16 bg-gray-200 rounded-md overflow-hidden mr-4">
            <img
              v-if="part.image"
              :src="part.image"
              alt="配件图片"
              class="w-full h-full object-cover"
            />
            <div
              v-else
              class="w-full h-full flex items-center justify-center text-gray-400"
            >
              无图片
            </div>
          </div>
          <div class="flex-1">
            <h3 class="font-semibold">{{ part.name }}</h3>
            <div class="flex space-x-2 mt-2">
              <button
                @click="openEditModal(part)"
                class="text-primary hover:text-blue-600 text-sm"
              >
                编辑
              </button>
              <button
                @click="deletePart(part.id)"
                class="text-red-500 hover:text-red-700 text-sm"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="parts.length === 0" class="text-center py-12 text-gray-500">
      <p>暂无配件数据</p>
    </div>

    <!-- 添加/编辑配件模态框 -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-md p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editingPart ? "编辑配件" : "添加配件" }}
        </h2>

        <form @submit.prevent="editingPart ? updatePart() : addPart()">
          <!-- 配件名称 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >配件名称</label
            >
            <input
              v-model="newPart.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <!-- 图片上传 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >图片</label
            >
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div v-if="newPart.image" class="mt-2">
              <img
                :src="newPart.image"
                alt="预览"
                class="w-24 h-24 object-cover rounded-md"
              />
            </div>
          </div>

          <!-- 按钮组 -->
          <div class="flex justify-end space-x-2">
            <button
              type="button"
              @click="closeAddModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              取消
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
            >
              {{ editingPart ? "确认更新" : "确认添加" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// 配件类型定义
interface Part {
  id: string;
  name: string;
  image: string;
}

// 状态管理
const parts = ref<Part[]>([])
const isAddModalOpen = ref(false)
const editingPart = ref<Part | null>(null)
const newPart = ref<Part>({
  id: '',
  name: '',
  image: ''
})
const searchQuery = ref('')

// 过滤后的配件列表
const filteredParts = computed(() => {
  if (!searchQuery.value) return parts.value
  
  const query = searchQuery.value.toLowerCase()
  return parts.value.filter(part => 
    part.name.toLowerCase().includes(query)
  )
});

// 初始化加载数据
onMounted(() => {
  loadParts();
});

// 从localStorage加载数据
const loadParts = () => {
  const storedParts = localStorage.getItem("parts");
  if (storedParts) {
    parts.value = JSON.parse(storedParts);
  }
};

// 保存数据到localStorage
const saveParts = () => {
  localStorage.setItem("parts", JSON.stringify(parts.value));
};

// 打开添加模态框
const openAddModal = () => {
  editingPart.value = null;
  newPart.value = {
    id: "",
    name: "",
    image: "",
  };
  isAddModalOpen.value = true;
};

// 打开编辑模态框
const openEditModal = (part: Part) => {
  editingPart.value = part;
  newPart.value = { ...part };
  isAddModalOpen.value = true;
};

// 关闭添加模态框
const closeAddModal = () => {
  isAddModalOpen.value = false;
};

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    
    // 检查文件大小，如果超过100kb则压缩
    if (file.size > 102400) { // 100kb
      compressImage(file, 102400).then(compressedImage => {
        newPart.value.image = compressedImage
      })
    } else {
      // 直接读取文件
      const reader = new FileReader()
      reader.onload = (e) => {
        newPart.value.image = e.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }
}

// 压缩图片函数
const compressImage = (file: File, maxSize: number): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.onload = () => {
      // 计算压缩后的尺寸，保持宽高比
      let { width, height } = img
      const maxDimension = 800 // 最大尺寸
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width
        width = maxDimension
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height
        height = maxDimension
      }
      
      canvas.width = width
      canvas.height = height
      
      // 绘制图片
      ctx?.drawImage(img, 0, 0, width, height)
      
      // 尝试不同的质量值，直到图片大小小于maxSize
      let quality = 0.8
      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      
      while (compressedDataUrl.length * 0.75 > maxSize && quality > 0.1) {
        quality -= 0.1
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
      }
      
      resolve(compressedDataUrl)
    }
    
    img.src = URL.createObjectURL(file)
  })
};

// 添加配件
const addPart = () => {
  // 生成唯一ID
  const id = Date.now().toString();
  newPart.value.id = id;

  // 添加到数组
  parts.value.push({ ...newPart.value });

  // 保存到localStorage
  saveParts();

  // 关闭模态框
  closeAddModal();
};

// 更新配件
const updatePart = () => {
  if (editingPart.value) {
    const index = parts.value.findIndex(
      (part) => part.id === editingPart.value?.id,
    );
    if (index !== -1) {
      parts.value[index] = { ...newPart.value };
      // 保存到localStorage
      saveParts();
      // 关闭模态框
      closeAddModal();
    }
  }
};

// 删除配件
const deletePart = (id: string) => {
  parts.value = parts.value.filter((part) => part.id !== id);
  saveParts();
};
</script>

<style scoped>
/* 配件管理页面样式 */
</style>
