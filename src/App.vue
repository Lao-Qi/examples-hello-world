<script setup lang="ts">
import { ref } from "vue";

const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow-md overflow-hidden">
      <div class="mx-auto px-4 py-3">
        <div class="flex justify-between items-center">
          <div class="text-xl font-bold text-primary truncate">
            批发订单管理
          </div>
          <!-- 移动端菜单按钮 -->
          <div class="md:hidden">
            <button
              @click="toggleMenu"
              class="text-gray-600 hover:text-primary p-1"
            >
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
          <!-- 桌面端导航链接 -->
          <div class="hidden md:flex space-x-4">
            <router-link to="/parts" class="text-gray-600 hover:text-primary"
              >配件管理</router-link
            >
            <router-link to="/sku" class="text-gray-600 hover:text-primary"
              >SKU 管理</router-link
            >
            <router-link to="/orders" class="text-gray-600 hover:text-primary"
              >订单管理</router-link
            >
          </div>
        </div>
        <!-- 移动端导航菜单 -->
        <div v-if="isMenuOpen" class="md:hidden mt-4 pb-2">
          <div class="flex flex-col space-y-2">
            <router-link
              to="/parts"
              class="text-gray-600 hover:text-primary py-2 block"
              @click="isMenuOpen = false"
              >配件管理</router-link
            >
            <router-link
              to="/sku"
              class="text-gray-600 hover:text-primary py-2 block"
              @click="isMenuOpen = false"
              >SKU 管理</router-link
            >
            <router-link
              to="/orders"
              class="text-gray-600 hover:text-primary py-2 block"
              @click="isMenuOpen = false"
              >订单管理</router-link
            >
          </div>
        </div>
      </div>
    </nav>
    <main class="mx-auto px-4 py-8">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>

<style scoped>
/* App styles */
</style>
