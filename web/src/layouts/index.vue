<script setup lang="ts">
  import MainContent from './components/main.vue';

  import Menu from './components/tdesign-menu.vue';
  import { ref } from 'vue';

  const collapsed = ref<boolean>(true);

  const inverted = ref(true);
</script>

<template>
  <t-layout class="flex flex-row">
    <t-aside width="260px" class="bg-slate-100!">
      <Menu :inverted="inverted" :collapsed="collapsed" mode="vertical" />
    </t-aside>
    <t-layout>
      <t-content>
        <div class="h-screen p-2.5 bg-slate-100 overflow-auto">
          <MainContent />
        </div>
      </t-content>
      <t-back-top />
    </t-layout>
  </t-layout>
</template>
