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
  <div class="h-full flex flex-col bg-gray-50">
    <!-- 顶部标题栏 -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
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
            :workflow-id="workflowId"
            @update:model-value="updateWorkflowConfig"
            @test-workflow="testWorkflow"
            class="h-full"
          />
        </t-loading>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  /* 响应式设计 */
  @media (max-width: 768px) {
    .absolute.bottom-6.left-1\/2 {
      bottom: 4rem;
      left: 1rem;
      right: 1rem;
      transform: none;
    }

    .flex.items-center.gap-3 {
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }
  }
</style>
