<template>
  <div class="w-full h-[calc(100vh-60px)] relative">
    <!-- 主画布区域 -->
    <div class="w-full h-full relative">
      <VueFlow
        v-model:nodes="workflowStore.nodes"
        v-model:edges="workflowStore.edges"
        :node-types="workflowStore.nodeTypes"
        class="w-full h-full bg-slate-50"
        :default-viewport="{ zoom: 1.0 }"
        :default-edge-options="{
          type: 'default',
          animated: true,
          style: { strokeWidth: 2, strokeDasharray: 'none' },
          markerEnd: { type: MarkerType.Arrow, width: 20, height: 20 },
        }"
        :min-zoom="0.2"
        :max-zoom="2"
        fit-view-on-init
        :pan-on-drag="workflowStore.interactionMode === 'mouse'"
        :zoom-on-scroll="workflowStore.interactionMode === 'mouse'"
        :zoom-on-pinch="workflowStore.interactionMode === 'trackpad'"
        :pan-on-scroll="workflowStore.interactionMode === 'trackpad'"
        :zoom-on-double-click="false"
        :selection-key-code="null"
        :multi-selection-key-code="null"
        :delete-key-code="['Backspace', 'Delete']"
        :zoom-activation-key-code="null"
        :pan-activation-key-code="workflowStore.interactionMode === 'mouse' ? 'Space' : null"
        @pane-click="handlePaneClick"
      >
        <!-- 背景 -->
        <Background pattern-color="#aaa" :gap="20" />
        <!-- 小地图 -->
        <MiniMap />
      </VueFlow>

      <!-- 空状态 -->
      <div
        v-if="workflowStore.nodes.length === 0"
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div class="text-center">
          <t-icon name="flow" size="48" class="text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg mb-2">开始构建您的工作流</p>
          <p class="text-gray-400 text-sm">点击下方"添加节点"按钮开始</p>
        </div>
      </div>

      <!-- 浮动工具栏 -->
      <FloatingToolbar @debug-workflow="handleDebugWorkflow" />
    </div>

    <!-- 调试面板 -->
    <DebugPanel
      :visible="showDebugPanel"
      :start-node="getStartNode()"
      :workflow-id="workflowId || ''"
      @close="showDebugPanel = false"
    />

    <!-- 统一的节点配置面板 -->
    <div
      v-if="workflowStore.showNodeConfigPanel && workflowStore.selectedNode"
      class="fixed right-1 top-14 bottom-1 w-[450px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 overflow-hidden flex flex-col"
      :class="workflowStore.showNodeConfigPanel ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
      style="height: calc(100vh - 60px)"
    >
      <!-- 配置面板头部 -->
      <div class="flex items-center justify-between px-6 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <t-icon name="setting" class="text-blue-600" size="16" />
          </div>
          <div>
            <h3
              v-if="!workflowStore.isEditingNodeName"
              class="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              @click="handleStartEditNodeName"
            >
              {{ workflowStore.selectedNode.data?.label }}
            </h3>
            <t-input
              v-else
              v-model="workflowStore.editingNodeName"
              size="small"
              class="font-semibold"
              @blur="workflowStore.finishEditNodeName"
              @keydown="handleKeydown"
              ref="nodeNameInput"
            />
          </div>
        </div>
        <div class="flex items-center gap-1 ml-auto">
          <NodeActions @start-rename="handleStartEditNodeName" />
          <t-button
            variant="text"
            size="small"
            @click="workflowStore.clearSelection"
            class="hover:bg-gray-200 rounded-full"
          >
            <t-icon name="close" size="16" />
          </t-button>
        </div>
      </div>

      <!-- 配置面板内容 -->
      <div class="flex-1 overflow-y-auto">
        <component
          :is="selectedNodeConfigComponent"
          :node="workflowStore.selectedNode"
          @update-node="
            (data: Partial<WorkflowNode['data']>) =>
              workflowStore.selectedNode && workflowStore.updateNode(workflowStore.selectedNode.id, data)
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, markRaw, onMounted, nextTick } from 'vue';
  import { VueFlow, useVueFlow, MarkerType } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { MiniMap } from '@vue-flow/minimap';
  import { useWorkflowStore } from '@/store/modules/workflow';
  import type { WorkflowConfig, WorkflowNode } from '@/store/modules/workflow';
  import NodeActions from './node-actions.vue';
  import FloatingToolbar from './floating-toolbar.vue';
  import DebugPanel from './debug-panel.vue';

  // Props 和 Emits
  const props = defineProps<{
    modelValue: WorkflowConfig;
    workflowId?: string;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: WorkflowConfig];
    'test-workflow': [data: any];
  }>();

  // Store
  const workflowStore = useWorkflowStore();

  // Vue Flow 实例
  const { onConnect, onNodesChange, onEdgesChange, onNodeClick } = useVueFlow();

  // 响应式状态
  const selectedNodeConfigComponent = ref<any>(null);

  // 调试相关状态
  const showDebugPanel = ref(false);

  // 预加载组件
  const nodeComponents = import.meta.glob('@/views/llm/workflow/components/nodes/*.vue', { eager: false });
  const nodeConfigComponents = import.meta.glob('@/views/llm/workflow/components/node-configs/*.vue', { eager: false });

  // 使用标志位避免循环更新
  let isUpdatingFromStore = false;
  let isUpdatingFromProps = false;

  // 调试相关方法
  const handleDebugWorkflow = () => {
    showDebugPanel.value = true;
  };

  // 获取开始节点
  const getStartNode = () => {
    return workflowStore.nodes.find((node) => node.type === 'start') || null;
  };

  // 监听 store 数据变化，同步到父组件
  watch(
    () => workflowStore.workflowConfig,
    (newConfig) => {
      if (!isUpdatingFromProps) {
        isUpdatingFromStore = true;
        emit('update:modelValue', newConfig);
        nextTick(() => {
          isUpdatingFromStore = false;
        });
      }
    },
    { deep: true },
  );

  // 监听 props 变化，同步到 store
  watch(
    () => props.modelValue,
    (newValue) => {
      if (!isUpdatingFromStore && workflowStore.isNodeTypesLoaded) {
        isUpdatingFromProps = true;
        workflowStore.setWorkflowConfig(newValue);
        nextTick(() => {
          isUpdatingFromProps = false;
        });
      }
    },
    { deep: true },
  );

  // 监听选中节点变化，动态加载配置组件
  watch(
    () => workflowStore.selectedNode,
    async (newNode) => {
      if (newNode && newNode.type) {
        selectedNodeConfigComponent.value = await loadNodeConfigComponent(newNode.type);
      } else {
        selectedNodeConfigComponent.value = null;
      }
    },
    { immediate: true },
  );

  // 事件处理
  onConnect((connection) => {
    workflowStore.addEdge(connection);
  });

  onNodesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        workflowStore.updateNodePosition(change.id, change.position);
      } else if (change.type === 'remove') {
        workflowStore.deleteNode(change.id);
      }
    });
  });

  onEdgesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'remove') {
        workflowStore.deleteEdge(change.id);
      }
    });
  });

  onNodeClick((event) => {
    workflowStore.setSelectedNode(event.node);
  });

  // 点击画布空白处的处理
  const handlePaneClick = () => {
    workflowStore.clearSelection();
  };

  // 开始编辑节点名称
  const handleStartEditNodeName = () => {
    workflowStore.startEditNodeName();
    // 下一帧聚焦输入框并选中文本
    nextTick(() => {
      const input = document.querySelector('.t-input__inner') as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  };

  // 处理键盘事件
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      workflowStore.finishEditNodeName();
    } else if (event.key === 'Escape') {
      workflowStore.cancelEditNodeName();
    }
  };

  // 加载节点组件
  const loadNodeComponent = async (componentPath: string) => {
    try {
      let resolvedPath = componentPath;
      if (!componentPath.startsWith('@/') && !componentPath.startsWith('/')) {
        resolvedPath = `/src/views/llm/workflow/components/nodes/${componentPath}`;
      } else if (componentPath.startsWith('@/')) {
        resolvedPath = componentPath.replace('@/', '/src/');
      }

      if (!resolvedPath.endsWith('.vue')) {
        resolvedPath += '.vue';
      }

      const componentLoader = nodeComponents[resolvedPath];
      if (componentLoader) {
        const module = (await componentLoader()) as any;
        return markRaw(module.default || module);
      } else {
        return markRaw({
          template: `<div class="p-4 border border-red-300 bg-red-50 rounded">
            <p class="text-red-600 text-sm">未找到组件: ${resolvedPath}</p>
            <p class="text-xs text-gray-500 mt-1">可用组件: ${Object.keys(nodeComponents).join(', ')}</p>
          </div>`,
        });
      }
    } catch (error) {
      console.error(`加载组件失败: ${componentPath}`, error);
      return markRaw({
        template: `<div class="p-4 border border-red-300 bg-red-50 rounded">
          <p class="text-red-600 text-sm">组件加载失败: ${componentPath}</p>
          <p class="text-xs text-gray-500 mt-1">错误: ${error}</p>
        </div>`,
      });
    }
  };

  // 加载节点配置组件
  const loadNodeConfigComponent = async (nodeType: string) => {
    try {
      const configPath = `/src/views/llm/workflow/components/node-configs/${nodeType}-node-config.vue`;

      const componentLoader = nodeConfigComponents[configPath];
      if (componentLoader) {
        const module = (await componentLoader()) as any;
        return markRaw(module.default || module);
      } else {
        console.warn(`未找到配置组件: ${configPath}`);
        return null;
      }
    } catch (error) {
      console.error(`加载配置组件失败: ${nodeType}`, error);
      return null;
    }
  };

  // 加载节点类型组件
  const loadNodeTypesComponents = async () => {
    const nodeTypesMap: Record<string, any> = {};

    for (const nodeTypeInfo of workflowStore.availableNodeTypes) {
      if (nodeTypeInfo.componentPath) {
        try {
          const component = await loadNodeComponent(nodeTypeInfo.componentPath);
          nodeTypesMap[nodeTypeInfo.type] = component;
        } catch (error) {
          console.warn(`加载组件失败: ${nodeTypeInfo.type} -> ${nodeTypeInfo.componentPath}`, error);
        }
      }
    }

    workflowStore.setNodeTypes(nodeTypesMap);
  };

  onMounted(async () => {
    // 初始化 store
    await workflowStore.initialize();

    // 加载节点类型组件
    await loadNodeTypesComponents();

    // 设置初始数据
    if (props.modelValue) {
      workflowStore.setWorkflowConfig(props.modelValue);
    }
  });
</script>

<style>
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>
