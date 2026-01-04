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
    unpublishWorkflow,
  } from '@/api/llm/workflow';
  import { Workflow, WorkflowStatus, WorkflowStatusText, WorkflowConfig } from '@/models/workflow';

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
    status: undefined as WorkflowStatus | undefined,
  });

  // 新增工作流抽屉
  const showAddDrawer = ref(false);
  const drawerTitle = ref('新增工作流');
  const formRef = ref<any>(null);
  const drawerFormRef = ref<any>(null);

  const addForm = reactive({
    workflowName: '',
    description: '',
  });

  const drawerRules = {
    workflowName: [{ required: true, message: '请输入工作流名称', trigger: 'blur' }],
  };

  // 复制工作流对话框
  const showCopyModal = ref(false);
  const copyData = ref({
    workflowId: '',
    workflowName: '',
    newName: '',
  });

  // 状态选项
  const statusOptions = [
    { value: WorkflowStatus.DRAFT, label: WorkflowStatusText[WorkflowStatus.DRAFT] },
    { value: WorkflowStatus.PUBLISHED, label: WorkflowStatusText[WorkflowStatus.PUBLISHED] },
    { value: WorkflowStatus.ARCHIVED, label: WorkflowStatusText[WorkflowStatus.ARCHIVED] },
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
        MessagePlugin.error(res?.message || '获取工作流列表失败');
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
    searchForm.status = undefined;
    handleSearch();
  };

  // 分页变化
  const onPaginationChange = (pageInfo: { current: number; pageSize: number }) => {
    pagination.current = pageInfo.current;
    pagination.pageSize = pageInfo.pageSize;
    fetchWorkflowList();
  };

  // 新增工作流
  const handleAddWorkflow = async ({ validateResult, firstError, e }: any) => {
    e.preventDefault();

    if (validateResult === true) {
      try {
        const newWorkflow: Omit<Workflow, 'workflowId'> = {
          workflowName: addForm.workflowName,
          description: addForm.description,
          version: '1.0.0',
          status: WorkflowStatus.DRAFT,
          config: {
            nodes: [],
            edges: [],
            variables: [],
          } as WorkflowConfig,
        };

        const res = await addWorkflow(newWorkflow);
        if (res?.code === 0) {
          MessagePlugin.success('创建工作流成功');
          showAddDrawer.value = false;
          fetchWorkflowList();

          // 重置表单
          addForm.workflowName = '';
          addForm.description = '';
        } else {
          MessagePlugin.error(res?.message || '创建工作流失败');
        }
      } catch (error) {
        console.error('Failed to add workflow:', error);
        MessagePlugin.error('创建工作流失败');
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.error(firstError || '表单验证失败');
    }
  };

  // 删除工作流
  const handleDeleteWorkflow = (workflow: Workflow) => {
    // 已发布的工作流不能直接删除
    if (workflow.status === WorkflowStatus.PUBLISHED) {
      MessagePlugin.warning('已发布的工作流需要先取消发布才能删除');
      return;
    }

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
            MessagePlugin.error(res?.message || '删除工作流失败');
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
    copyData.value.workflowId = workflow.workflowId;
    copyData.value.workflowName = workflow.workflowName;
    copyData.value.newName = `${workflow.workflowName}_副本`;
    showCopyModal.value = true;
  };

  // 执行复制
  const onCopy = async () => {
    if (!copyData.value.newName.trim()) {
      MessagePlugin.warning('请输入新工作流名称');
      return;
    }

    try {
      const res = await copyWorkflow(copyData.value.workflowId, copyData.value.newName);
      if (res?.code === 0) {
        showCopyModal.value = false;
        MessagePlugin.success('复制工作流成功');
        fetchWorkflowList();
      } else {
        MessagePlugin.error(res?.message || '复制工作流失败');
      }
    } catch (error) {
      console.error('Failed to copy workflow:', error);
      MessagePlugin.error('复制工作流失败');
    }
  };

  // 发布工作流
  const handlePublishWorkflow = async (workflow: Workflow) => {
    // 验证工作流配置
    if (!workflow.config?.nodes || workflow.config.nodes.length === 0) {
      MessagePlugin.warning('工作流没有节点配置，无法发布');
      return;
    }

    const hasStartNode = workflow.config.nodes.some((node) => node.type === 'start');
    const hasEndNode = workflow.config.nodes.some((node) => node.type === 'end');

    if (!hasStartNode || !hasEndNode) {
      MessagePlugin.warning('工作流必须包含开始节点和结束节点');
      return;
    }

    try {
      const res = await publishWorkflow(workflow.workflowId);
      if (res?.code === 0) {
        MessagePlugin.success('发布工作流成功');
        fetchWorkflowList();
      } else {
        MessagePlugin.error(res?.message || '发布工作流失败');
      }
    } catch (error: any) {
      console.error('Failed to publish workflow:', error);
      MessagePlugin.error(error?.response?.data?.message || '发布工作流失败');
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
        MessagePlugin.error(res?.message || '取消发布失败');
      }
    } catch (error) {
      console.error('Failed to unpublish workflow:', error);
      MessagePlugin.error('取消发布失败');
    }
  };

  // 编辑工作流
  const handleEditWorkflow = (workflow: Workflow) => {
    router.push({
      path: '/canvas/llm-workflow/design',
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
  const getStatusTagType = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.DRAFT:
        return 'warning';
      case WorkflowStatus.PUBLISHED:
        return 'success';
      case WorkflowStatus.ARCHIVED:
        return 'default';
      default:
        return 'default';
    }
  };

  // 获取状态标签文本
  const getStatusText = (status: WorkflowStatus) => {
    return WorkflowStatusText[status] || '未知';
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
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
    return workflow.config && (workflow.config.nodes?.length > 0 || workflow.config.edges?.length > 0);
  };

  onMounted(() => {
    fetchWorkflowList();
  });
</script>

<template>
  <!-- 查询表单 -->
  <t-card :bordered="false">
    <div class="flex justify-between items-center">
      <t-form
        ref="formRef"
        layout="inline"
        :label-width="0"
        :data="searchForm"
        @reset="resetSearch"
        @submit="handleSearch"
      >
        <t-form-item name="workflowName">
          <t-input v-model:value="searchForm.workflowName" placeholder="请输入工作流名称" />
        </t-form-item>
        <t-form-item name="status">
          <t-select v-model:value="searchForm.status" placeholder="请选择状态" clearable>
            <t-option v-for="option in statusOptions" :key="option.value" :value="option.value" :label="option.label" />
          </t-select>
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">搜索</t-button>
            <t-button type="reset">重置</t-button>
          </t-space>
        </t-form-item>
      </t-form>

      <t-button theme="primary" @click="showAddDrawer = true">新增工作流</t-button>
    </div>
  </t-card>

  <!-- 表格 -->
  <t-card :bordered="false" class="my-4!">
    <t-loading :loading="loading" style="width: 100%">
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
        hover
        row-key="workflowId"
        :bordered="true"
      >
        <template #workflowName="{ row }">
          <div class="flex items-center cursor-pointer" @click="handleEditWorkflow(row)">
            <t-icon name="flow" class="mr-2" />
            <span class="font-medium text-blue-600 hover:text-blue-800">{{ row.workflowName }}</span>
          </div>
        </template>
        <template #nodeCount="{ row }">
          <t-tag theme="primary" variant="light" v-if="hasNodes(row)">
            {{ row.config?.nodes?.length || 0 }} 个节点
          </t-tag>
          <t-tag theme="default" variant="light" v-else>未配置</t-tag>
        </template>
        <template #status="{ row }">
          <t-tag :theme="getStatusTagType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </t-tag>
        </template>
        <template #updatedAt="{ row }">
          <span class="text-sm text-gray-600">{{ formatDate(row.updatedAt) }}</span>
        </template>
        <template #operation="{ row }">
          <t-dropdown>
            <t-button size="small" variant="outline">
              <template #icon>
                <t-icon name="more" />
              </template>
              操作
            </t-button>
            <t-dropdown-menu>
              <t-dropdown-item @click="handleEditWorkflow(row)">
                <t-icon name="edit-1" class="mr-1" />
                编辑
              </t-dropdown-item>
              <t-dropdown-item @click="handleViewExecutions(row)">
                <t-icon name="time" class="mr-1" />
                执行历史
              </t-dropdown-item>
              <t-dropdown-item v-if="row.status === 0" @click="handlePublishWorkflow(row)">
                <t-icon name="upload" class="mr-1" />
                发布
              </t-dropdown-item>
              <t-dropdown-item v-if="row.status === 1" @click="handleUnpublishWorkflow(row)">
                <t-icon name="download" class="mr-1" />
                取消发布
              </t-dropdown-item>
              <t-dropdown-item @click="handleCopyWorkflow(row)">
                <t-icon name="file-copy" class="mr-1" />
                复制
              </t-dropdown-item>
              <t-dropdown-item @click="handleDeleteWorkflow(row)" theme="danger">
                <t-icon name="delete" class="mr-1" />
                删除
              </t-dropdown-item>
            </t-dropdown-menu>
          </t-dropdown>
        </template>
      </t-table>
    </t-loading>
  </t-card>

  <!-- 新增/编辑工作流抽屉 -->
  <t-drawer v-model:visible="showAddDrawer" size="500px" :footer="false">
    <template #header>{{ drawerTitle }}</template>
    <t-form ref="drawerFormRef" :label-width="120" :data="addForm" :rules="drawerRules" @submit="handleAddWorkflow">
      <t-form-item label="工作流名称" name="workflowName">
        <t-input v-model:value="addForm.workflowName" placeholder="请输入工作流名称" />
      </t-form-item>

      <t-form-item label="工作流描述" name="description">
        <t-textarea
          v-model:value="addForm.description"
          placeholder="请输入工作流描述"
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </t-form-item>

      <t-form-item>
        <t-space>
          <t-button theme="primary" type="submit">确定</t-button>
          <t-button @click="showAddDrawer = false">取消</t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-drawer>

  <!-- 复制工作流对话框 -->
  <t-dialog
    v-model:visible="showCopyModal"
    :header="`复制工作流: ${copyData.workflowName}`"
    :footer="false"
    width="400px"
  >
    <div class="space-y-4">
      <div class="text-sm text-gray-600">请输入新工作流名称</div>
      <t-input v-model:value="copyData.newName" placeholder="请输入新工作流名称" />
      <div class="flex justify-end space-x-2">
        <t-button @click="showCopyModal = false">取消</t-button>
        <t-button theme="primary" @click="onCopy">确定</t-button>
      </div>
    </div>
  </t-dialog>
</template>

<style scoped>
  .t-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
</style>
