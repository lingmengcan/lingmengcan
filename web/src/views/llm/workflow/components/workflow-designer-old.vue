<script lang="ts" setup>
  import { ref, watch, nextTick, markRaw, onMounted } from 'vue';
  import { VueFlow, useVueFlow, Node, Edge } from '@vue-flow/core';
  import { Background } from '@vue-flow/background';
  import { MiniMap } from '@vue-flow/minimap';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { getPluginList } from '@/api/llm/plugin';

  interface WorkflowVariable {
    name: string;
    type: string;
    value: any;
  }

  interface WorkflowConfig {
    nodes: WorkflowNode[];
    edges: Edge[];
    variables: WorkflowVariable[];
  }

  const props = defineProps<{
    modelValue: WorkflowConfig;
  }>();

  // 扩展 Node 类型以包含我们需要的自定义属性
  type WorkflowNode = Node & {
    data: {
      label: string;
      config: Record<string, any>;
    };
  };

  const emit = defineEmits<{
    'update:modelValue': [value: WorkflowConfig];
    'test-workflow': [data: any];
  }>();

  // Vue Flow 实例
  const { onConnect, addEdges, onNodesChange, onEdgesChange, onNodeClick, fitView, zoomTo, getViewport } = useVueFlow();

  // 节点和边的响应式数据 - 初始为空，等待节点类型加载完成后再设置
  const nodes = ref<WorkflowNode[]>([]);
  const edges = ref<Edge[]>([]);
  const variables = ref(props.modelValue.variables || []);

  // 动态节点类型定义
  const nodeTypes = ref<Record<string, any>>({});

  // 可用的节点类型（从插件市场获取）
  const availableNodeTypes = ref<
    Array<{
      type: string;
      label: string;
      icon: string;
      pluginId: string;
      description?: string;
      config?: any;
      componentPath?: string;
      configSchema?: object;
    }>
  >([]);

  // 节点选择弹窗状态
  const showNodeSelector = ref(false);
  const selectedNode = ref<any>(null);
  
  // 节点配置面板状态
  const showNodeConfigPanel = ref(false);
  const zoomLevel = ref(100); // 初始化为100%，与default-viewport的1.0对应
  const zoomFormat = (value: number) => `${value}%`;

  // 交互模式状态
  const interactionMode = ref<'mouse' | 'trackpad'>('trackpad'); // 默认触控板友好模式
  const showInteractionModeDialog = ref(false);

  // 监听节点和边的变化
  watch(
    [nodes, edges, variables],
    () => {
      emit('update:modelValue', {
        nodes: nodes.value,
        edges: edges.value,
        variables: variables.value,
      });
    },
    { deep: true },
  );

  // 监听外部数据变化
  watch(
    () => props.modelValue,
    (newValue) => {
      // 只有在节点类型已加载的情况下才更新节点数据
      if (Object.keys(nodeTypes.value).length > 0) {
        nodes.value = newValue.nodes || [];
        edges.value = newValue.edges || [];
      }
      variables.value = newValue.variables || [];
    },
    { deep: true },
  );

  // 连接处理
  onConnect((connection) => {
    addEdges([
      {
        id: `edge-${Date.now()}`,
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { strokeDasharray: 'none' },
      } as Edge,
    ]);
  });

  // 节点变化处理
  onNodesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'position' && change.position) {
        const node = nodes.value.find((n) => n.id === change.id);
        if (node) {
          node.position = change.position;
        }
      } else if (change.type === 'remove') {
        nodes.value = nodes.value.filter((n) => n.id !== change.id);
      }
    });
  });

  // 边变化处理
  onEdgesChange((changes) => {
    changes.forEach((change) => {
      if (change.type === 'remove') {
        edges.value = edges.value.filter((e) => e.id !== change.id);
      }
    });
  });

  // 节点点击处理
  onNodeClick((event) => {
    selectedNode.value = event.node;
    showNodeConfigPanel.value = true;
  });

  // 显示节点选择器
  const showAddNodeDialog = () => {
    showNodeSelector.value = true;
  };

  // 添加节点
  const addNode = (nodeType: string) => {
    // 安全检查：确保 availableNodeTypes 已初始化
    if (!availableNodeTypes.value || !Array.isArray(availableNodeTypes.value)) {
      MessagePlugin.error('节点类型未加载完成，请稍后重试');
      return;
    }

    const nodeTypeInfo = availableNodeTypes.value.find((t) => t.type === nodeType);

    const newNode: WorkflowNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: nodeTypeInfo?.label || nodeType,
        config: getDefaultNodeConfig(nodeType),
      },
    };

    nodes.value.push(newNode);
    showNodeSelector.value = false;
    MessagePlugin.success(`已添加${newNode.data.label}`);
  };

  // 获取默认节点配置
  const getDefaultNodeConfig = (nodeType: string) => {
    // 安全检查：确保 availableNodeTypes 已初始化
    if (availableNodeTypes.value && Array.isArray(availableNodeTypes.value)) {
      // 首先尝试从插件配置中获取默认配置
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

    // 回退到硬编码配置
    const configs = {
      start: { inputType: 'text', required: true, defaultValue: '' },
      end: { outputType: 'text', format: 'json' },
      llm: { model: '', temperature: 0.7, maxTokens: 1000 },
      prompt: { template: '', variables: [] },
      condition: { operator: 'equals', value: '' },
      http: { method: 'GET', url: '', headers: {} },
    };
    return configs[nodeType] || {};
  };

  // 适应画布
  const fitToScreen = () => {
    fitView();
    MessagePlugin.info('适应画布');
  };

  // 居中显示
  const centerView = () => {
    fitView();
    MessagePlugin.info('居中显示');
  };

  // 交互模式切换
  const toggleInteractionMode = () => {
    showInteractionModeDialog.value = true;
  };

  const selectInteractionMode = (mode: 'mouse' | 'trackpad') => {
    interactionMode.value = mode;
    showInteractionModeDialog.value = false;
    MessagePlugin.success(`已切换到${mode === 'mouse' ? '鼠标友好模式' : '触控板友好模式'}`);
  };

  // 获取交互模式图标
  const getInteractionModeIcon = () => {
    return interactionMode.value === 'mouse' ? 'mouse' : 'laptop';
  };

  // 获取交互模式标题
  const getInteractionModeTitle = () => {
    return interactionMode.value === 'mouse' ? '鼠标友好模式' : '触控板友好模式';
  };

  // 获取配置字段数量
  const getConfigFieldsCount = (configSchema: any) => {
    if (!configSchema || !configSchema.properties) return 0;
    return Object.keys(configSchema.properties).length;
  };

  // 同步缩放级别
  const syncZoomLevel = () => {
    try {
      const viewport = getViewport();
      if (viewport && viewport.zoom) {
        zoomLevel.value = Math.round(viewport.zoom * 100);
      }
    } catch (error) {
      // 如果获取失败，保持默认值
      console.warn('Failed to sync zoom level:', error);
    }
  };

  // 动态导入节点组件
  const loadNodeComponent = async (componentPath: string) => {
    try {
      // 支持相对路径和绝对路径
      const module = await import(/* @vite-ignore */ componentPath);
      return markRaw(module.default || module);
    } catch (error) {
      console.warn(`加载组件失败: ${componentPath}`, error);
      // 返回一个默认的占位组件
      return markRaw({
        template: `<div class="p-4 border border-red-300 bg-red-50 rounded">
          <p class="text-red-600 text-sm">组件加载失败: ${componentPath}</p>
        </div>`,
      });
    }
  };

  // 从插件市场加载节点类型
  const loadNodeTypesFromPlugins = async () => {
    try {
      console.log('开始加载工作流节点类型...');

      const res = await getPluginList({
        page: 1,
        pageSize: 1000, // 获取所有插件
      });

      if (res && res.data && res.data.list) {
        console.log(`获取到 ${res.data.list.length} 个插件，开始过滤工作流节点...`);

        // 所有插件默认都是工作流节点，只需要过滤掉config解析失败的
        const workflowPlugins = res.data.list.filter((plugin) => {
          try {
            JSON.parse(plugin.config || '{}');
            return true;
          } catch (parseError) {
            console.warn(`插件 ${plugin.pluginId} 的config字段解析失败:`, parseError);
            return false;
          }
        });

        console.log(`处理 ${workflowPlugins.length} 个工作流节点插件`);

        // 转换为节点类型格式并动态加载组件
        const nodeTypesMap: Record<string, any> = {};

        for (const plugin of workflowPlugins) {
          const config = JSON.parse(plugin.config || '{}');
          const nodeType = config.nodeType || plugin.pluginType || 'custom';

          // 动态导入组件
          if (config.componentPath) {
            try {
              const component = await loadNodeComponent(config.componentPath);
              nodeTypesMap[nodeType] = component;
              console.log(`成功加载组件: ${nodeType} -> ${config.componentPath}`);
            } catch (error) {
              console.warn(`加载组件失败: ${nodeType} -> ${config.componentPath}`, error);
            }
          }
        }

        // 更新节点类型映射
        nodeTypes.value = nodeTypesMap;

        // 转换为可用节点类型列表
        availableNodeTypes.value = workflowPlugins.map((plugin) => {
          const config = JSON.parse(plugin.config || '{}');
          const nodeType = config.nodeType || plugin.pluginType || 'custom';

          return {
            type: nodeType,
            label: plugin.pluginName,
            icon: plugin.icon || 'component',
            pluginId: plugin.pluginId,
            description: plugin.description,
            config: config,
            componentPath: config.componentPath,
            configSchema: config.nodeConfigSchema,
          };
        });

        console.log(
          `成功加载 ${availableNodeTypes.value.length} 个工作流节点:`,
          availableNodeTypes.value.map((n) => `${n.label}(${n.type})`).join(', '),
        );

        if (availableNodeTypes.value.length === 0) {
          MessagePlugin.warning('未找到可用的工作流节点，请检查插件配置');
        }
      } else {
        console.warn('获取插件列表响应格式异常:', res);
        MessagePlugin.warning('获取插件列表失败，响应格式异常');
      }
    } catch (error) {
      console.error('加载工作流节点失败:', error);
      MessagePlugin.error(`加载工作流节点失败: ${error.message || '未知错误'}`);
    }
  };

  // 组件挂载后同步缩放级别
  // 处理缩放级别变化
  const handleZoomChange = (value: number) => {
    if (value && value >= 20 && value <= 200) {
      const zoomValue = value / 100;
      zoomTo(zoomValue);
      zoomLevel.value = value;
    }
  };

  // 组件挂载后同步缩放级别和加载节点类型
  // 获取节点标题
  const getNodeTitle = (node: any) => {
    if (!node) return '';
    return node.data?.label || node.type || '未知节点';
  };

  // 获取节点配置组件
  const getNodeConfigComponent = (node: any) => {
    if (!node) return null;
    
    // 根据节点类型返回对应的配置组件
    const configComponents = {
      llm: 'LlmNodeConfig',
      start: 'StartNodeConfig', 
      end: 'EndNodeConfig',
      prompt: 'PromptNodeConfig',
      condition: 'ConditionNodeConfig',
      http: 'HttpNodeConfig',
    };
    
    return configComponents[node.type] || 'DefaultNodeConfig';
  };

  // 更新选中的节点
  const updateSelectedNode = (updatedData: any) => {
    if (selectedNode.value) {
      const nodeIndex = nodes.value.findIndex(n => n.id === selectedNode.value.id);
      if (nodeIndex !== -1) {
        nodes.value[nodeIndex] = {
          ...nodes.value[nodeIndex],
          data: {
            ...nodes.value[nodeIndex].data,
            ...updatedData
          }
        };
        // 更新选中节点的引用
        selectedNode.value = nodes.value[nodeIndex];
      }
    }
  };

  // 组件挂载后同步缩放级别和加载节点类型
  onMounted(async () => {
    nextTick(() => {
      syncZoomLevel();
    });

    // 先加载工作流节点类型
    await loadNodeTypesFromPlugins();

    // 节点类型加载完成后，再设置初始数据
    if (props.modelValue.nodes && props.modelValue.nodes.length > 0) {
      nodes.value = props.modelValue.nodes;
      console.log('设置初始节点数据:', props.modelValue.nodes);
    }

    if (props.modelValue.edges && props.modelValue.edges.length > 0) {
      edges.value = props.modelValue.edges;
      console.log('设置初始边数据:', props.modelValue.edges);
    }
  });
</script>

<template>
  <div class="w-full h-[calc(100vh-60px)] relative">
    <!-- 主画布区域 -->
    <div class="w-full h-full relative">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        class="w-full h-full bg-slate-50"
        :default-viewport="{ zoom: 1.0 }"
        :default-edge-options="{ type: 'smoothstep', animated: true, style: { strokeDasharray: 'none' } }"
        :min-zoom="0.2"
        :max-zoom="2"
        :pan-on-drag="interactionMode === 'mouse'"
        :zoom-on-scroll="interactionMode === 'mouse'"
        :zoom-on-pinch="interactionMode === 'trackpad'"
        :pan-on-scroll="interactionMode === 'trackpad'"
        :zoom-on-double-click="false"
        :selection-key-code="null"
        :multi-selection-key-code="null"
        :delete-key-code="['Backspace', 'Delete']"
        :zoom-activation-key-code="null"
        :pan-activation-key-code="interactionMode === 'mouse' ? 'Space' : null"
      >
        <!-- 背景 -->
        <Background pattern-color="#aaa" :gap="20" />

        <!-- 小地图 -->
        <MiniMap />
      </VueFlow>

      <!-- 空状态 -->
      <div v-if="nodes.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div class="text-center">
          <t-icon name="flow" size="48" class="text-gray-300 mb-4" />
          <p class="text-gray-500 text-lg mb-2">开始构建您的工作流</p>
          <p class="text-gray-400 text-sm">点击下方"添加节点"按钮开始</p>
        </div>
      </div>

      <!-- 浮动工具栏 -->
      <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
        <div
          class="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 backdrop-blur-sm"
        >
          <!-- 交互模式切换 -->
          <t-popup v-model:visible="showInteractionModeDialog" placement="top" :show-arrow="false">
            <t-button
              variant="text"
              size="small"
              @click="toggleInteractionMode"
              :title="getInteractionModeTitle()"
              class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              <t-icon :name="getInteractionModeIcon()" size="16px" />
            </t-button>
            <template #content>
              <div class="p-4 min-w-[280px]">
                <h4 class="text-sm font-semibold text-gray-800 mb-3 text-center">交互模式</h4>
                <div class="flex flex-col gap-2">
                  <!-- 鼠标友好模式 -->
                  <div
                    class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border"
                    :class="
                      interactionMode === 'mouse'
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    "
                    @click="selectInteractionMode('mouse')"
                  >
                    <t-icon name="mouse" size="20" />
                    <div class="flex flex-col gap-0.5">
                      <span class="text-sm font-medium text-gray-800">鼠标友好模式</span>
                      <span class="text-xs text-gray-600 leading-tight">鼠标左键拖动画布，滚轮缩放</span>
                    </div>
                  </div>

                  <!-- 触控板友好模式 -->
                  <div
                    class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border"
                    :class="
                      interactionMode === 'trackpad'
                        ? 'bg-blue-50 border-blue-500'
                        : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    "
                    @click="selectInteractionMode('trackpad')"
                  >
                    <t-icon name="laptop" size="20" />
                    <div class="flex flex-col gap-0.5">
                      <span class="text-sm font-medium text-gray-800">触控板友好模式</span>
                      <span class="text-xs text-gray-600 leading-tight">双指同向移动拖动，双指张开捏合缩放</span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </t-popup>

          <!-- 分隔线 -->
          <div class="h-6 w-px bg-gray-300"></div>

          <!-- 缩放控制 -->
          <div class="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1">
            <t-input-number
              v-model="zoomLevel"
              :min="20"
              :max="200"
              :step="10"
              size="small"
              :format="zoomFormat"
              @change="handleZoomChange"
              auto-width
            />
          </div>

          <!-- 视图控制 -->
          <div class="flex items-center gap-1">
            <t-button
              variant="text"
              size="small"
              @click="fitToScreen"
              title="适应画布"
              class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              <t-icon name="fullscreen" size="16px" />
            </t-button>
            <t-button
              variant="text"
              size="small"
              @click="centerView"
              title="居中显示"
              class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              <t-icon name="view-module" size="16px" />
            </t-button>
            <t-button
              variant="text"
              size="small"
              title="全屏"
              class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              <t-icon name="fullscreen-1" size="16px" />
            </t-button>
            <t-button
              variant="text"
              size="small"
              title="网格"
              class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all"
            >
              <t-icon name="edit" size="16px" />
            </t-button>
          </div>

          <!-- 分隔线 -->
          <div class="h-6 w-px bg-gray-300"></div>

          <!-- 添加节点 -->
          <t-button
            theme="primary"
            size="small"
            @click="showAddNodeDialog"
            class="rounded-full transition-all hover:-translate-y-0.5"
          >
            <template #icon>
              <t-icon name="add" />
            </template>
            添加节点
          </t-button>

          <!-- 分隔线 -->
          <div class="h-6 w-px bg-gray-300"></div>

          <!-- 运行按钮 -->
          <t-button
            theme="success"
            size="small"
            @click="$emit('test-workflow', {})"
            class="rounded-full transition-all hover:-translate-y-0.5"
          >
            <template #icon>
              <t-icon name="play-circle-stroke" />
            </template>
            试运行
          </t-button>
        </div>
      </div>
    </div>

    <!-- 节点选择弹窗 -->
    <t-dialog v-model:visible="showNodeSelector" header="添加节点" width="800px" :footer="false">
      <div v-if="availableNodeTypes.length === 0" class="text-center py-8">
        <t-icon name="component" size="48" class="text-gray-300 mb-4" />
        <p class="text-gray-500">暂无可用的工作流节点</p>
        <p class="text-gray-400 text-sm mt-2">请检查插件配置或联系管理员</p>
      </div>

      <div v-else class="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
        <div
          v-for="nodeType in availableNodeTypes"
          :key="nodeType.type"
          class="flex items-start p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all"
          @click="addNode(nodeType.type)"
        >
          <div class="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0">
            <t-icon :name="nodeType.icon" size="24" class="text-blue-600" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="text-sm font-medium text-gray-900 truncate">{{ nodeType.label }}</h4>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                {{ nodeType.type }}
              </span>
            </div>
            <p class="text-xs text-gray-500 line-clamp-2 mb-2">{{ nodeType.description || '暂无描述' }}</p>

            <!-- 配置信息预览 -->
            <div v-if="nodeType.configSchema" class="text-xs text-gray-400">
              <span class="inline-flex items-center gap-1">
                <t-icon name="setting" size="12" />
                {{ getConfigFieldsCount(nodeType.configSchema) }} 个配置项
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="mt-4 p-3 bg-blue-50 rounded-lg">
        <div class="flex items-start gap-2">
          <t-icon name="info-circle" size="16" class="text-blue-600 mt-0.5 flex-shrink-0" />
          <div class="text-sm text-blue-800">
            <p class="font-medium mb-1">使用提示</p>
            <p class="text-xs leading-relaxed">
              选择节点类型后，可以在画布中拖拽调整位置，双击节点可以编辑配置。
              不同类型的节点具有不同的输入输出接口，请根据工作流需求合理连接。
            </p>
          </div>
        </div>
        </div>
      </div>
    </t-dialog>

    <!-- 统一的节点配置面板 -->
    <div 
      v-if="showNodeConfigPanel && selectedNode" 
      class="fixed top-0 right-0 h-full w-96 bg-white shadow-xl border-l border-gray-200 z-50 transform transition-transform duration-300"
      :class="showNodeConfigPanel ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- 配置面板头部 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <t-icon name="setting" class="text-blue-600" size="16" />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ getNodeTitle(selectedNode) }}</h3>
            <p class="text-sm text-gray-500">节点配置</p>
          </div>
        </div>
        <t-button variant="text" size="small" @click="showNodeConfigPanel = false">
          <t-icon name="close" size="20" />
        </t-button>
      </div>

      <!-- 配置面板内容 -->
      <div class="flex-1 overflow-y-auto p-6">
        <!-- 根据节点类型显示不同的配置 -->
        <component 
          :is="getNodeConfigComponent(selectedNode)" 
          :node="selectedNode"
          @update-node="updateSelectedNode"
        />
      </div>
    </div>

    <!-- 遮罩层 -->
    <!-- 遮罩层 -->
    <div 
      v-if="showNodeConfigPanel" 
      class="fixed inset-0 bg-black bg-opacity-20 z-40"
      @click="showNodeConfigPanel = false"
    ></div>
  </div>
</template>

<style>
  @import '@vue-flow/core/dist/style.css';
  @import '@vue-flow/core/dist/theme-default.css';

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

  /* 文本截断样式 */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* 节点选择弹窗滚动条样式 */
  .max-h-96::-webkit-scrollbar {
    width: 6px;
  }

  .max-h-96::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  .max-h-96::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  .max-h-96::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .absolute.bottom-6 {
      bottom: 1rem;
      left: 1rem;
      right: 1rem;
      transform: none;
    }

    .flex.items-center.gap-3 {
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }

    .grid-cols-2 {
      grid-template-columns: repeat(1, minmax(0, 1fr));
    }

    /* 移动端节点选择弹窗优化 */
    .t-dialog {
      width: 95% !important;
      max-width: none !important;
    }
  }
</style>
