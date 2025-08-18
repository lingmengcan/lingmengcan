<script lang="ts" setup>
  import { ref, onMounted, nextTick, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { WorkflowNode, WorkflowEdge, NodeType, WorkflowVariable } from '@/models/workflow';
  import { getNodeTypes } from '@/api/llm/app';
  import NodeConfig from './node-config.vue';
  import WorkflowVariables from './workflow-variables.vue';

  const { t } = useI18n();

  interface Props {
    modelValue: {
      nodes: WorkflowNode[];
      edges: WorkflowEdge[];
      variables: any[];
    };
  }

  const props = defineProps<Props>();
  const emit = defineEmits(['update:modelValue']);

  const canvasRef = ref<HTMLElement>();
  const nodeTypesRef = ref<NodeType[]>([]);
  const selectedNode = ref<WorkflowNode | null>(null);
  const draggedNodeType = ref<string>('');
  const isConnecting = ref(false);
  const connectionStart = ref<{ nodeId: string; portId: string } | null>(null);
  const activeTab = ref('node');

  // 工作流变量
  const workflowVariables = computed({
    get: () => props.modelValue.variables || [],
    set: (value) => {
      const newValue = {
        ...props.modelValue,
        variables: value,
      };
      emit('update:modelValue', newValue);
    },
  });

  // 节点类型分类
  const nodeCategories = ref([
    {
      name: '输入输出',
      types: ['input', 'output'],
    },
    {
      name: 'AI模型',
      types: ['llm', 'prompt'],
    },
    {
      name: '逻辑控制',
      types: ['condition', 'loop'],
    },
    {
      name: '数据处理',
      types: ['http', 'database', 'transform'],
    },
  ]);

  // 获取节点类型
  const loadNodeTypes = async () => {
    try {
      const res = await getNodeTypes();
      if (res?.code === 0) {
        nodeTypesRef.value = res.data || [];
      }
    } catch (error) {
      console.error('Failed to load node types:', error);
    }
  };

  // 获取节点类型信息
  const getNodeType = (type: string) => {
    return (
      nodeTypesRef.value.find((nt) => nt.type === type) || {
        type,
        name: type,
        category: 'other',
        icon: 'rectangle',
        description: '',
        inputs: [],
        outputs: [],
        config: {},
      }
    );
  };

  // 开始拖拽节点类型
  const handleDragStart = (nodeType: string) => {
    draggedNodeType.value = nodeType;
  };

  // 在画布上放置节点
  const handleCanvasDrop = (event: DragEvent) => {
    event.preventDefault();
    if (!draggedNodeType.value) return;

    const rect = canvasRef.value?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const nodeType = getNodeType(draggedNodeType.value);
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: draggedNodeType.value,
      name: nodeType.name,
      position: { x, y },
      data: {
        label: nodeType.name,
        config: { ...nodeType.config },
        inputs: [...nodeType.inputs],
        outputs: [...nodeType.outputs],
      },
    };

    const newValue = {
      ...props.modelValue,
      nodes: [...props.modelValue.nodes, newNode],
    };
    emit('update:modelValue', newValue);

    draggedNodeType.value = '';
  };

  // 选择节点
  const selectNode = (node: WorkflowNode) => {
    selectedNode.value = node;
  };

  // 删除节点
  const deleteNode = (nodeId: string) => {
    const newValue = {
      ...props.modelValue,
      nodes: props.modelValue.nodes.filter((n) => n.id !== nodeId),
      edges: props.modelValue.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    };
    emit('update:modelValue', newValue);

    if (selectedNode.value?.id === nodeId) {
      selectedNode.value = null;
    }
  };

  // 开始连接
  const startConnection = (nodeId: string, portId: string) => {
    isConnecting.value = true;
    connectionStart.value = { nodeId, portId };
  };

  // 完成连接
  const completeConnection = (targetNodeId: string, targetPortId: string) => {
    if (!connectionStart.value || !isConnecting.value) return;

    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      source: connectionStart.value.nodeId,
      target: targetNodeId,
      sourceHandle: connectionStart.value.portId,
      targetHandle: targetPortId,
    };

    const newValue = {
      ...props.modelValue,
      edges: [...props.modelValue.edges, newEdge],
    };
    emit('update:modelValue', newValue);

    isConnecting.value = false;
    connectionStart.value = null;
  };

  // 取消连接
  const cancelConnection = () => {
    isConnecting.value = false;
    connectionStart.value = null;
  };

  // 更新节点配置
  const updateNodeConfig = (nodeId: string, config: any) => {
    const newValue = {
      ...props.modelValue,
      nodes: props.modelValue.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, config } } : node,
      ),
    };
    emit('update:modelValue', newValue);
  };

  // 更新选中的节点
  const updateSelectedNode = (updatedNode: WorkflowNode) => {
    const newValue = {
      ...props.modelValue,
      nodes: props.modelValue.nodes.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
    };
    emit('update:modelValue', newValue);
    selectedNode.value = updatedNode;
  };

  // 更新变量
  const updateVariables = (variables: WorkflowVariable[]) => {
    const newValue = {
      ...props.modelValue,
      variables,
    };
    emit('update:modelValue', newValue);
  };

  // 获取节点位置（用于连线）
  const getNodePosition = (nodeId: string) => {
    const node = props.modelValue.nodes.find((n) => n.id === nodeId);
    return node ? node.position : { x: 0, y: 0 };
  };

  onMounted(() => {
    loadNodeTypes();
  });
</script>

<template>
  <div class="workflow-designer flex h-full">
    <!-- 左侧节点面板 -->
    <div class="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h3 class="text-lg font-semibold mb-4">{{ $t('views.llm.app.workflow.nodes') }}</h3>

      <div v-for="category in nodeCategories" :key="category.name" class="mb-6">
        <h4 class="text-sm font-medium text-gray-700 mb-2">{{ category.name }}</h4>
        <div class="space-y-2">
          <div
            v-for="nodeType in category.types"
            :key="nodeType"
            class="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
            draggable="true"
            @dragstart="handleDragStart(nodeType)"
          >
            <div class="flex items-center space-x-2">
              <t-icon :name="getNodeType(nodeType).icon" class="text-blue-500" />
              <span class="text-sm">{{ $t(`views.llm.app.workflow.nodeTypes.${nodeType}`) }}</span>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ getNodeType(nodeType).description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间画布区域 -->
    <div class="flex-1 relative overflow-hidden">
      <div
        ref="canvasRef"
        class="w-full h-full bg-gray-100 relative"
        @drop="handleCanvasDrop"
        @dragover.prevent
        @click="cancelConnection"
      >
        <!-- 网格背景 -->
        <div class="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" stroke-width="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <!-- 连线 -->
        <svg class="absolute inset-0 pointer-events-none">
          <g v-for="edge in modelValue.edges" :key="edge.id">
            <path
              :d="`M ${getNodePosition(edge.source).x + 100} ${getNodePosition(edge.source).y + 25} 
                   L ${getNodePosition(edge.target).x} ${getNodePosition(edge.target).y + 25}`"
              stroke="#6b7280"
              stroke-width="2"
              fill="none"
              marker-end="url(#arrowhead)"
            />
          </g>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>
        </svg>

        <!-- 节点 -->
        <div
          v-for="node in modelValue.nodes"
          :key="node.id"
          class="absolute bg-white border-2 rounded-lg shadow-lg cursor-pointer"
          :class="{
            'border-blue-500': selectedNode?.id === node.id,
            'border-gray-300': selectedNode?.id !== node.id,
          }"
          :style="{
            left: node.position.x + 'px',
            top: node.position.y + 'px',
            width: '200px',
            minHeight: '80px',
          }"
          @click.stop="selectNode(node)"
        >
          <!-- 节点头部 -->
          <div class="p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <t-icon :name="getNodeType(node.type).icon" class="text-blue-500" />
                <span class="font-medium text-sm">{{ node.data.label }}</span>
              </div>
              <t-button size="small" theme="danger" variant="text" @click.stop="deleteNode(node.id)">
                <template #icon>
                  <t-icon name="close" />
                </template>
              </t-button>
            </div>
          </div>

          <!-- 节点内容 -->
          <div class="p-3">
            <div class="text-xs text-gray-600">
              {{ getNodeType(node.type).description }}
            </div>
          </div>

          <!-- 输入端口 -->
          <div
            v-for="input in node.data.inputs"
            :key="input.id"
            class="absolute left-0 top-1/2 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            :title="input.name"
            @click.stop="completeConnection(node.id, input.id)"
          />

          <!-- 输出端口 -->
          <div
            v-for="output in node.data.outputs"
            :key="output.id"
            class="absolute right-0 top-1/2 w-3 h-3 bg-green-500 rounded-full transform translate-x-1/2 -translate-y-1/2 cursor-pointer"
            :title="output.name"
            @click.stop="startConnection(node.id, output.id)"
          />
        </div>
      </div>
    </div>

    <!-- 右侧属性面板 -->
    <div class="w-80 bg-gray-50 border-l border-gray-200 overflow-hidden flex flex-col">
      <!-- 面板切换标签 -->
      <div class="border-b border-gray-200">
        <t-tabs v-model:value="activeTab" theme="normal">
          <t-tab-panel value="node" label="节点配置">
            <div class="p-4 overflow-y-auto" style="height: calc(100vh - 200px)">
              <NodeConfig v-if="selectedNode" :node="selectedNode" @update:node="updateSelectedNode" />
              <div v-else class="text-center text-gray-500 mt-8">
                <t-icon name="cursor" size="48" class="mx-auto mb-4 opacity-50" />
                <p>选择一个节点来编辑属性</p>
              </div>
            </div>
          </t-tab-panel>

          <t-tab-panel value="variables" label="变量管理">
            <div class="p-4 overflow-y-auto" style="height: calc(100vh - 200px)">
              <WorkflowVariables v-model="workflowVariables" @update:model-value="updateVariables" />
            </div>
          </t-tab-panel>
        </t-tabs>
      </div>
    </div>
  </div>
</template>

<script>
  // 辅助方法
  function getNodePosition(nodeId) {
    const node = this.modelValue.nodes.find((n) => n.id === nodeId);
    return node ? node.position : { x: 0, y: 0 };
  }
</script>

<style scoped>
  .workflow-designer {
    height: calc(100vh - 200px);
  }

  .workflow-designer .t-button {
    border: none;
    box-shadow: none;
  }

  /* 拖拽时的样式 */
  .dragging {
    opacity: 0.5;
  }

  /* 连接线动画 */
  .connecting-line {
    stroke-dasharray: 5, 5;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: -10;
    }
  }
</style>
