<template>
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
    <div
      class="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 backdrop-blur-sm"
    >
      <!-- 交互模式切换 -->
      <t-tooltip :content="workflowStore.interactionMode === 'mouse' ? '切换到触控板模式' : '切换到鼠标模式'">
        <t-button variant="text" size="small" @click="workflowStore.toggleInteractionMode" class="rounded-full">
          <template #icon><t-icon :name="workflowStore.interactionMode === 'mouse' ? 'mouse' : 'laptop'" /></template>
        </t-button>
      </t-tooltip>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 撤销按钮 -->
      <t-tooltip content="撤销">
        <t-button
          variant="text"
          size="small"
          @click="workflowStore.undo"
          :disabled="!workflowStore.canUndo"
          class="rounded-full"
        >
          <template #icon><t-icon name="rollback" /></template>
        </t-button>
      </t-tooltip>

      <!-- 重做按钮 -->
      <t-tooltip content="重做">
        <t-button
          variant="text"
          size="small"
          @click="workflowStore.redo"
          :disabled="!workflowStore.canRedo"
          class="rounded-full"
        >
          <template #icon><t-icon name="rollfront" /></template>
        </t-button>
      </t-tooltip>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 缩放控制 -->
      <t-tooltip content="缩小">
        <t-button variant="text" size="small" @click="zoomOut" class="rounded-full">
          <template #icon><t-icon name="zoom-out" /></template>
        </t-button>
      </t-tooltip>

      <span class="text-sm text-gray-600">{{ Math.round(zoom * 100) }}%</span>

      <t-tooltip content="放大">
        <t-button variant="text" size="small" @click="zoomIn" class="rounded-full">
          <template #icon><t-icon name="zoom-in" /></template>
        </t-button>
      </t-tooltip>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 整理布局 -->
      <t-tooltip content="适应画布">
        <t-button variant="text" size="small" @click="fitView" class="rounded-full">
          <template #icon><t-icon name="fullscreen" /></template>
        </t-button>
      </t-tooltip>

      <t-tooltip content="自动布局">
        <t-button variant="text" size="small" @click="handleAutoLayout" class="rounded-full">
          <template #icon><t-icon name="component-layout" /></template>
        </t-button>
      </t-tooltip>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 添加节点 -->
      <t-popup
        v-model:visible="showNodeSelector"
        placement="top"
        :overlay-style="{ width: '480px', maxHeight: '800px' }"
        :overlay-inner-style="{ padding: '0' }"
        trigger="click"
      >
        <t-button theme="primary" size="small" class="rounded-full">
          <template #icon><t-icon name="add" /></template>
          添加节点
        </t-button>
        <template #content>
          <div class="shadow-2xl border border-gray-200 w-full overflow-hidden">
            <!-- 搜索框 -->
            <div class="px-4 py-3">
              <t-input v-model="searchKeyword" placeholder="搜索节点、插件" clearable>
                <template #prefix-icon>
                  <t-icon name="search" />
                </template>
              </t-input>
            </div>

            <!-- 节点列表（按分类排列） -->
            <div class="overflow-y-auto px-3 pb-1">
              <div
                v-for="category in nodeCategories"
                :key="category.code"
                v-show="groupedPlugins[category.code] && groupedPlugins[category.code].length > 0"
                class="mb-3"
              >
                <!-- 分类标题 -->
                <div class="px-2">
                  <span class="text-sm font-normal text-gray-500">{{ category.name }}</span>
                </div>

                <!-- 分类下的节点 -->
                <div class="grid grid-cols-2 gap-1">
                  <t-tooltip
                    v-for="plugin in groupedPlugins[category.code]"
                    :key="plugin.pluginId"
                    :content="plugin.description"
                    placement="right"
                    :overlay-style="{ width: '200px' }"
                  >
                    <div
                      class="flex items-center px-3 py-1 rounded-lg cursor-pointer hover:bg-gray-100 transition-all"
                      @click="handleAddNode(plugin)"
                    >
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center mr-2 flex-shrink-0 bg-blue-200">
                        <t-icon :name="plugin.icon" size="16" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <h4 class="text-sm font-normal text-gray-900 truncate">{{ plugin.pluginName }}</h4>
                      </div>
                    </div>
                  </t-tooltip>
                </div>
              </div>

              <!-- 无搜索结果提示 -->
              <div
                v-if="filteredPlugins.length === 0"
                class="flex flex-col items-center justify-center py-12 text-gray-400"
              >
                <t-empty />
              </div>
            </div>
          </div>
        </template>
      </t-popup>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 运行按钮 -->
      <t-button theme="success" size="small" @click="$emit('debug-workflow')" class="rounded-full">
        <template #icon><t-icon name="bug" /></template>
        调试
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useVueFlow } from '@vue-flow/core';
  import { useWorkflowStore } from '@/store/modules/workflow';
  import { useDictStore } from '@/store/modules/dict';
  import { getPluginList } from '@/api/llm/plugin';
  import type { Plugin } from '@/models/plugin';

  // Store
  const workflowStore = useWorkflowStore();
  const dictStore = useDictStore();

  // Emits (只保留需要传递给父组件的事件)
  defineEmits<{
    'debug-workflow': [];
  }>();

  // 响应式状态
  const showNodeSelector = ref(false);
  const searchKeyword = ref('');
  const nodeCategories = ref<Array<{ code: string; name: string }>>([]);
  const pluginList = ref<Plugin[]>([]);

  // 过滤后的插件列表
  const filteredPlugins = computed(() => {
    if (!pluginList.value) return [];

    if (!searchKeyword.value) return pluginList.value;

    return pluginList.value.filter(
      (plugin) =>
        plugin.pluginName.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
        plugin.description?.toLowerCase().includes(searchKeyword.value.toLowerCase()),
    );
  });

  // 按分类分组的插件
  const groupedPlugins = computed(() => {
    const grouped: Record<string, Plugin[]> = {};

    // 初始化分类
    nodeCategories.value.forEach((category) => {
      grouped[category.code] = [];
    });

    // 按插件类型分类
    filteredPlugins.value.forEach((plugin) => {
      const pluginType = plugin.pluginType || '';
      if (grouped[pluginType]) {
        grouped[pluginType].push(plugin);
      }
    });

    return grouped;
  });

  // Vue Flow 实例
  const { zoomTo, getViewport, fitView } = useVueFlow();

  // 响应式状态
  const zoom = ref(1);

  // 缩放控制
  const zoomIn = () => {
    const currentZoom = zoom.value;
    const newZoom = Math.min(currentZoom + 0.1, 2);
    zoomTo(newZoom);
    zoom.value = newZoom;
  };

  const zoomOut = () => {
    const currentZoom = zoom.value;
    const newZoom = Math.max(currentZoom - 0.1, 0.2);
    zoomTo(newZoom);
    zoom.value = newZoom;
  };

  // 自动布局
  const handleAutoLayout = () => {
    workflowStore.autoLayout();
    setTimeout(() => {
      fitView();
    }, 100);
  };

  // 添加节点
  const handleAddNode = (plugin: Plugin) => {
    const config = typeof plugin.config === 'string' ? JSON.parse(plugin.config || '{}') : (plugin.config || {});
    const nodeType = config.nodeType || plugin.pluginType;
    workflowStore.addNode(nodeType);
    showNodeSelector.value = false;
  };

  // 加载插件分类
  const loadCategories = async () => {
    try {
      const dictArray = await dictStore.getDictListByType('PLUGIN_TYPE');
      nodeCategories.value = dictArray.map((item) => ({
        code: item.dictCode,
        name: item.dictName,
      }));
    } catch (error) {
      console.error('获取插件分类失败:', error);
    }
  };

  // 加载插件列表
  const loadPlugins = async () => {
    try {
      const res = await getPluginList({
        page: 1,
        pageSize: 1000, // 获取所有插件
      });

      if (res && res.data) {
        pluginList.value = res.data.list || [];
      }
    } catch (error) {
      console.error('获取插件列表失败:', error);
    }
  };

  onMounted(async () => {
    // 加载插件分类和列表
    await loadCategories();
    await loadPlugins();

    // 监听缩放变化
    const updateZoom = () => {
      const viewport = getViewport();
      zoom.value = viewport.zoom;
      requestAnimationFrame(updateZoom);
    };
    updateZoom();
  });
</script>
