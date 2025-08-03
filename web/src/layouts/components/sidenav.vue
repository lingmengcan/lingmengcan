<script setup lang="ts">
  import { ref } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import Logo from './logo.vue';
  import Menu from './menu.vue';
  import { useI18n } from 'vue-i18n';
  import { langList, useLocale } from '@/locales/index';
  import { useUserStore } from '@/store/modules/user';
  import { DialogPlugin, DropdownOption, MessagePlugin } from 'tdesign-vue-next';
  import Avatar from '@/components/avatar/index.vue';

  const { t } = useI18n();

  const userStore = useUserStore();
  const username = userStore.username;

  // 当前路由
  const currentRoute = useRoute();
  const router = useRouter();
  
  // 菜单组件引用
  const menuRef = ref();

  // 切换语言
  const { changeLocale } = useLocale();
  //多语言下拉菜单
  const languageSelect = (item: DropdownOption) => {
    changeLocale(item.value as string);
  };

  const navToGitHub = () => {
    window.open('https://github.com/lingmengcan/lingmengcan');
  };

  // 退出登录
  const doLogout = () => {
    DialogPlugin.confirm({
      header: t('common.info'),
      body: t('layout.header.signOutMessage'),
      confirmBtn: t('common.confirm'),
      cancelBtn: t('common.cancel'),
      onConfirm: () => {
        userStore.logout().then(() => {
          MessagePlugin.success(t('layout.header.signOutSuccess'));

          router
            .replace({
              name: 'Login',
              query: {
                redirect: currentRoute.fullPath,
              },
            })
            .finally(() => location.reload());
        });
      },
      onCancel: () => {},
    });
  };
</script>

<template>
  <div class="pl-2 py-2 h-full">
    <div
      class="relative h-full bg-white border border-solid border-gray-300 rounded-[14px] flex flex-row items-stretch"
    >
      <div class="px-1.5 pt-5 flex flex-col h-full items-center border-0 border-r border-solid border-gray-300">
        <Logo :collapsed="true" />
        <t-divider />
        <t-space direction="vertical" size="small" class="flex-1">
          <div
            v-for="(item, index) in menuRef?.menus"
            :key="index"
            @click="item.name && menuRef?.clickMenuItem(item.name.toString())"
            class="flex flex-col items-center py-1.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 text-gray-500"
            :class="{
              'bg-blue-100 text-blue-600': menuRef?.isParentSelected(item),
            }"
          >
            <t-icon :name="item.meta?.icon" size="18" />
            <span class="text-[11px]">{{ item.meta?.title }}</span>
          </div>
        </t-space>
        <t-space direction="vertical" class="pb-6">
          <t-tooltip placement="right-bottom" content="Github" theme="light">
            <t-button theme="default" shape="square" variant="text" @click="navToGitHub">
              <t-icon name="logo-github" />
            </t-button>
          </t-tooltip>
          <t-dropdown trigger="click" placement="right-bottom" :options="langList" @click="languageSelect">
            <t-button theme="default" shape="square" variant="text">
              <t-icon name="translate" />
            </t-button>
          </t-dropdown>
          <div>
            <t-popup trigger="click" placement="right-bottom">
              <Avatar round />
              <template #content>
                <t-space direction="vertical" size="small">
                  <!-- 用户信息 -->
                  <div class="flex items-center gap-3 px-3 py-2 border-b border-gray-200">
                    <Avatar round size="24px" />
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">{{ username }}</div>
                    </div>
                  </div>
                  <!-- 菜单选项 -->
                  <t-button theme="default" variant="text" @click="router.push({ name: 'setting' })">
                    <template #icon><t-icon name="user" /></template>
                    {{ t('layout.header.user') }}
                  </t-button>

                  <t-button theme="default" variant="text" @click="doLogout">
                    <template #icon><t-icon name="logout" /></template>
                    {{ t('layout.header.signOut') }}
                  </t-button>
                </t-space>
              </template>
            </t-popup>
          </div>
        </t-space>
      </div>
      <div>
        <Menu ref="menuRef" />
      </div>
    </div>
  </div>
</template>
