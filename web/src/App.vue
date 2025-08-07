<script lang="ts" setup>
  import { useLocale } from '@/locales/index';

  const { getComponentsLocale, locale } = useLocale();
</script>

<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view :key="locale" />
  </t-config-provider>
</template>

<style lang="less">
  @import 'styles/index.less';
</style>
