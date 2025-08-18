<script lang="ts" setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { getWorkflowExecutions, stopWorkflowExecution } from '@/api/llm/application';
  import { WorkflowExecution } from '@/models/workflow';
  import { formatDateTime } from '@/utils';

  const { t } = useI18n();
  const route = useRoute();

  const appId = computed(() => route.query.appId as string);
  const executionId = computed(() => route.query.executionId as string);

  const tableLoading = ref(true);
  const executions = ref<WorkflowExecution[]>([]);
  const selectedExecution = ref<WorkflowExecution | null>(null);
  const showLogDrawer = ref(false);

  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showJumper: true,
    pageSizeOptions: [10, 20, 50],
    onChange: (pageInfo: any) => {
      pagination.value.current = pageInfo.current;
      pagination.value.pageSize = pageInfo.pageSize;
      loadExecutions();
    },
  });

  const columns = [
    {
      colKey: 'executionId',
      title: '执行ID',
      width: 200,
      ellipsis: true,
    },
    {
      colKey: 'status',
      title: '状态',
      width: 100,
      align: 'center',
      cell: (h: any, { row }: any) => {
        const statusMap = {
          running: { text: t('views.llm.app.workflow.status.running'), theme: 'warning' },
          completed: { text: t('views.llm.app.workflow.status.completed'), theme: 'success' },
          failed: { text: t('views.llm.app.workflow.status.failed'), theme: 'danger' },
          cancelled: { text: t('views.llm.app.workflow.status.cancelled'), theme: 'default' },
        };
        const status = statusMap[row.status] || statusMap.running;
        return h('t-tag', { theme: status.theme, size: 'small' }, status.text);
      },
    },
    {
      colKey: 'startTime',
      title: '开始时间',
      width: 150,
      cell: (h: any, { row }: any) => {
        return h('span', formatDateTime(row.startTime));
      },
    },
    {
      colKey: 'endTime',
      title: '结束时间',
      width: 150,
      cell: (h: any, { row }: any) => {
        return h('span', row.endTime ? formatDateTime(row.endTime) : '-');
      },
    },
    {
      colKey: 'duration',
      title: '执行时长',
      width: 100,
      cell: (h: any, { row }: any) => {
        if (!row.endTime) return h('span', '-');
        const duration = new Date(row.endTime).getTime() - new Date(row.startTime).getTime();
        const seconds = Math.floor(duration / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
          return h('span', `${hours}h ${minutes % 60}m ${seconds % 60}s`);
        } else if (minutes > 0) {
          return h('span', `${minutes}m ${seconds % 60}s`);
        } else {
          return h('span', `${seconds}s`);
        }
      },
    },
    {
      colKey: 'operation',
      title: '操作',
      align: 'center',
      fixed: 'right',
      width: 200,
    },
  ];

  // 加载执行历史
  const loadExecutions = async () => {
    if (!appId.value) return;

    try {
      tableLoading.value = true;
      const res = await getWorkflowExecutions(appId.value, pagination.value.current, pagination.value.pageSize);

      if (res?.code === 0) {
        executions.value = res.data?.list || [];
        pagination.value.total = res.data?.count || 0;

        // 如果有指定的执行ID，自动选中
        if (executionId.value) {
          const execution = executions.value.find((e) => e.executionId === executionId.value);
          if (execution) {
            selectedExecution.value = execution;
            showLogDrawer.value = true;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      tableLoading.value = false;
    }
  };

  // 查看执行日志
  const viewLogs = (execution: WorkflowExecution) => {
    selectedExecution.value = execution;
    showLogDrawer.value = true;
  };

  // 停止执行
  const stopExecution = async (execution: WorkflowExecution) => {
    try {
      const res = await stopWorkflowExecution(execution.executionId);
      if (res?.code === 0) {
        MessagePlugin.success('工作流已停止');
        loadExecutions();
      }
    } catch (error) {
      console.error('Failed to stop execution:', error);
    }
  };

  // 获取日志级别样式
  const getLogLevelClass = (level: string) => {
    const levelMap = {
      info: 'text-blue-600',
      warn: 'text-yellow-600',
      error: 'text-red-600',
    };
    return levelMap[level] || 'text-gray-600';
  };

  // 获取日志级别图标
  const getLogLevelIcon = (level: string) => {
    const iconMap = {
      info: 'info-circle',
      warn: 'error-triangle',
      error: 'close-circle',
    };
    return iconMap[level] || 'info-circle';
  };

  onMounted(() => {
    loadExecutions();
  });
</script>

<template>
  <div class="p-4">
    <t-card :bordered="false">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ $t('views.llm.app.workflow.execution') }}</h3>
          <t-button @click="loadExecutions">
            <template #icon>
              <t-icon name="refresh" />
            </template>
            刷新
          </t-button>
        </div>
      </template>

      <t-table
        bordered
        hover
        :columns="columns"
        :data="executions"
        :loading="tableLoading"
        :pagination="pagination"
        row-key="executionId"
      >
        <template #operation="{ row }">
          <t-space size="small">
            <t-button size="small" theme="primary" @click="viewLogs(row)">
              <template #icon>
                <t-icon name="view-list" />
              </template>
              查看日志
            </t-button>

            <t-button v-if="row.status === 'running'" size="small" theme="danger" @click="stopExecution(row)">
              <template #icon>
                <t-icon name="stop-circle" />
              </template>
              停止执行
            </t-button>

            <t-button v-if="row.result" size="small" theme="default" @click="viewResult(row)">
              <template #icon>
                <t-icon name="file-text" />
              </template>
              查看结果
            </t-button>
          </t-space>
        </template>
      </t-table>
    </t-card>

    <!-- 执行日志抽屉 -->
    <t-drawer v-model:visible="showLogDrawer" size="60%" :footer="false" placement="right">
      <template #header>
        <div v-if="selectedExecution">
          <h4 class="text-lg font-semibold">执行日志</h4>
          <div class="text-sm text-gray-500 mt-1">执行ID: {{ selectedExecution.executionId }}</div>
        </div>
      </template>

      <div v-if="selectedExecution" class="h-full flex flex-col">
        <!-- 执行概要 -->
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <span class="text-sm text-gray-600">状态:</span>
              <t-tag
                :theme="
                  selectedExecution.status === 'completed'
                    ? 'success'
                    : selectedExecution.status === 'failed'
                      ? 'danger'
                      : selectedExecution.status === 'running'
                        ? 'warning'
                        : 'default'
                "
                size="small"
                class="ml-2"
              >
                {{ $t(`views.llm.app.workflow.status.${selectedExecution.status}`) }}
              </t-tag>
            </div>
            <div>
              <span class="text-sm text-gray-600">开始时间:</span>
              <span class="ml-2">{{ formatDateTime(selectedExecution.startTime) }}</span>
            </div>
            <div v-if="selectedExecution.endTime">
              <span class="text-sm text-gray-600">结束时间:</span>
              <span class="ml-2">{{ formatDateTime(selectedExecution.endTime) }}</span>
            </div>
            <div v-if="selectedExecution.error">
              <span class="text-sm text-gray-600">错误信息:</span>
              <span class="ml-2 text-red-600">{{ selectedExecution.error }}</span>
            </div>
          </div>
        </div>

        <!-- 日志列表 -->
        <div class="flex-1 overflow-hidden">
          <h5 class="font-medium mb-3">{{ $t('views.llm.app.workflow.logs') }}</h5>
          <div class="h-full overflow-y-auto bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
            <div v-for="(log, index) in selectedExecution.logs" :key="index" class="mb-2 flex items-start space-x-2">
              <span class="text-gray-500 text-xs whitespace-nowrap">
                {{ formatDateTime(log.timestamp) }}
              </span>
              <t-icon :name="getLogLevelIcon(log.level)" :class="getLogLevelClass(log.level)" size="14" />
              <span class="text-blue-400">{{ log.nodeName }}:</span>
              <span class="flex-1">{{ log.message }}</span>
            </div>

            <div v-if="selectedExecution.logs.length === 0" class="text-center text-gray-500 py-8">暂无日志记录</div>
          </div>
        </div>
      </div>
    </t-drawer>

    <!-- 执行结果对话框 -->
    <t-dialog v-model:visible="showResultDialog" header="执行结果" width="800px" :footer="false">
      <div v-if="selectedExecution?.result" class="max-h-96 overflow-y-auto">
        <pre class="bg-gray-100 p-4 rounded-lg text-sm">{{ JSON.stringify(selectedExecution.result, null, 2) }}</pre>
      </div>
    </t-dialog>
  </div>
</template>

<script>
  const showResultDialog = ref(false);

  const viewResult = (execution) => {
    selectedExecution.value = execution;
    showResultDialog.value = true;
  };
</script>

<style scoped>
  .t-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* 日志终端样式 */
  .log-terminal {
    background: #1a1a1a;
    color: #00ff00;
    font-family: 'Courier New', monospace;
  }

  .log-terminal::-webkit-scrollbar {
    width: 8px;
  }

  .log-terminal::-webkit-scrollbar-track {
    background: #2a2a2a;
  }

  .log-terminal::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 4px;
  }

  .log-terminal::-webkit-scrollbar-thumb:hover {
    background: #777;
  }
</style>
