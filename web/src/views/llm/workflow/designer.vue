<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { getWorkflowDetail, editWorkflow, executeWorkflow } from '@/api/llm/workflow';
  import { Workflow } from '@/models/workflow';
  import WorkflowDesigner from './components/workflow-designer.vue';

  const route = useRoute();
  const router = useRouter();

  const workflowId = computed(() => route.query.workflowId as string);
  const workflow = ref<Workflow | null>(null);
  const loading = ref(true);
  const saving = ref(false);
  const selectedNode = ref(null);
  const isRunning = ref(false);

  // 加载工作流详情
  const loadWorkflow = async () => {
    if (!workflowId.value) {
      MessagePlugin.error('缺少工作流ID参数');
      router.back();
      return;
    }

    try {
      loading.value = true;
      const res = await getWorkflowDetail(workflowId.value);
      if (res?.code === 0) {
        workflow.value = res.data;
      } else {
        MessagePlugin.error('加载工作流失败');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      MessagePlugin.error('加载工作流失败');
      router.back();
    } finally {
      loading.value = false;
    }
  };

  // 保存工作流
  const saveWorkflow = async () => {
    if (!workflow.value) return;

    try {
      saving.value = true;
      const res = await editWorkflow(workflow.value);
      if (res?.code === 0) {
        MessagePlugin.success('保存成功');
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      MessagePlugin.error('保存失败');
    } finally {
      saving.value = false;
    }
  };

  // 测试运行工作流
  const testWorkflow = async () => {
    if (!workflow.value) return;

    try {
      isRunning.value = true;
      const res = await executeWorkflow(workflowId.value);
      if (res?.code === 0) {
        MessagePlugin.success('测试运行成功');
        // 跳转到执行结果页面
        router.push({
          path: '/llm/workflow-execution',
          query: {
            workflowId: workflowId.value,
            executionId: res.data?.executionId,
          },
        });
      }
    } catch (error) {
      console.error('Failed to test workflow:', error);
      MessagePlugin.error('测试运行失败');
    } finally {
      isRunning.value = false;
    }
  };

  // 返回上一页
  const goBack = () => {
    router.back();
  };

  // 更新工作流配置
  const updateWorkflowConfig = (config: any) => {
    if (workflow.value) {
      workflow.value.config = config;
    }
  };

  // 处理节点选择
  const handleNodeSelected = (node: any) => {
    selectedNode.value = node;
  };

  // 取消节点选择
  const clearNodeSelection = () => {
    selectedNode.value = null;
  };

  // 导出工作流
  const exportWorkflow = () => {
    if (!workflow.value) return;

    const dataStr = JSON.stringify(workflow.value.config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${workflow.value.workflowName}_workflow.json`;
    link.click();

    URL.revokeObjectURL(url);
    MessagePlugin.success('工作流导出成功');
  };

  // 导入工作流
  const importWorkflow = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result as string;
          const config = JSON.parse(result);
          if (workflow.value) {
            workflow.value.config = config;
            MessagePlugin.success('工作流导入成功');
          }
        } catch (error) {
          MessagePlugin.error('工作流文件格式错误');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 查看执行历史
  const viewExecutionHistory = () => {
    if (workflowId.value) {
      router.push({
        path: '/llm/workflow-execution',
        query: { workflowId: workflowId.value },
      });
    }
  };

  onMounted(() => {
    loadWorkflow();
  });
</script>

<template>
  <div class="workflow-designer-page h-full flex flex-col bg-gray-50">
    <!-- 顶部标题栏 -->
    <div class="bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <t-button variant="text" @click="goBack" size="small" class="text-gray-600">
            <template #icon>
              <t-icon name="chevron-left" />
            </template>
          </t-button>

          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <span class="text-sm font-medium text-gray-900">{{ workflow?.workflowName || 'lingmengcan' }}</span>
            <t-icon name="chevron-down" class="text-gray-400" size="14px" />
          </div>

          <span class="text-xs text-gray-500">已自动保存 07-09 11:51:37</span>
        </div>

        <div class="flex items-center space-x-2">
          <t-space size="small">
            <t-button variant="text" size="small" class="text-gray-600" @click="viewExecutionHistory">
              <t-icon name="history" />
            </t-button>
            <t-button theme="primary" size="small" @click="saveWorkflow" :loading="saving">保存</t-button>
            <t-button theme="primary" size="small" @click="saveWorkflow" :loading="saving">发布</t-button>
            <t-dropdown>
              <t-button variant="text" size="small" class="text-gray-600">
                <t-icon name="more" />
              </t-button>
              <t-dropdown-menu>
                <t-dropdown-item @click="exportWorkflow">
                  <t-icon name="download" class="mr-2" />
                  导出工作流
                </t-dropdown-item>
                <t-dropdown-item @click="importWorkflow">
                  <t-icon name="upload" class="mr-2" />
                  导入工作流
                </t-dropdown-item>
              </t-dropdown-menu>
            </t-dropdown>
          </t-space>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex-1 flex overflow-hidden relative">
      <!-- 工作流画布 -->
      <div class="flex-1 relative bg-gray-50">
        <t-loading :loading="loading" class="h-full">
          <WorkflowDesigner
            v-if="workflow"
            v-model="workflow.config"
            @update:model-value="updateWorkflowConfig"
            @node-selected="handleNodeSelected"
            @test-workflow="testWorkflow"
            class="h-full"
            @click="clearNodeSelection"
          />
        </t-loading>
      </div>

      <!-- 右侧编辑面板 -->
      <div v-if="selectedNode" class="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg">
        <!-- 面板头部 -->
        <div class="flex items-center justify-between p-4 border-b border-gray-100">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <t-icon name="play-circle" class="text-blue-600" size="16" />
            </div>
            <span class="font-medium text-gray-900">开始</span>
          </div>
          <div class="flex items-center space-x-2">
            <t-button variant="text" size="small" class="text-gray-400">
              <t-icon name="help-circle" size="16" />
            </t-button>
            <t-button variant="text" size="small" class="text-gray-400" @click="selectedNode = null">
              <t-icon name="close" size="16" />
            </t-button>
          </div>
        </div>

        <!-- 面板内容 -->
        <div class="flex-1 overflow-y-auto">
          <!-- 节点描述 -->
          <div class="p-4 border-b border-gray-100">
            <p class="text-sm text-gray-600">工作流的起始节点，用于设定启动工作流需要的信息</p>
          </div>

          <!-- 输入配置 -->
          <div class="p-4">
            <div class="mb-4">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <t-icon name="chevron-down" size="14" class="text-gray-400" />
                  <span class="text-sm font-medium text-gray-900">输入</span>
                  <div class="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <t-icon name="help-circle" size="10" class="text-gray-400" />
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <t-button variant="text" size="small" class="text-blue-600 p-1">
                    <t-icon name="import" size="14" />
                  </t-button>
                  <t-button variant="text" size="small" class="text-blue-600 p-1">
                    <t-icon name="add" size="14" />
                  </t-button>
                </div>
              </div>

              <!-- 输入字段 -->
              <div class="space-y-3">
                <div class="grid grid-cols-3 gap-2 text-xs text-gray-500 font-medium">
                  <span>变量名</span>
                  <span>变量类型</span>
                  <span>必填</span>
                </div>

                <div class="grid grid-cols-3 gap-2 items-center">
                  <t-input size="small" value="input" class="text-sm" placeholder="变量名" />
                  <t-select size="small" value="str.String" class="text-sm">
                    <t-option value="str.String" label="str.String" />
                    <t-option value="int.Number" label="int.Number" />
                    <t-option value="bool.Boolean" label="bool.Boolean" />
                  </t-select>
                  <div class="flex items-center justify-between">
                    <t-checkbox checked size="small" />
                    <div class="flex space-x-1">
                      <t-button variant="text" size="small" class="text-gray-400 p-1">
                        <t-icon name="edit" size="12" />
                      </t-button>
                      <t-button variant="text" size="small" class="text-gray-400 p-1">
                        <t-icon name="delete" size="12" />
                      </t-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .workflow-designer-page {
    height: 100vh;
    background: #f8f9fa;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* 浮动工具栏样式 */
  .floating-toolbar {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
  }

  .toolbar-container {
    display: flex;
    align-items: center;
    gap: 12px;
    background: white;
    border-radius: 9999px;
    padding: 8px 16px;
    box-shadow:
      0 10px 25px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
    backdrop-filter: blur(10px);
  }

  /* 缩放控制样式 */
  .zoom-control {
    display: flex;
    align-items: center;
    gap: 4px;
    background: #f3f4f6;
    border-radius: 9999px;
    padding: 4px 8px;
  }

  .zoom-btn {
    padding: 4px !important;
    color: #6b7280;
    border: none;
    background: transparent;
  }

  .zoom-btn:hover {
    background-color: #e5e7eb;
    color: #374151;
  }

  .zoom-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .zoom-text {
    font-size: 12px;
    color: #6b7280;
    min-width: 40px;
    text-align: center;
  }

  /* 视图控制样式 */
  .view-controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .control-btn {
    padding: 8px !important;
    color: #6b7280;
    border: none;
    background: transparent;
    transition: all 0.2s ease;
  }

  .control-btn:hover {
    background-color: #f3f4f6;
    color: #374151;
    transform: translateY(-1px);
  }

  /* 分隔线样式 */
  .divider {
    height: 24px;
    width: 1px;
    background-color: #d1d5db;
  }

  /* 添加节点按钮样式 */
  .add-node-btn {
    border-radius: 9999px;
    transition: all 0.2s ease;
  }

  .add-node-btn:hover {
    transform: translateY(-1px);
  }

  /* 运行按钮样式 */
  .run-btn {
    border-radius: 9999px;
    transition: all 0.2s ease;
  }

  .run-btn:hover {
    transform: translateY(-1px);
  }

  /* 自定义按钮样式 */
  :deep(.t-button--variant-text) {
    color: #6b7280;
    border: none;
    background: transparent;
  }

  :deep(.t-button--variant-text:hover) {
    background-color: #f3f4f6;
    color: #374151;
  }

  /* 状态指示器 */
  .bg-green-500 {
    background-color: #10b981;
  }

  /* 文本颜色 */
  .text-gray-400 {
    color: #9ca3af;
  }

  .text-gray-500 {
    color: #6b7280;
  }

  .text-gray-600 {
    color: #4b5563;
  }

  .text-gray-900 {
    color: #111827;
  }

  /* 边框样式 */
  .border-gray-200 {
    border-color: #e5e7eb;
  }

  /* 圆角样式 */
  .rounded-full {
    border-radius: 9999px;
  }

  /* 顶部标题栏样式 */
  .workflow-designer-page .bg-white:first-child {
    box-shadow:
      0 1px 3px 0 rgba(0, 0, 0, 0.1),
      0 1px 2px 0 rgba(0, 0, 0, 0.06);
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .floating-toolbar {
      bottom: 16px;
      left: 16px;
      right: 16px;
      transform: none;
    }

    .toolbar-container {
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
    }
  }
</style>
