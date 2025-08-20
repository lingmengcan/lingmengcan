<script lang="ts" setup>
  import { ref, watch, nextTick, markRaw } from 'vue';
  import { VueFlow, useVueFlow, Panel, PanelPosition } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { Controls } from '@vue-flow/controls';
  import { MiniMap } from '@vue-flow/minimap';
  import { MessagePlugin } from 'tdesign-vue-next';
  
  // 导入自定义节点组件
  import InputNode from './nodes/input-node.vue';
  import OutputNode from './nodes/output-node.vue';
  import LlmNode from './nodes/llm-node.vue';
  import PromptNode from './nodes/prompt-node.vue';
  import ConditionNode from './nodes/condition-node.vue';
  import HttpNode from './nodes/http-node.vue';

  interface WorkflowConfig {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    variables: WorkflowVariable[];
  }

  interface WorkflowNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      label: string;
      config: Record<string, any>;
    };
  }

  interface WorkflowEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
    animated?: boolean;
  }

  interface WorkflowVariable {
    name: string;
    type: string;
    value: any;
  }

  const props = defineProps<{
    modelValue: WorkflowConfig;
  }>();

  const emit = defineEmits<{
    'update:modelValue': [value: WorkflowConfig];
    'node-selected': [node: any];
  }>();

  // Vue Flow 实例
  const { onConnect, addEdges, onNodesChange, onEdgesChange, onNodeClick, fitView } = useVueFlow();

  // 节点和边的响应式数据
  const nodes = ref(props.modelValue.nodes || []);
  const edges = ref(props.modelValue.edges || []);
  const variables = ref(props.modelValue.variables || []);

  // 节点类型定义
const nodeTypes = markRaw({
  input: InputNode,
  output: OutputNode,
  llm: LlmNode,
  prompt: PromptNode,
  condition: ConditionNode,
  http: HttpNode,
}) as any;

  // 可用的节点类型
  const availableNodeTypes = [
    { type: 'input', label: '输入节点', icon: 'login', color: '#10b981' },
    { type: 'output', label: '输出节点', icon: 'logout', color: '#f59e0b' },
    { type: 'llm', label: 'LLM节点', icon: 'chat', color: '#3b82f6' },
    { type: 'prompt', label: '提示词节点', icon: 'edit-1', color: '#8b5cf6' },
    { type: 'condition', label: '条件节点', icon: 'fork', color: '#ef4444' },
    { type: 'http', label: 'HTTP请求', icon: 'internet', color: '#06b6d4' },
  ];

  // 侧边栏显示状态
  const showSidebar = ref(true);
  const selectedNode = ref<any>(null);

  // 监听节点和边的变化
  watch([nodes, edges, variables], () => {
    emit('update:modelValue', {
      nodes: nodes.value,
      edges: edges.value,
      variables: variables.value,
    });
  }, { deep: true });

  // 监听外部数据变化
  watch(() => props.modelValue, (newValue) => {
    nodes.value = newValue.nodes || [];
    edges.value = newValue.edges || [];
    variables.value = newValue.variables || [];
  }, { deep: true });

  // 连接处理
  onConnect((connection) => {
    addEdges([{
      id: `edge-${Date.now()}`,
      ...connection,
      type: 'smoothstep',
      animated: true,
    }]);
  });

  // 节点变化处理
  onNodesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        const node = nodes.value.find(n => n.id === change.id);
        if (node) {
          node.position = change.position;
        }
      } else if (change.type === 'remove') {
        nodes.value = nodes.value.filter(n => n.id !== change.id);
      }
    });
  });

  // 边变化处理
  onEdgesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'remove') {
        edges.value = edges.value.filter(e => e.id !== change.id);
      }
    });
  });

  // 节点点击处理
  onNodeClick((event) => {
    selectedNode.value = event.node;
    emit('node-selected', event.node);
  });

  // 添加节点
  const addNode = (nodeType: string) => {
    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: availableNodeTypes.find(t => t.type === nodeType)?.label || nodeType,
        config: getDefaultNodeConfig(nodeType),
      },
    };

    nodes.value.push(newNode);
    MessagePlugin.success(`已添加${newNode.data.label}`);
  };

  // 获取默认节点配置
  const getDefaultNodeConfig = (nodeType: string) => {
    const configs = {
      input: { inputType: 'text', required: true, defaultValue: '' },
      output: { outputType: 'text', format: 'json' },
      llm: { model: '', temperature: 0.7, maxTokens: 1000 },
      prompt: { template: '', variables: [] },
      condition: { operator: 'equals', value: '' },
      http: { method: 'GET', url: '', headers: {} },
    };
    return configs[nodeType] || {};
  };

  // 清空画布
  const clearCanvas = () => {
    nodes.value = [];
    edges.value = [];
    MessagePlugin.success('画布已清空');
  };

  // 自动布局
  const autoLayout = () => {
    // 简单的自动布局算法
    nodes.value.forEach((node, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;
      node.position = {
        x: col * 300 + 100,
        y: row * 200 + 100,
      };
    });
    
    nextTick(() => {
      fitView();
    });
    
    MessagePlugin.success('自动布局完成');
  };

  // 缩放适应
  const handleFitView = () => {
    fitView();
  };

  // 移除未使用的导出导入方法
</script>

<template>
  <div class="workflow-designer h-full flex">
    <!-- 左侧工具栏 -->
    <div v-show="showSidebar" class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <!-- 节点库 -->
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-sm font-medium text-gray-900 mb-3">节点库</h3>
        <div class="space-y-2">
          <div
            v-for="nodeType in availableNodeTypes"
            :key="nodeType.type"
            class="flex items-center p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
            @click="addNode(nodeType.type)"
          >
            <div
              class="w-8 h-8 rounded flex items-center justify-center mr-3"
              :style="{ backgroundColor: nodeType.color + '20', color: nodeType.color }"
            >
              <t-icon :name="nodeType.icon" size="16" />
            </div>
            <span class="text-sm text-gray-700">{{ nodeType.label }}</span>
          </div>
        </div>
      </div>

      <!-- 变量管理 -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-medium text-gray-900">全局变量</h3>
          <t-button size="small" theme="primary" variant="text">
            <template #icon>
              <t-icon name="add" />
            </template>
          </t-button>
        </div>
        <div class="space-y-2">
          <div
            v-for="variable in variables"
            :key="variable.name"
            class="flex items-center justify-between p-2 bg-gray-50 rounded"
          >
            <span class="text-sm text-gray-700">{{ variable.name }}</span>
            <t-button size="small" theme="danger" variant="text">
              <t-icon name="delete" size="14" />
            </t-button>
          </div>
          <div v-if="variables.length === 0" class="text-sm text-gray-500 text-center py-4">
            暂无变量
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="p-4 mt-auto">
        <div class="space-y-2">
          <t-button block theme="default" @click="autoLayout">
            <template #icon>
              <t-icon name="auto-width" />
            </template>
            自动布局
          </t-button>
          <t-button block theme="default" @click="handleFitView">
            <template #icon>
              <t-icon name="fullscreen" />
            </template>
            适应画布
          </t-button>
          <t-button block theme="danger" variant="outline" @click="clearCanvas">
            <template #icon>
              <t-icon name="clear" />
            </template>
            清空画布
          </t-button>
        </div>
      </div>
    </div>

    <!-- 主画布区域 -->
    <div class="flex-1 relative">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        class="vue-flow-container"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.2"
        :max-zoom="4"
        fit-view-on-init
      >
        <!-- 背景 -->
        <Background pattern-color="#aaa" :gap="20" />
        
        <!-- 控制器 -->
        <Controls />
        
        <!-- 小地图 -->
        <MiniMap />

        <!-- 顶部面板 -->
        <Panel :position="PanelPosition.TopRight" class="flex items-center space-x-2">
          <t-button
            size="small"
            theme="default"
            @click="showSidebar = !showSidebar"
          >
            <template #icon>
              <t-icon :name="showSidebar ? 'view-list' : 'menu'" />
            </template>
          </t-button>
        </Panel>
      </VueFlow>

      <!-- 空状态 -->
      <div
        v-if="nodes.length === 0"
        class="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div class="text-center">
          <t-icon name="flow" size="48" class="text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg mb-2">开始构建您的工作流</p>
          <p class="text-gray-400 text-sm">从左侧节点库拖拽节点到画布中</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';
  @import '@vue-flow/controls/dist/style.css';
  @import '@vue-flow/minimap/dist/style.css';

  .vue-flow-container {
    background: #f8fafc;
  }

  .vue-flow__node {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid transparent;
  }

  .vue-flow__node.selected {
    border-color: #3b82f6;
  }

  .vue-flow__edge {
    stroke-width: 2;
  }

  .vue-flow__edge.selected {
    stroke: #3b82f6;
  }

  .vue-flow__handle {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .vue-flow__handle-top {
    top: -4px;
  }

  .vue-flow__handle-bottom {
    bottom: -4px;
  }

  .vue-flow__handle-left {
    left: -4px;
  }

  .vue-flow__handle-right {
    right: -4px;
  }
</style>