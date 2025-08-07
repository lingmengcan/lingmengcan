<script setup lang="ts">
  defineProps({
    collapsed: {
      type: Boolean,
      required: true,
    },
  });
</script>

<template>
  <div class="flex items-center justify-center">
    <img src="@/assets/images/logo.png" alt="" class="w-fit h-7" />
    <h2 v-show="!collapsed" class="title">lingmengcan</h2>
  </div>
</template>
