<script setup lang="ts">
  import MainContent from './components/main.vue';
  import Logo from './components/logo.vue';
  import Menu from './components/tdesign-menu.vue';
  import Header from './components/header.vue';
  import { ref } from 'vue';

  const collapsed = ref<boolean>(true);

  const inverted = ref(true);
</script>

<template>
  <t-layout class="flex flex-row">
    <t-aside class="transition-all duration-200">
      <Logo :collapsed="collapsed" />
      <Menu :inverted="inverted" :collapsed="collapsed" mode="vertical" />
    </t-aside>
    <t-layout>
      <t-header class="z-10">
        <Header v-model:collapsed="collapsed" :inverted="inverted" />
      </t-header>

      <t-content>
        <div class="h-screen p-2.5 pt-[74px] bg-slate-200 overflow-auto">
          <MainContent />
        </div>
      </t-content>
      <t-back-top  />
    </t-layout>
  </t-layout>
</template>
