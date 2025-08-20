<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { MessagePlugin, DialogPlugin } from 'tdesign-vue-next';
import { 
  getWorkflowList, 
  addWorkflow, 
  deleteWorkflow, 
  copyWorkflow,
  publishWorkflow,
  unpublishWorkflow
} from '@/api/llm/workflow';
import { Workflow } from '@/models/workflow';

const router = useRouter();

// 表格数据
const tableData = ref<Workflow[]>([]);
const total = ref(0);
const loading = ref(false);

// 分页参数
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
});

// 搜索条件
const searchForm = reactive({
  workflowName: '',
  status: null,
});

// 新增工作流对话框
const showAddDialog = ref(false);
const addForm = reactive({
  workflowName: '',
  description: '',
});

// 状态选项
const statusOptions = [
  { value: 0, label: '草稿' },
  { value: 1, label: '已发布' },
  { value: 2, label: '已归档' },
];

// 获取工作流列表
const fetchWorkflowList = async () => {
  try {
    loading.value = true;
    const params = {
      ...searchForm,
      page: pagination.current,
      pageSize: pagination.pageSize,
    };
    
    const res = await getWorkflowList(params);
    if (res?.code === 0) {
      tableData.value = res.data.list;
      total.value = res.data.count;
      pagination.total = res.data.count;
    } else {
      MessagePlugin.error('获取工作流列表失败');
    }
  } catch (error) {
    console.error('Failed to fetch workflows:', error);
    MessagePlugin.error('获取工作流列表失败');
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.current = 1;
  fetchWorkflowList();
};

// 重置搜索
const resetSearch = () => {
  searchForm.workflowName = '';
  searchForm.status = null;
  handleSearch();
};

// 分页变化
const onPaginationChange = (pageInfo: { current: number; pageSize: number }) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchWorkflowList();
};

// 新增工作流
const handleAddWorkflow = async () => {
  if (!addForm.workflowName) {
    MessagePlugin.warning('请输入工作流名称');
    return;
  }

  try {
    const newWorkflow: Workflow = {
      workflowName: addForm.workflowName,
      description: addForm.description,
      version: '1.0.0',
      status: 0,
      config: {
        nodes: [],
        edges: [],
        variables: []
      }
    } as Workflow;

    const res = await addWorkflow(newWorkflow);
    if (res?.code === 0) {
      MessagePlugin.success('创建工作流成功');
      showAddDialog.value = false;
      fetchWorkflowList();
      
      // 重置表单
      addForm.workflowName = '';
      addForm.description = '';
    } else {
      MessagePlugin.error('创建工作流失败');
    }
  } catch (error) {
    console.error('Failed to add workflow:', error);
    MessagePlugin.error('创建工作流失败');
  }
};

// 删除工作流
const handleDeleteWorkflow = (workflow: Workflow) => {
  DialogPlugin.confirm({
    header: '确认删除',
    body: `确定要删除工作流"${workflow.workflowName}"吗？此操作不可恢复。`,
    confirmBtn: {
      theme: 'danger',
      content: '删除',
    },
    onConfirm: async () => {
      try {
        const res = await deleteWorkflow(workflow.workflowId);
        if (res?.code === 0) {
          MessagePlugin.success('删除工作流成功');
          fetchWorkflowList();
        } else {
          MessagePlugin.error('删除工作流失败');
        }
      } catch (error) {
        console.error('Failed to delete workflow:', error);
        MessagePlugin.error('删除工作流失败');
      }
    },
  });
};

// 复制工作流
const handleCopyWorkflow = (workflow: Workflow) => {
  DialogPlugin.confirm({
    header: '复制工作流',
    body: `请输入新工作流名称`,
    confirmBtn: {
      theme: 'primary',
      content: '确认',
    },
    onConfirm: async (context) => {
      const newName = context.inputValue;
      if (!newName) {
        MessagePlugin.warning('请输入新工作流名称');
        return;
      }
      
      try {
        const res = await copyWorkflow(workflow.workflowId, newName);
        if (res?.code === 0) {
          MessagePlugin.success('复制工作流成功');
          fetchWorkflowList();
        } else {
          MessagePlugin.error('复制工作流失败');
        }
      } catch (error) {
        console.error('Failed to copy workflow:', error);
        MessagePlugin.error('复制工作流失败');
      }
    },
    inputProps: {
      placeholder: '请输入新工作流名称',
      defaultValue: `${workflow.workflowName} 副本`,
    },
  });
};

// 发布工作流
const handlePublishWorkflow = async (workflow: Workflow) => {
  try {
    const res = await publishWorkflow(workflow.workflowId);
    if (res?.code === 0) {
      MessagePlugin.success('发布工作流成功');
      fetchWorkflowList();
    } else {
      MessagePlugin.error('发布工作流失败');
    }
  } catch (error) {
    console.error('Failed to publish workflow:', error);
    MessagePlugin.error('发布工作流失败');
  }
};

// 取消发布工作流
const handleUnpublishWorkflow = async (workflow: Workflow) => {
  try {
    const res = await unpublishWorkflow(workflow.workflowId);
    if (res?.code === 0) {
      MessagePlugin.success('取消发布成功');
      fetchWorkflowList();
    } else {
      MessagePlugin.error('取消发布失败');
    }
  } catch (error) {
    console.error('Failed to unpublish workflow:', error);
    MessagePlugin.error('取消发布失败');
  }
};

// 编辑工作流
const handleEditWorkflow = (workflow: Workflow) => {
  router.push({
    path: '/llm/workflow-designer',
    query: { workflowId: workflow.workflowId },
  });
};

// 查看执行历史
const handleViewExecutions = (workflow: Workflow) => {
  router.push({
    path: '/llm/workflow-execution',
    query: { workflowId: workflow.workflowId },
  });
};

// 获取状态标签类型
const getStatusTagType = (status: number) => {
  switch (status) {
    case 0: return 'warning';
    case 1: return 'success';
    case 2: return 'default';
    default: return 'default';
  }
};

// 获取状态标签文本
const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '草稿';
    case 1: return '已发布';
    case 2: return '已归档';
    default: return '未知';
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 检查工作流是否有节点配置
const hasNodes = (workflow: Workflow) => {
  return workflow.config && 
    (workflow.config.nodes?.length > 0 || 
     workflow.config.edges?.length > 0);
};

onMounted(() => {
  fetchWorkflowList();
});
</script>

<template>
  <div class="workflow-page p-6">
    <t-card title="工作流管理" :bordered="false">
      <!-- 搜索区域 -->
      <t-space direction="vertical" style="width: 100%" size="large">
        <t-form :data="searchForm" layout="inline" @submit="handleSearch">
          <t-form-item label="工作流名称">
            <t-input v-model="searchForm.workflowName" placeholder="请输入工作流名称" />
          </t-form-item>
          <t-form-item label="状态">
            <t-select v-model="searchForm.status" placeholder="请选择状态" clearable>
              <t-option v-for="option in statusOptions" :key="option.value" :value="option.value" :label="option.label" />
            </t-select>
          </t-form-item>
          <t-form-item>
            <t-space>
              <t-button theme="primary" type="submit">
                <template #icon>
                  <t-icon name="search" />
                </template>
                搜索
              </t-button>
              <t-button theme="default" @click="resetSearch">
                <template #icon>
                  <t-icon name="refresh" />
                </template>
                重置
              </t-button>
            </t-space>
          </t-form-item>
        </t-form>

        <!-- 操作按钮 -->
        <t-space style="width: 100%" align="center" justify="space-between">
          <t-button theme="primary" @click="showAddDialog = true">
            <template #icon>
              <t-icon name="add" />
            </template>
            新增工作流
          </t-button>
        </t-space>

        <!-- 表格 -->
        <t-table
          :data="tableData"
          :columns="[
            { colKey: 'workflowName', title: '工作流名称', width: '200' },
            { colKey: 'description', title: '描述', width: '250' },
            { colKey: 'nodeCount', title: '节点数量', width: '120' },
            { colKey: 'status', title: '状态', width: '100' },
            { colKey: 'updatedAt', title: '更新时间', width: '180' },
            { colKey: 'operation', title: '操作', fixed: 'right', width: '240' },
          ]"
          :loading="loading"
          :pagination="{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showJumper: true,
            showPageSize: true,
            pageSizeOptions: [10, 20, 50],
            onCurrentChange: (current) => onPaginationChange({ current, pageSize: pagination.pageSize }),
            onPageSizeChange: (pageSize) => onPaginationChange({ current: 1, pageSize }),
          }"
          stripe
          hover
          row-key="workflowId"
        >
          <template #workflowName="{ row }">
            <div class="flex items-center">
              <t-icon name="flow" class="mr-2" />
              <span>{{ row.workflowName }}</span>
            </div>
          </template>
          <template #nodeCount="{ row }">
            <t-tag theme="primary" variant="light" v-if="hasNodes(row)">
              {{ row.config?.nodes?.length || 0 }} 个节点
            </t-tag>
            <t-tag theme="default" variant="light" v-else>
              未配置
            </t-tag>
          </template>
          <template #status="{ row }">
            <t-tag :theme="getStatusTagType(row.status)" size="medium">
              {{ getStatusText(row.status) }}
            </t-tag>
          </template>
          <template #updatedAt="{ row }">
            {{ formatDate(row.updatedAt) }}
          </template>
          <template #operation="{ row }">
            <t-space>
              <t-button variant="text" theme="primary" @click="handleEditWorkflow(row)">
                <template #icon>
                  <t-icon name="edit" />
                </template>
                编辑
              </t-button>
              <t-button variant="text" theme="primary" @click="handleViewExecutions(row)">
                <template #icon>
                  <t-icon name="time" />
                </template>
                执行历史
              </t-button>
              <t-dropdown>
                <t-button variant="text" theme="primary">
                  更多
                  <template #suffix>
                    <t-icon name="chevron-down" />
                  </template>
                </t-button>
                <template #dropdown>
                  <t-dropdown-menu>
                    <t-dropdown-item v-if="row.status === 0" @click="handlePublishWorkflow(row)">
                      <t-icon name="check-circle" class="mr-2" />
                      发布
                    </t-dropdown-item>
                    <t-dropdown-item v-if="row.status === 1" @click="handleUnpublishWorkflow(row)">
                      <t-icon name="close-circle" class="mr-2" />
                      取消发布
                    </t-dropdown-item>
                    <t-dropdown-item @click="handleCopyWorkflow(row)">
                      <t-icon name="copy" class="mr-2" />
                      复制
                    </t-dropdown-item>
                    <t-dropdown-item @click="handleDeleteWorkflow(row)">
                      <t-icon name="delete" class="mr-2" />
                      删除
                    </t-dropdown-item>
                  </t-dropdown-menu>
                </template>
              </t-dropdown>
            </t-space>
          </template>
        </t-table>
      </t-space>
    </t-card>

    <!-- 新增工作流对话框 -->
    <t-dialog
      v-model:visible="showAddDialog"
      header="新增工作流"
      :confirm-btn="{ content: '确定', theme: 'primary' }"
      :cancel-btn="{ content: '取消' }"
      @confirm="handleAddWorkflow"
    >
      <t-form :data="addForm" label-width="100px">
        <t-form-item label="工作流名称" name="workflowName" help="给您的工作流起一个名称">
          <t-input v-model="addForm.workflowName" placeholder="请输入工作流名称" />
        </t-form-item>
        <t-form-item label="工作流描述" name="description">
          <t-textarea v-model="addForm.description" placeholder="请输入工作流描述" :rows="3" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>

<style scoped>
.workflow-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}
</style>