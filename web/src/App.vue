<script lang="ts" setup>
  import { computed } from 'vue';
  import { darkTheme } from 'naive-ui';
  import { lighten } from '@/utils';
  import { NDialogProvider, NNotificationProvider, NMessageProvider } from 'naive-ui';
  import { useLocale } from '@/locales/index';

  const designStore = {
    appTheme: '#2d8cf0',
    darkTheme: false,
  };

  /**
   * @type import('naive-ui').GlobalThemeOverrides
   */
  const getThemeOverrides = computed(() => {
    const appTheme = designStore.appTheme;
    const lightenStr = lighten(appTheme, 6);
    return {
      common: {
        primaryColor: appTheme,
        primaryColorHover: lightenStr,
        primaryColorPressed: lightenStr,
        primaryColorSuppl: appTheme,
      },
      LoadingBar: {
        colorLoading: appTheme,
      },
    };
  });

  const { getComponentsLocale, locale } = useLocale();

  const getDarkTheme = computed(() => (designStore.darkTheme ? darkTheme : undefined));
</script>

<template>
  <t-config-provider :global-config="getComponentsLocale">
    <n-config-provider :locale="getComponentsLocale" :theme="getDarkTheme" :theme-overrides="getThemeOverrides">
      <n-dialog-provider>
        <n-notification-provider>
          <n-message-provider>
            <router-view :key="locale" />
          </n-message-provider>
        </n-notification-provider>
      </n-dialog-provider>
    </n-config-provider>
  </t-config-provider>
</template>

<style lang="less">
  @import 'styles/index.less';
</style>
