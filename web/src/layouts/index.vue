<script setup lang="ts">
  import MainContent from './components/main.vue';
  import Sidenav from './components/sidenav.vue';
  import { useRoute } from 'vue-router';
  import { computed } from 'vue';

  // 获取当前路由
  const route = useRoute();

  // 计算当前路由的标题
  const currentTitle = computed(() => {
    return route.meta?.title || '';
  });
</script>

<template>
  <t-layout class="flex flex-row h-screen overflow-hidden">
    <t-aside width="260px" class="bg-slate-100!">
      <Sidenav />
    </t-aside>
    <t-layout class="flex flex-col overflow-hidden">
      <t-content class="flex flex-col bg-slate-100 overflow-hidden">
        <h1 class="text-lg text-gray-800 my-2 px-3 flex-shrink-0">{{ currentTitle }}</h1>
        <div class="bg-slate-100 px-2.5 flex-1 overflow-y-auto min-h-0">
          <MainContent />
        </div>
      </t-content>
    </t-layout>
  </t-layout>
</template>
