<script lang="ts" setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useI18n } from 'vue-i18n';
  import { MessagePlugin, DialogPlugin, LoadingPlugin } from 'tdesign-vue-next';
  import {
    getApplicationList,
    addApplication,
    editApplication,
    deleteApplication,
    copyApplication,
    publishApplication,
    unpublishApplication,
  } from '@/api/llm/app';
  import { Application, ApplicationParams } from '@/models/app';
  import selectStatus from '@/components/select/select-status.vue';
  import selectDict from '@/components/select/select-dict.vue';

  const { t } = useI18n();
  const router = useRouter();

  const showDrawer = ref(false);
  const drawerTitle = ref('');
  const formRef = ref<any>(null);
  const drawerFormRef = ref<any>(null);

  // 新增/修改弹窗数据初始化
  const appInitData: Application = {
    appId: '',
    appName: '',
    appType: 'workflow',
    appTypeName: '工作流',
    description: '',
    version: '1.0.0',
    status: 0,
  };

  const drawerFormData = ref({ ...appInitData });

  const drawerRules = {
    appName: [{ required: true, message: t('views.llm.app.placeholder.appName'), trigger: 'blur' }],
    appType: [{ required: true, message: t('views.llm.app.placeholder.appType'), trigger: 'blur' }],
    version: [{ required: true, message: t('views.llm.app.placeholder.version'), trigger: 'blur' }],
  };

  const queryFormData = ref({
    appName: '',
    appType: '',
    status: null,
  });

  // 复制应用对话框
  const showCopyModal = ref(false);
  const copyData = ref({
    appId: '',
    appName: '',
    newName: '',
  });

  const appsData = ref<Application[]>([]);
  const page = ref<number>(1);
  const pageSize = ref<number>(12);
  const itemCount = ref(0);
  const loading = ref(true);

  // 绑定数据
  const query = async (currentPage: number, currentPageSize = 12) => {
    try {
      loading.value = true;
      const requestData: ApplicationParams = {
        ...queryFormData.value,
        page: currentPage,
        pageSize: currentPageSize,
        status: queryFormData.value.status === null ? undefined : queryFormData.value.status,
      };

      const res = await getApplicationList(requestData);
      if (res?.code === 0) {
        appsData.value = res.data?.list || [];
        page.value = currentPage;
        pageSize.value = currentPageSize;
        itemCount.value = res.data?.count || 0;
      }
    } catch (err) {
      appsData.value = [];
    } finally {
      loading.value = false;
    }
  };

  const handleQuery = () => {
    query(page.value, pageSize.value);
  };

  const clearQuery = () => {
    queryFormData.value = {
      appName: '',
      appType: '',
      status: null,
    };
    page.value = 1;
    query(1, pageSize.value);
  };

  const handlePageChange = (pageInfo: { current: number; pageSize: number }) => {
    query(pageInfo.current, pageInfo.pageSize);
  };

  // 新增应用
  const handleAdd = () => {
    drawerTitle.value = t('views.llm.app.add');
    showDrawer.value = true;
    drawerFormData.value = { ...appInitData };
  };

  // 编辑应用
  const handleEdit = (row: Application) => {
    drawerTitle.value = t('views.llm.app.edit');
    showDrawer.value = true;
    drawerFormData.value = { ...appInitData, ...row };
  };

  // 设计工作流
  const handleDesign = (row: Application) => {
    // 如果应用有关联的工作流ID，跳转到工作流设计页面
    if (row.workflowId) {
      router.push({
        path: '/canvas/llm-workflow/design',
        query: { workflowId: row.workflowId },
      });
    } else {
      // 如果没有关联工作流，提示用户先创建工作流
      MessagePlugin.warning('该应用尚未关联工作流，请先创建工作流');
    }
  };

  // 复制应用
  const handleCopy = (row: Application) => {
    copyData.value.appId = row.appId;
    copyData.value.appName = row.appName;
    copyData.value.newName = `${row.appName}_副本`;
    showCopyModal.value = true;
  };

  // 执行复制
  const onCopy = async () => {
    try {
      LoadingPlugin(true);
      const res = await copyApplication(copyData.value.appId, copyData.value.newName);
      if (res?.code === 0) {
        showCopyModal.value = false;
        MessagePlugin.success(t('views.llm.app.copySuccess'));
        query(page.value, pageSize.value);
      }
    } finally {
      LoadingPlugin(false);
    }
  };

  // 删除应用
  const handleDelete = (row: Application) => {
    DialogPlugin.confirm({
      header: t('common.alert'),
      body: t('views.llm.app.confirmDelete', { name: row.appName }),
      confirmBtn: t('common.confirm'),
      cancelBtn: t('common.cancel'),
      onConfirm: async () => {
        try {
          LoadingPlugin(true);
          const res = await deleteApplication(row.appId);
          if (res?.code === 0) {
            MessagePlugin.success(t('common.deleteSuccess'));
            query(page.value, pageSize.value);
          }
        } finally {
          LoadingPlugin(false);
        }
      },
    });
  };

  // 发布/取消发布应用
  const handlePublish = (row: Application, publish: boolean) => {
    const confirmText = publish
      ? t('views.llm.app.confirmPublish', { name: row.appName })
      : t('views.llm.app.confirmUnpublish', { name: row.appName });

    DialogPlugin.confirm({
      header: t('common.alert'),
      body: confirmText,
      confirmBtn: t('common.confirm'),
      cancelBtn: t('common.cancel'),
      onConfirm: async () => {
        try {
          LoadingPlugin(true);
          const res = publish ? await publishApplication(row.appId) : await unpublishApplication(row.appId);

          if (res?.code === 0) {
            const successText = publish ? t('views.llm.app.publishSuccess') : t('views.llm.app.unpublishSuccess');
            MessagePlugin.success(successText);
            query(page.value, pageSize.value);
          }
        } finally {
          LoadingPlugin(false);
        }
      },
    });
  };

  // 提交新增/编辑
  const handleAddandEdit = async ({ validateResult, firstError, e }: any) => {
    e.preventDefault();

    if (validateResult === true) {
      try {
        LoadingPlugin(true);
        const requestData: Application = drawerFormData.value;

        const res = drawerFormData.value.appId ? await editApplication(requestData) : await addApplication(requestData);

        if (res?.code === 0) {
          showDrawer.value = false;
          drawerFormData.value = { ...appInitData };
          query(page.value, pageSize.value);
          MessagePlugin.success(t('common.saveSuccess'));
        }
      } finally {
        LoadingPlugin(false);
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.error(t('common.validationFailed'));
    }
  };

  // 获取状态标签配置
  const getStatusConfig = (status: number) => {
    const statusMap = {
      0: { text: t('views.llm.app.draft'), theme: 'default' },
      1: { text: t('views.llm.app.published'), theme: 'success' },
      2: { text: t('views.llm.app.running'), theme: 'warning' },
      3: { text: t('views.llm.app.stopped'), theme: 'danger' },
    };
    return statusMap[status] || statusMap[0];
  };

  onMounted(() => {
    query(page.value, pageSize.value);
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
        :data="queryFormData"
        @reset="clearQuery"
        @submit="handleQuery"
      >
        <t-form-item name="appName">
          <t-input v-model:value="queryFormData.appName" :placeholder="$t('views.llm.app.placeholder.appName')" />
        </t-form-item>
        <t-form-item name="appType">
          <selectDict
            v-model:dictCode="queryFormData.appType"
            dictType="APP_TYPE"
            :placeholder="$t('views.llm.app.placeholder.appType')"
          />
        </t-form-item>
        <t-form-item name="status">
          <selectStatus
            v-model:status="queryFormData.status"
            :placeholder="`${$t('common.select')}${$t('common.status')}`"
          />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit">{{ $t('common.query') }}</t-button>
            <t-button type="reset">{{ $t('common.reset') }}</t-button>
          </t-space>
        </t-form-item>
      </t-form>

      <t-button theme="primary" @click="handleAdd">
        {{ $t('views.llm.app.add') }}
      </t-button>
    </div>
  </t-card>

  <!-- 卡片列表 -->
  <div class="my-4">
    <t-loading :loading="loading" style="width: 100%">
      <t-row v-if="appsData.length > 0" :gutter="[16, 16]">
        <t-col v-for="item in appsData" :key="item.appId" :xs="12" :sm="8" :md="6" :lg="4" :xl="3">
          <t-card size="small" class="w-full h-48 flex flex-col" :title="item.appName" :bordered="true" hoverShadow>
            <template #title>
              <div class="flex items-center justify-between">
                <span class="font-medium truncate">{{ item.appName }}</span>
                <t-tag :theme="getStatusConfig(Number(item.status)).theme" size="small">
                  {{ getStatusConfig(Number(item.status)).text }}
                </t-tag>
              </div>
            </template>
            <div class="flex-1 overflow-hidden text-sm text-gray-600 leading-relaxed">
              {{ item.description }}
            </div>
            <template #footer>
              <div class="flex justify-between items-center">
                <span class="text-xs text-gray-500">v{{ item.version }}</span>
                <div class="flex space-x-2">
                  <t-button size="small" theme="primary" @click="handleDesign(item)">
                    <template #icon>
                      <t-icon name="edit-1" />
                    </template>
                    {{ $t('views.llm.app.design') }}
                  </t-button>
                  <t-dropdown>
                    <t-button size="small" variant="outline">
                      <template #icon>
                        <t-icon name="more" />
                      </template>
                    </t-button>
                    <t-dropdown-menu>
                      <t-dropdown-item @click="handleEdit(item)">
                        <t-icon name="edit" class="mr-1" />
                        {{ $t('views.llm.app.edit') }}
                      </t-dropdown-item>
                      <t-dropdown-item @click="handleCopy(item)">
                        <t-icon name="file-copy" class="mr-1" />
                        {{ $t('views.llm.app.copy') }}
                      </t-dropdown-item>
                      <t-dropdown-item v-if="item.status === 0" @click="handlePublish(item, true)">
                        <t-icon name="upload" class="mr-1" />
                        {{ $t('views.llm.app.publish') }}
                      </t-dropdown-item>
                      <t-dropdown-item v-if="item.status === 1" @click="handlePublish(item, false)">
                        <t-icon name="download" class="mr-1" />
                        {{ $t('views.llm.app.unpublish') }}
                      </t-dropdown-item>
                      <t-dropdown-item @click="handleDelete(item)" theme="danger">
                        <t-icon name="delete" class="mr-1" />
                        {{ $t('views.llm.app.delete') }}
                      </t-dropdown-item>
                    </t-dropdown-menu>
                  </t-dropdown>
                </div>
              </div>
            </template>
          </t-card>
        </t-col>
      </t-row>
      <t-empty v-else></t-empty>
    </t-loading>
  </div>

  <!-- 分页 -->
  <t-pagination
    v-if="itemCount > 0"
    v-model:current="page"
    v-model:pageSize="pageSize"
    :total="itemCount"
    show-jumper
    @change="handlePageChange"
  ></t-pagination>

  <!-- 新增/编辑应用抽屉 -->
  <t-drawer v-model:visible="showDrawer" size="500px" :footer="false">
    <template #header>{{ drawerTitle }}</template>
    <t-form
      ref="drawerFormRef"
      :label-width="120"
      :data="drawerFormData"
      :rules="drawerRules"
      @submit="handleAddandEdit"
    >
      <t-form-item :label="$t('views.llm.app.name')" name="appName">
        <t-input v-model:value="drawerFormData.appName" :placeholder="$t('views.llm.app.placeholder.appName')" />
      </t-form-item>

      <t-form-item :label="$t('views.llm.app.type')" name="appType">
        <selectDict
          v-model:dictCode="drawerFormData.appType"
          dictType="APP_TYPE"
          :placeholder="$t('views.llm.app.placeholder.appType')"
        />
      </t-form-item>

      <t-form-item :label="$t('views.llm.app.version')" name="version">
        <t-input v-model:value="drawerFormData.version" :placeholder="$t('views.llm.app.placeholder.version')" />
      </t-form-item>

      <t-form-item :label="$t('views.llm.app.description')" name="description">
        <t-textarea
          v-model:value="drawerFormData.description"
          :placeholder="$t('views.llm.app.placeholder.description')"
          :autosize="{ minRows: 3, maxRows: 6 }"
        />
      </t-form-item>

      <t-form-item>
        <t-space>
          <t-button theme="primary" type="submit">{{ $t('common.confirm') }}</t-button>
          <t-button @click="showDrawer = false">{{ $t('common.cancel') }}</t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-drawer>

  <!-- 复制应用对话框 -->
  <t-dialog
    v-model:visible="showCopyModal"
    :header="`${$t('views.llm.app.copy')}: ${copyData.appName}`"
    :footer="false"
    width="400px"
  >
    <div class="space-y-4">
      <div class="text-sm text-gray-600">
        {{ $t('views.llm.app.placeholder.copyName') }}
      </div>
      <t-input v-model:value="copyData.newName" :placeholder="$t('views.llm.app.placeholder.copyName')" />
      <div class="flex justify-end space-x-2">
        <t-button @click="showCopyModal = false">{{ $t('common.cancel') }}</t-button>
        <t-button theme="primary" @click="onCopy">{{ $t('common.confirm') }}</t-button>
      </div>
    </div>
  </t-dialog>
</template>

<style scoped>
  .t-card {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  /* 确保卡片内容区域正确布局 */
  :deep(.t-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
