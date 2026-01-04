<script lang="ts" setup>
  import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
  import { getWorkflowDetail, editWorkflow, publishWorkflow } from '@/api/llm/workflow';
  import { Workflow, WorkflowStatus, WorkflowConfig } from '@/models/workflow';
  import WorkflowDesigner from './components/workflow-designer.vue';

  const route = useRoute();
  const router = useRouter();

  const workflowId = computed(() => route.query.workflowId as string);
  const workflow = ref<Workflow | null>(null);
  const loading = ref(true);
  const saving = ref(false);
  const publishing = ref(false);

  // 自动保存相关
  const autoSaveInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const lastSaveTime = ref<Date | null>(null);
  const hasUnsavedChanges = ref(false);
  const AUTO_SAVE_DELAY = 30000; // 30秒自动保存

  // 格式化最后保存时间
  const lastSaveTimeText = computed(() => {
    if (!lastSaveTime.value) return '';
    return lastSaveTime.value.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  });

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
        lastSaveTime.value = new Date();
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
  const saveWorkflow = async (showMessage = true) => {
    if (!workflow.value || saving.value) return;

    try {
      saving.value = true;
      const res = await editWorkflow(workflow.value);
      if (res?.code === 0) {
        lastSaveTime.value = new Date();
        hasUnsavedChanges.value = false;
        if (showMessage) {
          MessagePlugin.success('保存成功');
        }
      } else if (showMessage) {
        MessagePlugin.error('保存失败');
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      if (showMessage) {
        MessagePlugin.error('保存失败');
      }
    } finally {
      saving.value = false;
    }
  };

  // 发布工作流
  const handlePublishWorkflow = async () => {
    if (!workflow.value) return;

    // 先保存
    await saveWorkflow(false);

    // 验证工作流配置
    const { config } = workflow.value;
    if (!config?.nodes || config.nodes.length === 0) {
      MessagePlugin.warning('请先添加工作流节点');
      return;
    }

    const hasStartNode = config.nodes.some((node) => node.type === 'start');
    const hasEndNode = config.nodes.some((node) => node.type === 'end');

    if (!hasStartNode || !hasEndNode) {
      MessagePlugin.warning('工作流必须包含开始节点和结束节点');
      return;
    }

    try {
      publishing.value = true;
      const res = await publishWorkflow(workflow.value.workflowId);
      if (res?.code === 0) {
        workflow.value.status = WorkflowStatus.PUBLISHED;
        MessagePlugin.success('发布成功');
      } else {
        MessagePlugin.error(res?.msg || '发布失败');
      }
    } catch (error: any) {
      console.error('Failed to publish workflow:', error);
      MessagePlugin.error(error?.response?.data?.message || '发布失败');
    } finally {
      publishing.value = false;
    }
  };

  // 返回上一页
  const goBack = () => {
    if (hasUnsavedChanges.value) {
      DialogPlugin.confirm({
        header: '未保存的更改',
        body: '您有未保存的更改，是否保存后再离开？',
        confirmBtn: '保存并离开',
        cancelBtn: '不保存',
        onConfirm: async () => {
          await saveWorkflow();
          router.back();
        },
        onCancel: () => {
          router.back();
        },
      });
    } else {
      router.back();
    }
  };

  // 更新工作流配置
  const updateWorkflowConfig = (config: WorkflowConfig) => {
    if (workflow.value) {
      workflow.value.config = config;
      hasUnsavedChanges.value = true;
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
          
          // 验证导入的配置格式
          if (!config.nodes || !Array.isArray(config.nodes)) {
            throw new Error('无效的工作流配置格式');
          }
          
          if (workflow.value) {
            workflow.value.config = config;
            hasUnsavedChanges.value = true;
            MessagePlugin.success('工作流导入成功');
          }
        } catch (error: any) {
          MessagePlugin.error(error.message || '工作流文件格式错误');
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

  // 启动自动保存
  const startAutoSave = () => {
    if (autoSaveInterval.value) return;
    
    autoSaveInterval.value = setInterval(() => {
      if (hasUnsavedChanges.value && !saving.value) {
        saveWorkflow(false);
      }
    }, AUTO_SAVE_DELAY);
  };

  // 停止自动保存
  const stopAutoSave = () => {
    if (autoSaveInterval.value) {
      clearInterval(autoSaveInterval.value);
      autoSaveInterval.value = null;
    }
  };

  // 监听配置变化
  watch(
    () => workflow.value?.config,
    () => {
      hasUnsavedChanges.value = true;
    },
    { deep: true },
  );

  onMounted(() => {
    loadWorkflow();
    startAutoSave();
  });

  onUnmounted(() => {
    stopAutoSave();
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
            <div
              class="w-2 h-2 rounded-full"
              :class="workflow?.status === 1 ? 'bg-green-500' : 'bg-yellow-500'"
            ></div>
            <span class="text-sm font-medium text-gray-900">{{ workflow?.workflowName || '加载中...' }}</span>
            <t-tag v-if="workflow?.status === 1" theme="success" size="small">已发布</t-tag>
            <t-tag v-else theme="warning" size="small">草稿</t-tag>
          </div>

          <span v-if="lastSaveTime" class="text-xs text-gray-500">
            {{ hasUnsavedChanges ? '有未保存的更改' : `已自动保存 ${lastSaveTimeText}` }}
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <t-space size="small">
            <t-button variant="text" size="small" class="text-gray-600" @click="viewExecutionHistory">
              <t-icon name="history" />
            </t-button>
            <t-button theme="default" size="small" @click="saveWorkflow(true)" :loading="saving">
              保存
            </t-button>
            <t-button
              theme="primary"
              size="small"
              @click="handlePublishWorkflow"
              :loading="publishing"
              :disabled="workflow?.status === 1"
            >
              {{ workflow?.status === 1 ? '已发布' : '发布' }}
            </t-button>
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
