<template>
  <div class="px-4 py-6">
    <h1 class="text-2xl font-bold mb-4">订单管理</h1>
    <div class="relative w-64 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="搜索订单..."
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

    <!-- 添加订单按钮 -->
    <button
      @click="openAddModal"
      class="bg-primary text-black px-4 py-2 rounded-md hover:bg-blue-600 mb-6"
    >
      添加订单
    </button>

    <!-- 订单列表 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        :class="[
          'bg-white shadow-md rounded-md p-4 hover:shadow-lg transition-shadow',
          order.isCompleted
            ? 'border-l-4 border-green-500'
            : 'border-l-4 border-red-500',
        ]"
      >
        <h3 class="font-semibold text-lg mb-2">订单 #{{ order.id }}</h3>
        <div class="space-y-1 text-sm">
          <p><span class="font-medium">买家:</span> {{ order.buyerInfo }}</p>
          <p>
            <span class="font-medium">状态:</span>
            <span
              :class="order.isCompleted ? 'text-green-500' : 'text-red-500'"
              >{{ order.isCompleted ? "已完成" : "未完成" }}</span
            >
          </p>
          <p class="mt-2 font-medium">SKU:</p>
          <div class="ml-2">
            <p>{{ order.sku.name }} x{{ order.skuQuantity }}</p>
          </div>
          <p class="mt-2 font-medium">额外配件:</p>
          <div class="ml-2">
            <div v-for="(item, index) in order.extraParts" :key="index">
              <p>{{ item.name }} x{{ item.quantity }}</p>
            </div>
            <div v-if="order.extraParts.length === 0">
              <p>无</p>
            </div>
          </div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <div class="flex space-x-2">
            <button
              @click="openEditModal(order)"
              class="text-primary hover:text-blue-600 text-sm"
            >
              编辑
            </button>
            <button
              @click="deleteOrder(order.id)"
              class="text-red-500 hover:text-red-700 text-sm"
            >
              删除
            </button>
          </div>
          <button
            @click="viewOrderDetail(order.id)"
            class="text-sm text-primary hover:text-blue-600"
          >
            查看详情 →
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="orders.length === 0" class="text-center py-12 text-gray-500">
      <p>暂无订单数据</p>
    </div>

    <!-- 添加/编辑订单模态框 -->
    <div
      v-if="isAddModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-md p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">
          {{ editingOrder ? "编辑订单" : "添加订单" }}
        </h2>

        <form @submit.prevent="editingOrder ? updateOrder() : addOrder()">
          <!-- 买家信息 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >买家信息</label
            >
            <input
              v-model="newOrder.buyerInfo"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <!-- SKU 选择 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >SKU</label
            >
            <select
              v-model="selectedSkuId"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">选择 SKU</option>
              <option v-for="sku in skus" :key="sku.id" :value="sku.id">
                {{ sku.name }}
              </option>
            </select>
            <div class="mt-2">
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >数量</label
              >
              <input
                v-model.number="newOrder.skuQuantity"
                type="number"
                min="1"
                class="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <!-- 额外配件 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >额外配件</label
            >

            <!-- 已选择的额外配件 -->
            <div v-if="newOrder.extraParts.length > 0" class="space-y-2 mb-4">
              <div
                v-for="(item, index) in newOrder.extraParts"
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
                  @click="removeExtraPart(index)"
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
                v-model="selectedExtraPartId"
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">选择配件</option>
                <option v-for="part in parts" :key="part.id" :value="part.id">
                  {{ part.name }}
                </option>
              </select>
              <button
                type="button"
                @click="addExtraPart"
                :disabled="!selectedExtraPartId"
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
              :disabled="!selectedSkuId || newOrder.skuQuantity <= 0"
              class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
            >
              {{ editingOrder ? "确认更新" : "确认添加" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 配件类型定义
interface Part {
  id: string;
  name: string;
  image: string;
}

// SKU 类型定义
interface Sku {
  id: string;
  name: string;
  parts: any[];
}

// 订单配件类型定义
interface OrderPart {
  id: string;
  name: string;
  quantity: number;
}

// 订单 SKU 类型定义
interface OrderSku {
  id: string;
  name: string;
}

// 订单类型定义
interface Order {
  id: string;
  buyerInfo: string;
  sku: OrderSku;
  skuQuantity: number;
  extraParts: OrderPart[];
  isCompleted?: boolean;
}

// 状态管理
const parts = ref<Part[]>([]);
const skus = ref<Sku[]>([]);
const orders = ref<Order[]>([]);
const isAddModalOpen = ref(false);
const editingOrder = ref<Order | null>(null);
const newOrder = ref<Order>({
  id: "",
  buyerInfo: "",
  sku: {
    id: "",
    name: "",
  },
  skuQuantity: 1,
  extraParts: [],
});
const selectedSkuId = ref("");
const selectedExtraPartId = ref("");
const searchQuery = ref("");

// 过滤后的订单列表
const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value;

  const query = searchQuery.value.toLowerCase();
  return orders.value.filter((order) =>
    order.buyerInfo.toLowerCase().includes(query),
  );
});

// 初始化加载数据
onMounted(() => {
  loadParts();
  loadSkus();
  loadOrders();
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

// 从localStorage加载订单数据
const loadOrders = () => {
  const storedOrders = localStorage.getItem("orders");
  if (storedOrders) {
    const storedOrdersData = JSON.parse(storedOrders);
    // 确保每个订单都有isCompleted字段并按ID降序排序
    orders.value = storedOrdersData
      .map((order: Order) => ({
        ...order,
        isCompleted: order.isCompleted || false,
      }))
      .sort((a: Order, b: Order) => {
        // 按ID降序排序，ID是时间戳，数值越大越新
        return Number(b.id) - Number(a.id);
      });
  }
};

// 保存订单数据到localStorage
const saveOrders = () => {
  localStorage.setItem("orders", JSON.stringify(orders.value));
};

// 打开添加模态框
const openAddModal = () => {
  editingOrder.value = null;
  newOrder.value = {
    id: "",
    buyerInfo: "",
    sku: {
      id: "",
      name: "",
    },
    skuQuantity: 1,
    extraParts: [],
  };
  selectedSkuId.value = "";
  selectedExtraPartId.value = "";
  isAddModalOpen.value = true;
};

// 打开编辑模态框
const openEditModal = (order: Order) => {
  editingOrder.value = order;
  // 深拷贝，避免直接修改原始数据
  newOrder.value = {
    ...order,
    sku: { ...order.sku },
    extraParts: [...order.extraParts],
  };
  selectedSkuId.value = order.sku.id;
  selectedExtraPartId.value = "";
  isAddModalOpen.value = true;
};

// 关闭添加模态框
const closeAddModal = () => {
  isAddModalOpen.value = false;
};

// 添加额外配件
const addExtraPart = () => {
  if (!selectedExtraPartId.value) return;

  const part = parts.value.find((p) => p.id === selectedExtraPartId.value);
  if (part) {
    // 检查是否已经添加过该配件
    const existingPart = newOrder.value.extraParts.find(
      (p) => p.id === part.id,
    );
    if (!existingPart) {
      newOrder.value.extraParts.push({
        id: part.id,
        name: part.name,
        quantity: 1,
      });
    }
  }

  selectedExtraPartId.value = "";
};

// 从订单中移除额外配件
const removeExtraPart = (index: number) => {
  newOrder.value.extraParts.splice(index, 1);
};

// 添加订单
const addOrder = () => {
  if (!selectedSkuId.value || newOrder.value.skuQuantity <= 0) return;

  const sku = skus.value.find((s) => s.id === selectedSkuId.value);
  if (!sku) return;

  // 生成唯一ID
  const id = Date.now().toString();
  newOrder.value.id = id;
  newOrder.value.sku = {
    id: sku.id,
    name: sku.name,
  };

  // 添加到数组，确保有isCompleted字段
  orders.value.push({
    ...newOrder.value,
    isCompleted: false,
  });

  // 保存到localStorage
  saveOrders();

  // 关闭模态框
  closeAddModal();
};

// 更新订单
const updateOrder = () => {
  if (editingOrder.value) {
    const index = orders.value.findIndex(
      (order) => order.id === editingOrder.value?.id,
    );
    if (index !== -1) {
      const sku = skus.value.find((s) => s.id === selectedSkuId.value);
      if (sku) {
        // 更新订单信息，并将状态设置为未完成
        orders.value[index] = {
          ...newOrder.value,
          sku: {
            id: sku.id,
            name: sku.name,
          },
          isCompleted: false, // 编辑后状态重置为未完成
        };
        // 保存到localStorage
        saveOrders();
        // 关闭模态框
        closeAddModal();
      }
    }
  }
};

// 删除订单
const deleteOrder = (id: string) => {
  orders.value = orders.value.filter((order) => order.id !== id);
  saveOrders();
};

// 查看订单详情
const viewOrderDetail = (id: string) => {
  router.push(`/orders/${id}`);
};
</script>

<style scoped>
/* 订单管理页面样式 */
</style>
