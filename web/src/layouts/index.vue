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
    <t-layout>
      <t-content class="flex flex-col bg-slate-100">
        <h1 class="text-lg text-gray-800 my-3 px-2.5">{{ currentTitle }}</h1>
        <div class="bg-slate-100 p-2.5 flex-1">
          <MainContent />
        </div>
      </t-content>
    </t-layout>
  </t-layout>
</template>
