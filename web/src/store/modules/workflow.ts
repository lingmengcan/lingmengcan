import { defineStore } from 'pinia';
import { ref, computed, nextTick } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import { MarkerType } from '@vue-flow/core';
import { MessagePlugin } from 'tdesign-vue-next';
import { getPluginList } from '@/api/llm/plugin';
import type { WorkflowVariable as ModelWorkflowVariable, WorkflowConfig as ModelWorkflowConfig, WorkflowNode as ModelWorkflowNode } from '@/models/workflow';

// 重新导出类型以保持兼容性
export type WorkflowVariable = ModelWorkflowVariable;
export type WorkflowConfig = ModelWorkflowConfig;

export type WorkflowNode = Node & {
  selected: boolean;
  data: {
    label: string;
    config: Record<string, any>;
    inputs?: Array<{ name: string; type: string; required: boolean; description?: string }>;
    outputs?: Array<{ name: string; type: string; description?: string }>;
  };
};

export interface NodeTypeInfo {
  type: string;
  label: string;
  icon: string;
  pluginId: string;
  description?: string;
  config?: any;
  componentPath?: string;
  configSchema?: object;
  displayField?: string; // 在节点上显示的额外信息字段名
}

export interface HistoryState {
  nodes: WorkflowNode[];
  edges: Edge[];
}

export const useWorkflowStore = defineStore('workflow', () => {
  // ========== 核心数据状态 ==========
  const nodes = ref<WorkflowNode[]>([]);
  const edges = ref<Edge[]>([]);
  const variables = ref<WorkflowVariable[]>([]);
  
  // ========== 节点类型管理 ==========
  const nodeTypes = ref<Record<string, any>>({});
  const availableNodeTypes = ref<NodeTypeInfo[]>([]);
  
  // ========== UI 状态 ==========
  const showNodeSelector = ref(false);
  const selectedNode = ref<WorkflowNode | null>(null);
  const showNodeConfigPanel = ref(false);
  const interactionMode = ref<'mouse' | 'trackpad'>('trackpad');
  
  // ========== 节点编辑状态 ==========
  const isEditingNodeName = ref(false);
  const editingNodeName = ref('');
  
  // ========== 历史记录管理 ==========
  const history = ref<HistoryState[]>([]);
  const historyIndex = ref(-1);
  const maxHistorySize = 50;
  
  // ========== 初始化状态 ==========
  const isInitialized = ref(false);
  
  // ========== 计算属性 ==========
  const isNodeTypesLoaded = computed(() => Object.keys(nodeTypes.value).length > 0);
  
  const canUndo = computed(() => historyIndex.value > 0);
  
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);
  
  /**
   * 清理节点数据，移除 Vue Flow 运行时状态
   */
  const cleanNode = (node: WorkflowNode): any => ({
    id: node.id,
    type: node.type,
    position: node.position,
    data: {
      label: node.data?.label,
      config: node.data?.config,
    },
  });

  /**
   * 清理边数据，移除冗余的 sourceNode/targetNode
   */
  const cleanEdge = (edge: Edge): any => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle || null,
    targetHandle: edge.targetHandle || null,
    type: edge.type,
    animated: edge.animated,
  });

  /**
   * 获取清理后的工作流配置（用于保存/导出）
   */
  const getCleanWorkflowConfig = (): WorkflowConfig => ({
    nodes: nodes.value.map(cleanNode),
    edges: edges.value.map(cleanEdge),
    variables: variables.value,
  });

  const workflowConfig = computed((): WorkflowConfig => getCleanWorkflowConfig());
  
  // ========== 节点管理方法 ==========
  
  /**
   * 添加节点
   */
  const addNode = (nodeType: string) => {
    if (!availableNodeTypes.value || !Array.isArray(availableNodeTypes.value)) {
      MessagePlugin.error('节点类型未加载完成，请稍后重试');
      return null;
    }

    const nodeTypeInfo = availableNodeTypes.value.find((t) => t.type === nodeType);
    if (!nodeTypeInfo) {
      MessagePlugin.error('未找到指定的节点类型');
      return null;
    }

    // 先取消所有节点的选中状态
    clearNodeSelection();

    // 创建新节点
    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      selected: true,
      style: {
        border: '1px solid #0052D9',
        borderRadius: '8px',
      },
      data: {
        label: nodeTypeInfo.label || nodeType,
        config: getDefaultNodeConfig(nodeType),
      },
    };

    nodes.value.push(newNode);
    
    // 设置选中节点
    setSelectedNode(newNode);
    
    MessagePlugin.success(`已添加${newNode.data.label}`);
    return newNode;
  };
  
  /**
   * 删除节点
   */
  const deleteNode = (nodeId: string) => {
    // 删除节点
    nodes.value = nodes.value.filter((node) => node.id !== nodeId);
    
    // 删除相关的连接线
    edges.value = edges.value.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);
    
    // 如果删除的是当前选中的节点，清除选中状态
    if (selectedNode.value && selectedNode.value.id === nodeId) {
      clearSelection();
    }
    
    MessagePlugin.success('节点已删除');
  };
  
  /**
   * 复制节点
   */
  const copyNode = (nodeId: string) => {
    const originalNode = nodes.value.find((n) => n.id === nodeId);
    if (!originalNode) {
      MessagePlugin.error('未找到要复制的节点');
      return null;
    }

    const newNode: WorkflowNode = {
      id: `${originalNode.type}-${Date.now()}`,
      type: originalNode.type,
      position: {
        x: originalNode.position.x + 50,
        y: originalNode.position.y + 50,
      },
      selected: false,
      style: {
        border: 'none',
      },
      data: {
        label: `${originalNode.data.label} 副本`,
        config: { ...originalNode.data.config },
      },
    };

    nodes.value.push(newNode);
    MessagePlugin.success('节点已复制');
    return newNode;
  };
  
  /**
   * 更新节点数据（对 config 做深度合并，确保 outputs 等字段不被覆盖丢失）
   */
  const updateNode = (nodeId: string, updatedData: Partial<WorkflowNode['data']>) => {
    const nodeIndex = nodes.value.findIndex((n) => n.id === nodeId);
    if (nodeIndex !== -1) {
      const existingData = nodes.value[nodeIndex].data;
      
      // 对 config 做深度合并，而不是浅层替换
      const mergedConfig = updatedData.config
        ? { ...existingData.config, ...updatedData.config }
        : existingData.config;
      
      const newData = {
        ...existingData,
        ...updatedData,
        config: mergedConfig,
      };
      
      const updatedNode = {
        ...nodes.value[nodeIndex],
        data: newData,
      };
      
      // 创建新的 nodes 数组，确保 Vue Flow 检测到变化
      nodes.value = nodes.value.map((node, index) => 
        index === nodeIndex ? updatedNode : node
      );
      
      // 如果更新的是当前选中的节点，同步更新选中节点
      if (selectedNode.value && selectedNode.value.id === nodeId) {
        selectedNode.value = updatedNode;
      }
    }
  };
  
  /**
   * 更新节点位置
   */
  const updateNodePosition = (nodeId: string, position: { x: number; y: number }) => {
    const node = nodes.value.find((n) => n.id === nodeId);
    if (node) {
      node.position = position;
    }
  };
  
  // ========== 边管理方法 ==========
  
  /**
   * 添加连接线
   */
  const addEdge = (connection: any) => {
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      ...connection,
      type: 'default',
      animated: true,
      style: { strokeWidth: 2, strokeDasharray: 'none' },
      markerEnd: { type: MarkerType.Arrow, width: 20, height: 20 },
    };
    
    edges.value.push(newEdge);
    return newEdge;
  };
  
  /**
   * 删除连接线
   */
  const deleteEdge = (edgeId: string) => {
    edges.value = edges.value.filter((e) => e.id !== edgeId);
  };
  
  // ========== 选择管理方法 ==========
  
  /**
   * 设置选中节点
   */
  const setSelectedNode = (node: WorkflowNode | null) => {
    selectedNode.value = node;
    showNodeConfigPanel.value = !!node;
    
    if (node) {
      // 更新节点选中状态
      updateNodeSelection(node.id);
    }
  };
  
  /**
   * 更新节点选中状态
   */
  const updateNodeSelection = (selectedNodeId: string) => {
    nodes.value = nodes.value.map((node) => {
      if (node.id === selectedNodeId) {
        return {
          ...node,
          selected: true,
          style: {
            ...node.style,
            border: '1px solid #0052D9',
            borderRadius: '8px',
          },
        };
      } else {
        return {
          ...node,
          selected: false,
          style: {
            ...node.style,
            border: 'none',
          },
        };
      }
    });
  };
  
  /**
   * 清除节点选中状态
   */
  const clearNodeSelection = () => {
    nodes.value = nodes.value.map((node) => ({
      ...node,
      selected: false,
      style: {
        ...node.style,
        border: 'none',
      },
    }));
  };
  
  /**
   * 清除所有选中状态
   */
  const clearSelection = () => {
    clearNodeSelection();
    selectedNode.value = null;
    showNodeConfigPanel.value = false;
  };
  
  // ========== 节点名称编辑 ==========
  
  /**
   * 开始编辑节点名称
   */
  const startEditNodeName = () => {
    if (!selectedNode.value) return;
    
    isEditingNodeName.value = true;
    editingNodeName.value = selectedNode.value.data?.label || '';
  };
  
  /**
   * 完成编辑节点名称
   */
  const finishEditNodeName = () => {
    if (!selectedNode.value) return;
    
    const newName = editingNodeName.value.trim();
    const currentName = selectedNode.value.data?.label || '';
    
    if (newName && newName !== currentName) {
      updateNode(selectedNode.value.id, { label: newName });
      MessagePlugin.success('节点重命名成功');
    }
    
    isEditingNodeName.value = false;
    editingNodeName.value = '';
  };
  
  /**
   * 取消编辑节点名称
   */
  const cancelEditNodeName = () => {
    isEditingNodeName.value = false;
    editingNodeName.value = '';
  };
  
  // ========== UI 状态管理 ==========
  
  /**
   * 显示节点选择器
   */
  const showAddNodeDialog = () => {
    showNodeSelector.value = true;
  };
  
  /**
   * 隐藏节点选择器
   */
  const hideAddNodeDialog = () => {
    showNodeSelector.value = false;
  };
  
  /**
   * 切换交互模式
   */
  const toggleInteractionMode = () => {
    interactionMode.value = interactionMode.value === 'mouse' ? 'trackpad' : 'mouse';
    localStorage.setItem('workflowInteractionMode', interactionMode.value);
  };
  
  /**
   * 设置交互模式
   */
  const setInteractionMode = (mode: 'mouse' | 'trackpad') => {
    interactionMode.value = mode;
    localStorage.setItem('workflowInteractionMode', mode);
  };
  
  // ========== 历史记录管理 ==========
  
  /**
   * 保存到历史记录
   */
  const saveToHistory = () => {
    // 如果当前不在历史记录的最后，则删除当前位置之后的所有记录
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1);
    }
    
    // 添加当前状态到历史记录
    history.value.push({
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value)),
    });
    
    // 如果历史记录超过最大大小，则删除最早的记录
    if (history.value.length > maxHistorySize) {
      history.value.shift();
    }
    
    historyIndex.value = history.value.length - 1;
  };
  
  /**
   * 撤销操作
   */
  const undo = () => {
    if (canUndo.value) {
      historyIndex.value--;
      const state = history.value[historyIndex.value];
      nodes.value = JSON.parse(JSON.stringify(state.nodes));
      edges.value = JSON.parse(JSON.stringify(state.edges));
      
      // 清除选中状态
      clearSelection();
    }
  };
  
  /**
   * 重做操作
   */
  const redo = () => {
    if (canRedo.value) {
      historyIndex.value++;
      const state = history.value[historyIndex.value];
      nodes.value = JSON.parse(JSON.stringify(state.nodes));
      edges.value = JSON.parse(JSON.stringify(state.edges));
      
      // 清除选中状态
      clearSelection();
    }
  };
  
  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    history.value = [];
    historyIndex.value = -1;
  };
  
  // ========== 布局管理 ==========
  
  /**
   * 自动布局
   */
  const autoLayout = () => {
    const nodeSpacing = 250;
    const levelSpacing = 350;
    const isolatedNodeSpacing = 180;
    
    // 找到有连接的节点和孤立节点
    const connectedNodeIds = new Set<string>();
    edges.value.forEach((edge) => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    const connectedNodes = nodes.value.filter((node) => connectedNodeIds.has(node.id));
    const isolatedNodes = nodes.value.filter((node) => !connectedNodeIds.has(node.id));
    
    // 处理有连接的节点 - 横向布局
    if (connectedNodes.length > 0) {
      const startNodes = connectedNodes.filter((node) => 
        !edges.value.some((edge) => edge.target === node.id)
      );
      
      if (startNodes.length > 0) {
        const levels: { [key: number]: WorkflowNode[] } = {};
        const visited = new Set<string>();
        
        const assignLevel = (nodeId: string, level: number) => {
          if (visited.has(nodeId)) return;
          visited.add(nodeId);
          
          const node = connectedNodes.find((n) => n.id === nodeId);
          if (!node) return;
          
          if (!levels[level]) levels[level] = [];
          levels[level].push(node);
          
          const connectedEdges = edges.value.filter((edge) => edge.source === nodeId);
          connectedEdges.forEach((edge) => {
            assignLevel(edge.target, level + 1);
          });
        };
        
        startNodes.forEach((node) => assignLevel(node.id, 0));
        
        // 更新节点位置
        Object.keys(levels).forEach((levelKey) => {
          const level = parseInt(levelKey);
          const levelNodes = levels[level];
          
          levelNodes.forEach((node, index) => {
            const totalHeight = (levelNodes.length - 1) * nodeSpacing;
            const startY = -totalHeight / 2;
            
            node.position = {
              x: level * levelSpacing,
              y: startY + index * nodeSpacing,
            };
          });
        });
      }
    }
    
    // 处理孤立节点
    if (isolatedNodes.length > 0) {
      let baseX = 0;
      let maxY = 0;
      
      if (connectedNodes.length > 0) {
        maxY = Math.max(...connectedNodes.map((node) => node.position.y)) + nodeSpacing;
      }
      
      isolatedNodes.forEach((node, index) => {
        node.position = {
          x: baseX,
          y: maxY + index * isolatedNodeSpacing,
        };
      });
    }
  };
  
  // ========== 数据管理 ==========
  
  /**
   * 确保节点 config 中包含 outputs 字段（兼容旧数据）
   */
  const ensureNodeOutputs = (nodeList: any[]) => {
    nodeList.forEach((node: any) => {
      if (node.type && node.data?.config && !node.data.config.outputs) {
        const defaultConfig = BUILTIN_DEFAULT_CONFIGS[node.type as string];
        if (defaultConfig?.outputs) {
          node.data.config.outputs = JSON.parse(JSON.stringify(defaultConfig.outputs));
        }
      }
    });
    return nodeList;
  };

  /**
   * 设置工作流配置
   */
  const setWorkflowConfig = (config: WorkflowConfig, force = false) => {
    if (!config) return;
    
    // 强制更新或使用浅比较
    if (force) {
      nodes.value = ensureNodeOutputs(config.nodes || []);
      edges.value = config.edges || [];
      variables.value = config.variables || [];
      clearNodeSelection();
      return;
    }
    
    // 使用浅比较避免深度 JSON 序列化的性能问题
    const currentConfig = workflowConfig.value;
    const nodesChanged = (config.nodes?.length || 0) !== (currentConfig.nodes?.length || 0) ||
      config.nodes?.some((node, index) => node.id !== currentConfig.nodes?.[index]?.id);
    const edgesChanged = (config.edges?.length || 0) !== (currentConfig.edges?.length || 0) ||
      config.edges?.some((edge, index) => edge.id !== currentConfig.edges?.[index]?.id);
    const variablesChanged = (config.variables?.length || 0) !== (currentConfig.variables?.length || 0);
    
    if (nodesChanged || edgesChanged || variablesChanged) {
      // 批量更新，减少响应式触发次数
      nodes.value = ensureNodeOutputs(config.nodes || []);
      edges.value = config.edges || [];
      variables.value = config.variables || [];
      
      // 确保所有节点初始化时都没有选中状态
      clearNodeSelection();
      
      // 延迟保存历史记录，避免在初始化时触发
      if (isInitialized.value) {
        nextTick(() => {
          saveToHistory();
        });
      }
    }
  };
  
  /**
   * 重置工作流
   */
  const resetWorkflow = () => {
    nodes.value = [];
    edges.value = [];
    variables.value = [];
    clearSelection();
    clearHistory();
    saveToHistory();
  };
  
  /**
   * 内置节点类型的默认配置（参考 Dify/n8n 等成熟方案，硬编码确保可靠性）
   */
  const BUILTIN_DEFAULT_CONFIGS: Record<string, Record<string, any>> = {
    start: {
      inputs: [{ name: 'input', type: 'text' }],
    },
    end: {
      outputs: [{ name: 'output', type: 'text' }],
    },
    llm: {
      model: '',
      temperature: 0.7,
      maxTokens: 4096,
      topP: 1,
      systemPrompt: '',
      userPrompt: '',
      inputs: [{ name: 'input', type: 'text', source: '' }],
      outputs: [
        { name: 'output', type: 'text' },
        { name: 'reasoning_content', type: 'text' },
      ],
    },
    condition: {
      ifConditions: [{ variable: '', operator: '', value: '', logic: 'AND' }],
      elifCases: [],
      outputs: [{ name: 'output', type: 'text' }],
    },
    http: {
      method: 'GET',
      url: '',
      params: {},
      headers: {},
      body: '',
      bodyType: 'none',
      timeout: 120,
      retryCount: 3,
      authEnabled: false,
      authType: 'bearer',
      authToken: '',
      outputs: [
        { name: 'statusCode', type: 'number' },
        { name: 'headers', type: 'json' },
        { name: 'body', type: 'text' },
      ],
    },
    database: {
      operationType: 'select',
      dataSource: 'default',
      tableName: '',
      fields: [],
      conditions: [],
      sql: '',
      outputVariable: 'output',
      limit: 100,
      orderBy: '',
      errorHandling: 'fail',
      outputs: [{ name: 'output', type: 'json' }],
    },
    transform: {
      transformType: 'mapping',
      inputFormat: 'json',
      outputFormat: 'json',
      rules: [],
      outputVariable: 'output',
      errorHandling: 'skip',
      defaultValue: '',
      customScript: '',
      outputs: [{ name: 'output', type: 'json' }],
    },
    loop: {
      loopType: 'for',
      maxIterations: 10,
      condition: '',
      breakCondition: '',
      outputVariable: 'output',
      outputType: 'array',
      aggregation: 'collect',
      outputs: [{ name: 'output', type: 'json' }],
    },
    parallel: {
      branchCount: 2,
      strategy: 'all',
      branches: [
        { name: '分支1', enabled: true, timeout: 30, retryCount: 0 },
        { name: '分支2', enabled: true, timeout: 30, retryCount: 0 },
      ],
      mergeStrategy: 'collect',
      outputVariable: 'output',
      errorHandling: 'fail-fast',
      timeout: 60,
      outputs: [{ name: 'output', type: 'json' }],
    },
  };

  /**
   * 获取默认节点配置
   */
  const getDefaultNodeConfig = (nodeType: string) => {
    // 优先使用内置默认配置
    if (BUILTIN_DEFAULT_CONFIGS[nodeType]) {
      return JSON.parse(JSON.stringify(BUILTIN_DEFAULT_CONFIGS[nodeType]));
    }

    // 自定义节点类型：从 schema 提取默认值
    if (availableNodeTypes.value && Array.isArray(availableNodeTypes.value)) {
      const nodeTypeInfo = availableNodeTypes.value.find((t) => t.type === nodeType);
      if (nodeTypeInfo?.configSchema) {
        const schema = nodeTypeInfo.configSchema as any;
        if (schema.properties) {
          const defaultConfig: Record<string, any> = {};
          Object.keys(schema.properties).forEach((key) => {
            const property = schema.properties[key];
            if (property.default !== undefined) {
              defaultConfig[key] = property.default;
            }
          });
          return defaultConfig;
        }
      }
    }
    return {};
  };
  
  // ========== 节点类型管理 ==========
  
  /**
   * 从插件加载节点类型
   */
  const loadNodeTypesFromPlugins = async () => {
    try {
      const res = await getPluginList({
        page: 1,
        pageSize: 1000,
      });
      
      if (res && res.data && res.data.list) {
        // 解析配置的辅助函数
        const parseConfig = (config: any): Record<string, any> => {
          if (!config) return {};
          if (typeof config === 'object') return config;
          if (typeof config === 'string') {
            try {
              return JSON.parse(config);
            } catch {
              return {};
            }
          }
          return {};
        };

        const workflowPlugins = res.data.list.filter((plugin) => {
          const config = parseConfig(plugin.config);
          return config && typeof config === 'object';
        });
        
        // 设置可用节点类型
        availableNodeTypes.value = workflowPlugins.map((plugin) => {
          const config = parseConfig(plugin.config);
          const nodeType = config.nodeType || plugin.pluginType || 'custom';
          
          return {
            type: nodeType,
            label: plugin.pluginName,
            icon: plugin.icon || 'component',
            pluginId: plugin.pluginId || '',
            description: plugin.description,
            config: config,
            componentPath: config.componentPath,
            configSchema: config.nodeConfigSchema,
            displayField: config.displayField,
          };
        });
        
        if (availableNodeTypes.value.length === 0) {
          MessagePlugin.warning('未找到可用的工作流节点，请检查插件配置');
        }
      }
    } catch (error) {
      MessagePlugin.error(`加载工作流节点失败: ${error || '未知错误'}`);
    }
  };
  
  /**
   * 设置节点类型组件
   */
  const setNodeTypes = (types: Record<string, any>) => {
    nodeTypes.value = types;
  };
  
  // ========== 初始化方法 ==========
  
  /**
   * 初始化 store
   */
  const initialize = async () => {
    // 加载节点类型
    await loadNodeTypesFromPlugins();
    
    // 从本地存储加载交互模式
    const savedMode = localStorage.getItem('workflowInteractionMode');
    if (savedMode === 'mouse' || savedMode === 'trackpad') {
      interactionMode.value = savedMode;
    }
    
    // 初始化历史记录
    saveToHistory();
    
    // 标记为已初始化
    isInitialized.value = true;
  };
  
  return {
    // 状态
    nodes,
    edges,
    variables,
    nodeTypes,
    availableNodeTypes,
    showNodeSelector,
    selectedNode,
    showNodeConfigPanel,
    interactionMode,
    isEditingNodeName,
    editingNodeName,
    history,
    historyIndex,
    isInitialized,
    
    // 计算属性
    isNodeTypesLoaded,
    canUndo,
    canRedo,
    workflowConfig,
    
    // 节点管理
    addNode,
    deleteNode,
    copyNode,
    updateNode,
    updateNodePosition,
    
    // 边管理
    addEdge,
    deleteEdge,
    
    // 选择管理
    setSelectedNode,
    updateNodeSelection,
    clearNodeSelection,
    clearSelection,
    
    // 节点名称编辑
    startEditNodeName,
    finishEditNodeName,
    cancelEditNodeName,
    
    // UI 状态管理
    showAddNodeDialog,
    hideAddNodeDialog,
    toggleInteractionMode,
    setInteractionMode,
    
    // 历史记录管理
    saveToHistory,
    undo,
    redo,
    clearHistory,
    
    // 布局管理
    autoLayout,
    
    // 数据管理
    setWorkflowConfig,
    resetWorkflow,
    getDefaultNodeConfig,
    getCleanWorkflowConfig,
    
    // 节点类型管理
    loadNodeTypesFromPlugins,
    setNodeTypes,
    
    // 初始化
    initialize,
  };
});