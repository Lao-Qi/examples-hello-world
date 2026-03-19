<template>
  <div class="px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">SKU 管理</h1>
    <div class="relative w-64 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索SKU..."
        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5 absolute right-3 top-2.5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <!-- 添加 SKU 按钮 -->
    <button
      @click="openAddModal"
      class="bg-primary text-black px-4 py-2 rounded-md hover:bg-blue-600 mb-6"
    >
      添加 SKU
    </button>

    <!-- SKU 列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="sku in filteredSkus"
        :key="sku.id"
        class="bg-white shadow-md rounded-md p-4 hover:shadow-lg transition-shadow"
      >
        <h3 class="font-semibold text-lg mb-2">{{ sku.name }}</h3>
        <div class="space-y-2">
          <div
            v-for="(item, index) in sku.parts"
            :key="index"
            class="flex justify-between items-center text-sm"
          >
            <span>{{ item.name }}</span>
            <span class="text-gray-600">x{{ item.quantity }}</span>
          </div>
        </div>
        <div class="flex space-x-2 mt-4">
          <button
            @click="openEditModal(sku)"
            class="text-primary hover:text-blue-600 text-sm"
          >
            编辑
          </button>
          <button
            @click="deleteSku(sku.id)"
            class="text-red-500 hover:text-red-700 text-sm"
          >
            删除
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="skus.length === 0" class="text-center py-12 text-gray-500">
      <p>暂无 SKU 数据</p>
    </div>

    <!-- 添加/编辑 SKU 模态框 -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-md p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editingSku ? "编辑 SKU" : "添加 SKU" }}
        </h2>

        <form @submit.prevent="editingSku ? updateSku() : addSku()">
          <!-- SKU 名称 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >SKU 名称</label
            >
            <input
              v-model="newSku.name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <!-- 配件选择 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >配件</label
            >

            <!-- 已选择的配件 -->
            <div v-if="newSku.parts.length > 0" class="space-y-2 mb-4">
              <div
                v-for="(item, index) in newSku.parts"
                :key="index"
                class="flex items-center space-x-2 p-2 border border-gray-200 rounded-md"
              >
                <span class="flex-1">{{ item.name }}</span>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="w-16 px-2 py-1 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  @click="removePart(index)"
                  class="text-red-500 hover:text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- 配件选择器 -->
            <div class="flex space-x-2">
              <select
                v-model="selectedPartId"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">选择配件</option>
                <option v-for="part in parts" :key="part.id" :value="part.id">
                  {{ part.name }}
                </option>
              </select>
              <button
                type="button"
                @click="addPartToSku"
                :disabled="!selectedPartId"
                class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
              >
                添加
              </button>
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
              :disabled="newSku.parts.length === 0"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              {{ editingSku ? "确认更新" : "确认添加" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

// 配件类型定义
interface Part {
  id: string;
  name: string;
  image: string;
}

// SKU 配件类型定义
interface SkuPart {
  id: string;
  name: string;
  quantity: number;
}

// SKU 类型定义
interface Sku {
  id: string;
  name: string;
  parts: SkuPart[];
}

// 状态管理
const parts = ref<Part[]>([]);
const skus = ref<Sku[]>([]);
const isAddModalOpen = ref(false);
const editingSku = ref<Sku | null>(null);
const newSku = ref<Sku>({
  id: "",
  name: "",
  parts: [],
});
const selectedPartId = ref("");
const searchQuery = ref("");

// 过滤后的SKU列表
const filteredSkus = computed(() => {
  if (!searchQuery.value) return skus.value;

  const query = searchQuery.value.toLowerCase();
  return skus.value.filter((sku) => sku.name.toLowerCase().includes(query));
});

// 初始化加载数据
onMounted(() => {
  loadParts();
  loadSkus();
});

// 从localStorage加载配件数据
const loadParts = () => {
  const storedParts = localStorage.getItem("parts");
  if (storedParts) {
    parts.value = JSON.parse(storedParts);
  }
};

// 从localStorage加载SKU数据
const loadSkus = () => {
  const storedSkus = localStorage.getItem("skus");
  if (storedSkus) {
    skus.value = JSON.parse(storedSkus);
  }
};

// 保存SKU数据到localStorage
const saveSkus = () => {
  localStorage.setItem("skus", JSON.stringify(skus.value));
};

// 打开添加模态框
const openAddModal = () => {
  editingSku.value = null;
  newSku.value = {
    id: "",
    name: "",
    parts: [],
  };
  selectedPartId.value = "";
  isAddModalOpen.value = true;
};

// 打开编辑模态框
const openEditModal = (sku: Sku) => {
  editingSku.value = sku;
  // 深拷贝，避免直接修改原始数据
  newSku.value = {
    ...sku,
    parts: [...sku.parts],
  };
  selectedPartId.value = "";
  isAddModalOpen.value = true;
};

// 关闭添加模态框
const closeAddModal = () => {
  isAddModalOpen.value = false;
};

// 添加配件到SKU
const addPartToSku = () => {
  if (!selectedPartId.value) return;

  const part = parts.value.find((p) => p.id === selectedPartId.value);
  if (part) {
    // 检查是否已经添加过该配件
    const existingPart = newSku.value.parts.find((p) => p.id === part.id);
    if (!existingPart) {
      newSku.value.parts.push({
        id: part.id,
        name: part.name,
        quantity: 1,
      });
    }
  }

  selectedPartId.value = "";
};

// 从SKU中移除配件
const removePart = (index: number) => {
  newSku.value.parts.splice(index, 1);
};

// 添加SKU
const addSku = () => {
  if (newSku.value.parts.length === 0) return;

  // 生成唯一ID
  const id = Date.now().toString();
  newSku.value.id = id;

  // 添加到数组
  skus.value.push({ ...newSku.value });

  // 保存到localStorage
  saveSkus();

  // 关闭模态框
  closeAddModal();
};

// 更新SKU
const updateSku = () => {
  if (editingSku.value) {
    const index = skus.value.findIndex(
      (sku) => sku.id === editingSku.value?.id,
    );
    if (index !== -1) {
      skus.value[index] = { ...newSku.value };
      // 保存到localStorage
      saveSkus();
      // 关闭模态框
      closeAddModal();
    }
  }
};

// 删除SKU
const deleteSku = (id: string) => {
  skus.value = skus.value.filter((sku) => sku.id !== id);
  saveSkus();
};
</script>

<style scoped>
/* SKU 管理页面样式 */
</style>
