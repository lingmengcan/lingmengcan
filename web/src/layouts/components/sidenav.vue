<script setup lang="ts">
  import { computed, onMounted, ref, unref, watch } from 'vue';
  import { RouteRecordRaw, useRoute, useRouter } from 'vue-router';
  import { useAsyncRouteStore } from '@/store/modules/async-route';
  import { generatorMenu } from '@/utils/menu';
  import Logo from './logo.vue';

  // 当前路由
  const currentRoute = useRoute();
  const router = useRouter();
  const asyncRouteStore = useAsyncRouteStore();
  const menus = ref<RouteRecordRaw[]>([]);
  const subMenus = ref<RouteRecordRaw[]>([]);
  const selectedKeys = ref(currentRoute.name);

  // 获取当前打开的子菜单
  const openKeys = ref(currentRoute.matched.map((item) => item.name));

  const getSelectedKeys = computed(() => selectedKeys.value);

  // 检查某个父菜单是否应该被选中（当其子菜单被选中时）
  const isParentSelected = (parentItem: RouteRecordRaw) => {
    // 直接选中父菜单
    if (getSelectedKeys.value === parentItem.name) {
      return true;
    }
    // 检查是否有子菜单被选中
    return parentItem.children?.some((child) => child.name === getSelectedKeys.value) ?? false;
  };

  // 获取当前选中的父菜单信息
  const getCurrentParentInfo = computed(() => {
    const selectedParent = menus.value.find((item) => isParentSelected(item));
    return {
      title: selectedParent?.meta?.title || '',
      icon: selectedParent?.meta?.icon || '',
    };
  });

  // 跟随页面路由变化，切换菜单选中状态
  watch(
    () => currentRoute.fullPath,
    () => {
      updateKeys();
      updateMenu();
    },
  );

  function updateMenu() {
    const dataMenus = generatorMenu(asyncRouteStore.getMenus);

    menus.value = dataMenus;
    const parentKey = openKeys.value.shift();
    const items = dataMenus.find((item) => item.key === parentKey);
    subMenus.value = items?.children || [];
  }

  function updateKeys() {
    openKeys.value = currentRoute.matched.map((item) => item.name);
    selectedKeys.value = currentRoute.name;
  }

  // 点击菜单
  function clickMenuItem(name: string) {
    // 外链
    if (/http(s)?:/.test(name)) {
      window.open(name);
    } else {
      router.push({ name });
    }
  }

  //展开菜单
  function menuExpanded(keys: string[]) {
    if (!keys) return;
    const latestOpenKey = keys.find((key) => openKeys.value.indexOf(key) === -1);
    const isExistChildren = findChildrenLen(latestOpenKey as string);
    openKeys.value = isExistChildren ? (latestOpenKey ? [latestOpenKey] : []) : keys;
  }

  //查找是否存在子路由
  function findChildrenLen(key: string) {
    if (!key) return false;
    const subRouteChildren: string[] = [];
    for (const { children, name } of unref(menus)) {
      if (children && children.length) {
        subRouteChildren.push(name as string);
      }
    }
    return subRouteChildren.includes(key);
  }

  onMounted(() => {
    updateMenu();
  });
</script>

<template>
  <div class="pl-2 py-2 h-full">
    <div
      class="relative h-full bg-white border border-solid border-gray-300 rounded-[14px] flex flex-row items-stretch"
    >
      <div class="px-1.5 pt-5 flex flex-col h-full items-center border-0 border-r border-solid border-gray-300">
        <Logo :collapsed="true" />
        <t-divider />
        <t-space direction="vertical">
          <div
            v-for="(item, index) in menus"
            :key="index"
            @click="item.name && clickMenuItem(item.name.toString())"
            class="flex flex-col items-center py-1 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 text-gray-500"
            :class="{
              'bg-blue-100 text-blue-600': isParentSelected(item),
            }"
          >
            <t-icon :name="item.meta?.icon" size="18" />
            <span class="text-[11px]">{{ item.meta?.title }}</span>
          </div>
        </t-space>
      </div>
      <div>
        <div class="px-4 pt-6 pb-4 flex items-center gap-2">
          <t-icon :name="getCurrentParentInfo.icon" size="18" class="text-gray-600" />
          <h3 class="text-sm text-gray-800">{{ getCurrentParentInfo.title }}</h3>
        </div>
        <t-menu
          width="170px"
          class="!bg-transparent"
          :value="getSelectedKeys"
          :expanded="openKeys"
          @change="clickMenuItem"
          @expand="menuExpanded"
        >
          <template v-for="item in subMenus" :key="item.name">
            <t-submenu
              v-if="item.children && item.children.length > 0"
              :value="item.name"
              :title="item.meta?.title"
            >
              <t-menu-item v-for="child in item.children" :key="child.name" :value="child.name">
                <template #icon>
                  <t-icon :name="child.meta?.icon" class="!h-3.5" />
                </template>
                {{ child.meta?.title }}
              </t-menu-item>
            </t-submenu>
            <t-menu-item v-else :value="item.name">
              <template #icon>
                <t-icon :name="item.meta?.icon" class="!h-3.5" />
              </template>
              {{ item.meta?.title }}
            </t-menu-item>
          </template>
        </t-menu>
      </div>
    </div>
  </div>
</template>
