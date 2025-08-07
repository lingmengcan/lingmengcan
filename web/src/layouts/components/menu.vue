<script setup lang="ts">
  import { computed, onMounted, ref, unref, watch } from 'vue';
  import { RouteRecordRaw, useRoute, useRouter } from 'vue-router';
  import { useAsyncRouteStore } from '@/store/modules/async-route';
  import { generatorMenu } from '@/utils/menu';

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

  defineExpose({
    menus,
    subMenus,
    openKeys,
    getSelectedKeys,
    isParentSelected,
    getCurrentParentInfo,
    clickMenuItem,
    menuExpanded
  });

  onMounted(() => {
    updateMenu();
  });
</script>

<template>
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
        <t-submenu v-if="item.children && item.children.length > 0" :value="item.name" :title="item.meta?.title">
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
</template>