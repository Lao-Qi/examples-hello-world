<template>
  <div class="px-4 py-8">
    <div class="flex items-center mb-6">
      <button @click="goBack" class="mr-4 text-gray-600 hover:text-primary">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <h1 class="text-2xl font-bold">订单详情 #{{ order?.id }}</h1>
    </div>

    <div
      v-if="order"
      :class="[
        'bg-white shadow-md rounded-md p-6',
        order.isCompleted
          ? 'border-l-4 border-green-500'
          : 'border-l-4 border-red-500',
      ]"
    >
      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-2">订单信息</h2>
        <p><span class="font-medium">买家:</span> {{ order.buyerInfo }}</p>
        <p>
          <span class="font-medium">SKU:</span> {{ order.sku.name }} x{{
            order.skuQuantity
          }}
        </p>
        <p>
          <span class="font-medium">状态:</span>
          <span
            :class="order.isCompleted ? 'text-green-500' : 'text-red-500'"
            >{{ order.isCompleted ? "已完成" : "未完成" }}</span
          >
        </p>
      </div>

      <div class="mb-6">
        <h2 class="text-lg font-semibold mb-4">配件清单</h2>

        <!-- SKU 配件 -->
        <div class="mb-4">
          <h3 class="font-medium mb-2">SKU 包含配件:</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(item, index) in skuParts"
              :key="index"
              :class="[
                'flex items-center p-3 border rounded-md',
                checkedParts.includes(`sku-${item.id}`)
                  ? 'border-green-500'
                  : 'border-gray-200',
              ]"
            >
              <input
                type="checkbox"
                :id="`sku-part-${index}`"
                :value="`sku-${item.id}`"
                v-model="checkedParts"
                class="mr-3 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div
                class="w-12 h-12 bg-gray-200 rounded-md overflow-hidden mr-3"
              >
                <img
                  v-if="item.image"
                  :src="item.image"
                  alt="配件图片"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 text-xs"
                >
                  无图片
                </div>
              </div>
              <div class="flex-1">
                <p class="font-medium">{{ item.name }}</p>
                <p class="text-sm text-gray-600">
                  数量: {{ item.quantity * order.skuQuantity }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 额外配件 -->
        <div>
          <h3 class="font-medium mb-2">额外配件:</h3>
          <div
            v-if="order.extraParts.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div
              v-for="(item, index) in order.extraParts"
              :key="index"
              :class="[
                'flex items-center p-3 border rounded-md',
                checkedParts.includes(`extra-${item.id}`)
                  ? 'border-green-500'
                  : 'border-gray-200',
              ]"
            >
              <input
                type="checkbox"
                :id="`extra-part-${index}`"
                :value="`extra-${item.id}`"
                v-model="checkedParts"
                class="mr-3 h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div
                class="w-12 h-12 bg-gray-200 rounded-md overflow-hidden mr-3"
              >
                <img
                  v-if="getPartImage(item.id)"
                  :src="getPartImage(item.id)"
                  alt="配件图片"
                  class="w-full h-full object-cover"
                />
                <div
                  v-else
                  class="w-full h-full flex items-center justify-center text-gray-400 text-xs"
                >
                  无图片
                </div>
              </div>
              <div class="flex-1">
                <p class="font-medium">{{ item.name }}</p>
                <p class="text-sm text-gray-600">数量: {{ item.quantity }}</p>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500">无额外配件</div>
        </div>
      </div>

      <!-- 配件总和 -->
      <div class="border-t pt-4">
        <h2 class="text-lg font-semibold mb-2">配件总和</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-3 rounded-md">
            <p class="font-medium">SKU 配件总数:</p>
            <p class="text-xl font-bold">{{ totalSkuPartsQuantity }}</p>
          </div>
          <div class="bg-gray-50 p-3 rounded-md">
            <p class="font-medium">额外配件总数:</p>
            <p class="text-xl font-bold">{{ totalExtraPartsQuantity }}</p>
          </div>
          <div class="bg-blue-50 p-3 rounded-md md:col-span-2">
            <p class="font-medium">总配件数:</p>
            <p class="text-xl font-bold text-primary">
              {{ totalPartsQuantity }}
            </p>
          </div>
        </div>
      </div>

      <!-- 确认完成按钮 -->
      <div class="mt-6 flex justify-end">
        <button
          @click="confirmComplete"
          :disabled="order.isCompleted"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300"
        >
          确认完成
        </button>
      </div>
    </div>

    <div v-else class="text-center py-12 text-gray-500">
      <p>订单不存在</p>
      <button
        @click="goBack"
        class="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
      >
        返回订单列表
      </button>
    </div>

    <!-- 提示弹窗 -->
    <div
      v-if="showAlert"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-md p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-2">提示</h3>
        <p class="mb-4">请确认所有配件都已勾选</p>
        <div class="flex justify-end">
          <button
            @click="showAlert = false"
            class="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-600"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

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
  parts: {
    id: string;
    name: string;
    quantity: number;
  }[];
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
const route = useRoute();
const router = useRouter();
const order = ref<Order | null>(null);
const parts = ref<Part[]>([]);
const skus = ref<Sku[]>([]);
const checkedParts = ref<string[]>([]);
const showAlert = ref(false);

// 订单ID
const orderId = computed(() => route.params.id as string);

// 初始化加载数据
onMounted(() => {
  loadParts();
  loadSkus();
  loadOrder();
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
const loadOrder = () => {
  const storedOrders = localStorage.getItem("orders");
  if (storedOrders) {
    const orders = JSON.parse(storedOrders);
    const foundOrder =
      orders.find((o: Order) => o.id === orderId.value) || null;
    // 确保订单有isCompleted字段
    order.value = foundOrder
      ? { ...foundOrder, isCompleted: foundOrder.isCompleted || false }
      : null;
  }
};

// 获取SKU的配件
const skuParts = computed(() => {
  if (!order.value) return [];

  const sku = skus.value.find((s) => s.id === order.value?.sku.id);
  if (!sku) return [];

  return sku.parts.map((part) => {
    const partInfo = parts.value.find((p) => p.id === part.id);
    return {
      ...part,
      image: partInfo?.image || "",
    };
  });
});

// 获取配件图片
const getPartImage = (partId: string) => {
  const part = parts.value.find((p) => p.id === partId);
  return part?.image || "";
};

// 计算SKU配件总数
const totalSkuPartsQuantity = computed(() => {
  if (!order.value) return 0;

  return skuParts.value.reduce((total, part) => {
    return total + part.quantity * order.value!.skuQuantity;
  }, 0);
});

// 计算额外配件总数
const totalExtraPartsQuantity = computed(() => {
  if (!order.value) return 0;

  return order.value.extraParts.reduce((total, part) => {
    return total + part.quantity;
  }, 0);
});

// 计算总配件数
const totalPartsQuantity = computed(() => {
  return totalSkuPartsQuantity.value + totalExtraPartsQuantity.value;
});

// 计算所有需要勾选的配件ID
const allPartIds = computed(() => {
  const ids = skuParts.value.map((part) => `sku-${part.id}`);
  order.value?.extraParts.forEach((part) => {
    ids.push(`extra-${part.id}`);
  });
  // 去重，确保每个配件只计算一次
  return [...new Set(ids)];
});

// 确认完成订单
const confirmComplete = () => {
  // 检查是否所有配件都已勾选
  if (checkedParts.value.length === allPartIds.value.length) {
    // 更新订单状态
    if (order.value) {
      order.value.isCompleted = true;
      // 保存到localStorage
      const storedOrders = localStorage.getItem("orders");
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        const updatedOrders = orders.map((o: Order) => {
          if (o.id === order.value!.id) {
            return { ...o, isCompleted: true };
          }
          return o;
        });
        localStorage.setItem("orders", JSON.stringify(updatedOrders));
      }
    }
    // 返回订单管理页面
    router.push("/orders");
  } else {
    // 显示提示弹窗
    showAlert.value = true;
  }
};

// 返回上一页
const goBack = () => {
  router.push("/orders");
};
</script>

<style scoped>
/* 订单详情页面样式 */
</style>
