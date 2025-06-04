<template>
  <div class="z-10 flex items-center justify-between w-full h-16 p-0 transition-all duration-200 shadow-md">
    <!--顶部菜单-->
    <!--左侧菜单-->
    <div class="flex items-center">
      <!-- 菜单收起 -->
      <div class="flex m-3 cursor-pointer hover:bg-gray-200" @click="emit('update:collapsed', !collapsed)">
        <n-icon v-if="collapsed" size="20">
          <MenuUnfoldOutlined />
        </n-icon>
        <n-icon v-else style="margin: 0" size="20">
          <MenuFoldOutlined />
        </n-icon>
      </div>

      <!-- 面包屑 -->
      <n-breadcrumb class="flex mr-10">
        <template v-for="routeItem in breadcrumbList" :key="routeItem.name === 'Redirect' ? void 0 : routeItem.name">
          <n-breadcrumb-item v-if="routeItem.meta.title">
            <span class="text-base">
              {{ routeItem.meta.title }}
            </span>
          </n-breadcrumb-item>
        </template>
      </n-breadcrumb>

      <!-- 菜单 -->
      <Menu :inverted="false" :collapsed="false" mode="horizontal" />
    </div>

    <div class="flex items-center mr-5">
      <!--github-->
      <div class="flex items-center h-16 pr-2 cursor-pointer">
        <n-tooltip placement="bottom">
          <template #trigger>
            <div class="flex items-center p-1 rounded hover:bg-slate-200">
              <n-button text type="primary" @click="navToGitHub">
                <n-icon size="18">
                  <GithubOutlined />
                </n-icon>
              </n-button>
            </div>
          </template>
          <span>Github</span>
        </n-tooltip>
      </div>
      <!--多语言-->
      <div class="flex items-center h-16 pr-2 cursor-pointer">
        <n-dropdown placement="bottom-start" trigger="click" :options="langList" @select="languageSelect">
          <div class="flex items-center p-1 rounded hover:bg-slate-200">
            <n-icon size="18">
              <LanguageOutline />
            </n-icon>
          </div>
        </n-dropdown>
      </div>
      <!--切换全屏-->
      <div class="flex items-center h-16 pr-3 text-center cursor-pointer">
        <n-tooltip placement="bottom">
          <template #trigger>
            <div class="flex items-center p-1 rounded hover:bg-slate-200">
              <n-icon size="18">
                <component :is="fullscreenIcon" @click="toggleFullScreen" />
              </n-icon>
            </div>
          </template>
          <span>{{ $t('layout.header.fullscreen') }}</span>
        </n-tooltip>
      </div>
      <!-- 个人中心 -->
      <div class="items-center inline-block text-center transition-all duration-200 ease-in-out cursor-pointer">
        <n-dropdown
          trigger="hover"
          placement="bottom-start"
          :options="avatarOptions"
          class="w-28"
          @select="avatarSelect"
        >
          <div class="flex items-center p-1 rounded hover:bg-slate-200">
            <Avatar round />
            <n-divider vertical />
            <span class="ml-1 text-sky-900">{{ username }}</span>
          </div>
        </n-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user';
  import { langList, useLocale } from '@/locales/index';
  import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    GithubOutlined,
  } from '@vicons/antd';
  import { LanguageOutline } from '@vicons/ionicons5';

  import { useDialog, useMessage } from 'naive-ui';
  import { computed, shallowRef } from 'vue';
  import { RouteLocationMatched, useRoute, useRouter } from 'vue-router';
  import Menu from './menu.vue';
  import Avatar from '@/components/avatar/index.vue';
  import { useI18n } from 'vue-i18n';

  defineProps({
    collapsed: {
      type: Boolean,
      required: true,
    },
  });

  const emit = defineEmits(['update:collapsed']);

  const router = useRouter();
  const route = useRoute();
  const fullscreenIcon = shallowRef(FullscreenOutlined);
  const userStore = useUserStore();
  const message = useMessage();
  const dialog = useDialog();

  const username = userStore.username;

  const breadcrumbList = computed(() => {
    return generator(route.matched);
  });

  const generator = (routerMap: RouteLocationMatched[]) => {
    routerMap.map((item) => {
      const currentMenu = {
        ...item,
        label: item.meta.title,
        key: item.name,
        disabled: item.path === '/',
      };
      return currentMenu;
    });
    // 只保留根路径
    return routerMap.slice(0, 1);
  };

  const navToGitHub = () => {
    window.open('https://github.com/lingmengcan/lingmengcan');
  };

  // 切换全屏图标
  const toggleFullscreenIcon = () =>
    (fullscreenIcon.value = document.fullscreenElement !== null ? FullscreenExitOutlined : FullscreenOutlined);

  // 监听全屏切换事件
  document.addEventListener('fullscreenchange', toggleFullscreenIcon);

  // 全屏切换
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const { t } = useI18n();
  const avatarOptions = [
    {
      label: t('layout.header.user'),
      key: 1,
    },
    {
      label: t('layout.header.signOut'),
      key: 2,
    },
  ];

  //头像下拉菜单
  const avatarSelect = (key: number) => {
    switch (key) {
      case 1:
        router.push({ name: 'setting' });
        break;
      case 2:
        doLogout();
        break;
    }
  };

  // 切换语言
  const { changeLocale } = useLocale();
  //多语言下拉菜单
  const languageSelect = (key: string) => {
    changeLocale(key);
  };

  // 退出登录
  const doLogout = () => {
    dialog.info({
      title: t('common.info'),
      content: t('layout.header.signOutMessage'),
      positiveText: t('common.confirm'),
      negativeText: t('common.cancel'),
      onPositiveClick: () => {
        userStore.logout().then(() => {
          message.success(t('layout.header.signOutSuccess'));

          router
            .replace({
              name: 'Login',
              query: {
                redirect: route.fullPath,
              },
            })
            .finally(() => location.reload());
        });
      },
      onNegativeClick: () => {},
    });
  };
</script>
