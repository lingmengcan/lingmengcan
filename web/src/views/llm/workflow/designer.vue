<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { MessagePlugin, LoadingPlugin } from 'tdesign-vue-next';
  import { getApplicationDetail, editApplication, executeWorkflow } from '@/api/llm/app';
  import { Application } from '@/models/workflow';
  import WorkflowDesigner from './components/workflow-designer.vue';

  const route = useRoute();
  const router = useRouter();

  const appId = computed(() => route.query.appId as string);
  const app = ref<Application | null>(null);
  const loading = ref(true);
  const saving = ref(false);
  const selectedNode = ref(null);

  // 加载应用详情
  const loadApp = async () => {
    if (!appId.value) {
      MessagePlugin.error('缺少应用ID参数');
      router.back();
      return;
    }

    try {
      loading.value = true;
      const res = await getApplicationDetail(appId.value);
      if (res?.code === 0) {
        app.value = res.data;
      } else {
        MessagePlugin.error('加载应用失败');
        router.back();
      }
    } catch (error) {
      console.error('Failed to load app:', error);
      MessagePlugin.error('加载应用失败');
      router.back();
    } finally {
      loading.value = false;
    }
  };

  // 保存工作流
  const saveWorkflow = async () => {
    if (!app.value) return;

    try {
      saving.value = true;
      const res = await editApplication(app.value);
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
    if (!app.value) return;

    try {
      LoadingPlugin(true);
      const res = await executeWorkflow(app.value.appId);
      if (res?.code === 0) {
        MessagePlugin.success('测试运行成功');
        // 跳转到执行结果页面
        router.push({
          path: '/llm/workflow-execution',
          query: {
            appId: app.value.appId,
            executionId: res.data?.executionId,
          },
        });
      }
    } catch (error) {
      console.error('Failed to test workflow:', error);
      MessagePlugin.error('测试运行失败');
    } finally {
      LoadingPlugin(false);
    }
  };

  // 返回上一页
  const goBack = () => {
    // 使用 router.back() 返回到来源路由
    router.back();
  };

  // 更新工作流配置
  const updateWorkflowConfig = (config: any) => {
    if (app.value) {
      app.value.workflowConfig = config;
    }
  };

  // 导出工作流
  const exportWorkflow = () => {
    if (!app.value) return;

    const dataStr = JSON.stringify(app.value.workflowConfig, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${app.value.appName}_workflow.json`;
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
          if (app.value) {
            app.value.workflowConfig = config;
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
    if (app.value) {
      router.push({
        path: '/llm/workflow-execution',
        query: { appId: app.value.appId },
      });
    }
  };

  onMounted(() => {
    loadApp();
  });
</script>

<template>
  <div class="workflow-designer-page h-full flex flex-col">
    <!-- 顶部工具栏 -->
    <div class="bg-white border-b border-gray-200 px-6 py-2">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <t-button variant="text" @click="goBack" size="small">
            <template #icon>
              <t-icon name="chevron-left" />
            </template>
            返回
          </t-button>

          <div class="h-5 w-px bg-gray-300"></div>

          <div>
            <h1 class="text-base font-medium">{{ app?.appName || '工作流设计器' }}</h1>
            <p class="text-xs text-gray-500">{{ app?.description || '设计和配置您的AI工作流' }}</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <t-button theme="default" :loading="saving" @click="saveWorkflow" size="small">
            <template #icon>
              <t-icon name="save" />
            </template>
            保存
          </t-button>

          <t-button
            theme="primary"
            @click="testWorkflow"
            :disabled="!app || app.workflowConfig.nodes.length === 0"
            size="small"
          >
            <template #icon>
              <t-icon name="play-circle" />
            </template>
            测试运行
          </t-button>

          <t-dropdown>
            <t-button theme="default" size="small">
              <template #icon>
                <t-icon name="more" />
              </template>
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
              <t-dropdown-item divider />
              <t-dropdown-item @click="viewExecutionHistory">
                <t-icon name="time" class="mr-2" />
                执行历史
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex-1 flex overflow-hidden">
      <t-loading :loading="loading" class="flex-1">
        <WorkflowDesigner
          v-if="app"
          v-model="app.workflowConfig"
          @update:model-value="updateWorkflowConfig"
          @node-selected="selectedNode = $event"
        />
      </t-loading>
    </div>

    <!-- 状态栏 -->
    <div class="bg-gray-50 border-t border-gray-200 px-6 py-2">
      <div class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-4">
          <span>节点数量: {{ app?.workflowConfig.nodes.length || 0 }}</span>
          <span>连线数量: {{ app?.workflowConfig.edges.length || 0 }}</span>
          <span>变量数量: {{ app?.workflowConfig.variables.length || 0 }}</span>
        </div>

        <div class="flex items-center space-x-4">
          <span v-if="saving" class="text-blue-600">
            <t-icon name="loading" class="animate-spin mr-1" />
            保存中...
          </span>
          <span v-else class="text-green-600">
            <t-icon name="check-circle" class="mr-1" />
            已保存
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .workflow-designer-page {
    height: 100vh;
    background: #f5f5f5;
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
</style>
