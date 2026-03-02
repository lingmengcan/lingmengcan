<script lang="ts" setup>
  import {
    getDatasourceList,
    addDatasource,
    editDatasource,
    changeDatasourceStatus,
    testDatasourceConnection,
  } from '@/api/llm/datasource';
  import { Datasource, DatasourceParams, TestConnectionParams } from '@/models/datasource';
  import { formatDateTime } from '@/utils';
  import { onMounted, ref } from 'vue';
  import {
    MessagePlugin,
    DialogPlugin,
    LoadingPlugin,
    Switch as TSwitch,
  } from 'tdesign-vue-next';

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const formRef = ref(null);
  const drawerFormRef = ref(null);

  const datasourceInitData: Datasource = {
    datasourceId: '',
    name: '',
    type: 'mysql',
    host: '',
    port: 3306,
    databaseName: '',
    username: '',
    password: '',
    charset: 'utf8mb4',
    extraOptions: '',
    status: 0,
    description: '',
  };

  const drawerFormData = ref<Datasource>({ ...datasourceInitData });

  const drawerRules = {
    name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择数据库类型', trigger: 'blur' }],
    host: [{ required: true, message: '请输入主机地址', trigger: 'blur' }],
    port: [{ required: true, message: '请输入端口', trigger: 'blur' }],
    databaseName: [{ required: true, message: '请输入数据库名', trigger: 'blur' }],
  };

  const queryFormData = ref({
    name: '',
    type: '',
    status: null as number | null,
  });

  const columns = [
    {
      colKey: 'name',
      title: '数据源名称',
      width: 150,
      ellipsis: true,
    },
    {
      colKey: 'type',
      title: '类型',
      width: 100,
      cell: (_h: any, { row }: any) => {
        const typeMap: Record<string, string> = {
          mysql: 'MySQL',
          postgresql: 'PostgreSQL',
          sqlite: 'SQLite',
        };
        return typeMap[row.type] || row.type;
      },
    },
    {
      colKey: 'host',
      title: '主机',
      width: 160,
      ellipsis: true,
    },
    {
      colKey: 'port',
      title: '端口',
      width: 80,
    },
    {
      colKey: 'databaseName',
      title: '数据库名',
      width: 140,
      ellipsis: true,
    },
    {
      colKey: 'status',
      title: '状态',
      width: 80,
      align: 'center' as const,
      cell: (h: any, { row }: any) => {
        return h(TSwitch, {
          size: 'small',
          modelValue: row['status'] === 0,
          loading: row.changing,
          onChange: () => handleChangeStatus(row, row.status),
        });
      },
    },
    {
      colKey: 'createdAt',
      title: '创建时间',
      width: 160,
      ellipsis: true,
      cell: (_h: any, { row }: any) => {
        return formatDateTime(row['createdAt']);
      },
    },
    {
      colKey: 'operation',
      title: '操作',
      align: 'center' as const,
      fixed: 'right' as const,
      width: 200,
    },
  ];

  const tableLoading = ref(true);
  const rowKey = 'datasourceId';
  const tableData = ref<Datasource[]>([]);
  const testLoading = ref(false);

  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0,
    showJumper: true,
    pageSizeOptions: [10, 20, 50],
    onChange: (pageInfo: any) => {
      pagination.value.current = pageInfo.current;
      pagination.value.pageSize = pageInfo.pageSize;
      query(pageInfo.current, pageInfo.pageSize);
    },
  });

  const query = async (page: number, pageSize = 10) => {
    try {
      tableLoading.value = true;
      const requestData: DatasourceParams = {
        ...queryFormData.value,
        page,
        pageSize,
      };

      const res = await getDatasourceList(requestData);
      if (res?.code === 0) {
        tableData.value = res.data?.list || [];
        pagination.value.current = page;
        pagination.value.pageSize = pageSize;
        pagination.value.total = res.data.count;
      }
    } catch (err) {
      tableData.value = [];
    }
    tableLoading.value = false;
  };

  const handleQuery = () => {
    query(pagination.value.current, pagination.value.pageSize);
  };

  const clearQuery = () => {
    queryFormData.value = { name: '', type: '', status: null };
    pagination.value.current = 1;
    query(1, pagination.value.pageSize);
  };

  const handleChangeStatus = (row: any, status: number) => {
    row.changing = true;
    let text = '禁用';

    const ds: Datasource = { ...datasourceInitData, ...row };

    switch (status) {
      case 1:
        text = '启用';
        ds.status = 0;
        break;
      case 0:
        text = '禁用';
        ds.status = 1;
        break;
      case -1:
        ds.status = status;
        text = '删除';
        break;
    }

    const confirmDialog = DialogPlugin.confirm({
      header: '提示',
      body: `确认${text}数据源「${row.name}」？`,
      confirmBtn: '确认',
      cancelBtn: '取消',
      onConfirm: async () => {
        const res = await changeDatasourceStatus(ds);
        if (res?.code === 0) {
          MessagePlugin.success(`${text}成功`);
          row.status = ds.status;
          if (ds.status === -1) {
            query(pagination.value.current, pagination.value.pageSize);
          }
        }
        row.changing = false;
        confirmDialog.hide();
      },
      onClose: () => {
        row.changing = false;
        confirmDialog.hide();
      },
    });
  };

  const handleAdd = () => {
    drawerTitle.value = '新增数据源';
    showDrawer.value = true;
    drawerFormData.value = { ...datasourceInitData };
  };

  const handleDelete = (row: any) => {
    handleChangeStatus(row, -1);
  };

  const handleEdit = (row: any) => {
    drawerTitle.value = '编辑数据源';
    showDrawer.value = true;
    drawerFormData.value = { ...datasourceInitData, ...row };
  };

  const handleTestConnection = async () => {
    const form = drawerFormData.value;
    if (!form.host || !form.port || !form.databaseName) {
      MessagePlugin.warning('请先填写完整的连接信息');
      return;
    }

    testLoading.value = true;
    try {
      const params: TestConnectionParams = {
        type: form.type,
        host: form.host,
        port: form.port,
        databaseName: form.databaseName,
        username: form.username,
        password: form.password,
        charset: form.charset,
      };

      const res = await testDatasourceConnection(params);
      if (res?.code === 0 && res.data === true) {
        MessagePlugin.success('连接成功');
      } else {
        MessagePlugin.error('连接失败');
      }
    } catch (err) {
      MessagePlugin.error('连接失败');
    }
    testLoading.value = false;
  };

  const handleSubmit = async ({ validateResult, firstError, e }: any) => {
    e.preventDefault();

    LoadingPlugin(true);
    if (validateResult === true) {
      const requestData: Datasource = drawerFormData.value;

      const res = requestData.datasourceId
        ? await editDatasource(requestData)
        : await addDatasource(requestData);

      if (res?.code === 0) {
        showDrawer.value = false;
        drawerFormData.value = { ...datasourceInitData };
        query(pagination.value.current, pagination.value.pageSize);
      }
    } else {
      MessagePlugin.error('请检查表单');
    }

    LoadingPlugin(false);
  };

  onMounted(() => {
    query(pagination.value.current, pagination.value.pageSize);
  });

  const onTypeChange = (type: string) => {
    const portMap: Record<string, number> = {
      mysql: 3306,
      postgresql: 5432,
      sqlite: 0,
    };
    if (portMap[type] !== undefined) {
      drawerFormData.value.port = portMap[type];
    }
  };
</script>

<template>
  <t-card :bordered="false">
    <t-form
      ref="formRef"
      layout="inline"
      label-width="auto"
      :data="queryFormData"
      @reset="clearQuery"
      @submit="handleQuery"
    >
      <t-form-item label="名称" name="name">
        <t-input v-model:value="queryFormData.name" placeholder="请输入数据源名称" />
      </t-form-item>
      <t-form-item label="类型" name="type">
        <t-select v-model:value="queryFormData.type" placeholder="全部" clearable style="width: 140px">
          <t-option value="mysql" label="MySQL" />
          <t-option value="postgresql" label="PostgreSQL" />
          <t-option value="sqlite" label="SQLite" />
        </t-select>
      </t-form-item>
      <t-form-item>
        <t-space>
          <t-button type="reset">重置</t-button>
          <t-button theme="primary" type="submit">查询</t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-card>

  <t-card :bordered="false" class="mt-4!">
    <div class="mb-2">
      <div class="flex items-center">
        <t-button theme="primary" @click="handleAdd">
          <template #icon>
            <t-icon name="add" />
          </template>
          新增数据源
        </t-button>
      </div>
    </div>
    <div>
      <t-table
        bordered
        hover
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
        :pagination="pagination"
        :row-key="rowKey"
      >
        <template #operation="{ row }">
          <t-space size="small">
            <t-button size="small" theme="primary" @click="handleEdit(row)">
              <template #icon>
                <t-icon name="edit" />
              </template>
              编辑
            </t-button>
            <t-button size="small" theme="danger" @click="handleDelete(row)">
              <template #icon>
                <t-icon name="delete" />
              </template>
              删除
            </t-button>
          </t-space>
        </template>
      </t-table>
    </div>
  </t-card>

  <!-- 新增/编辑抽屉 -->
  <t-drawer v-model:visible="showDrawer" size="480px" :footer="false">
    <template #header>{{ drawerTitle }}</template>
    <t-form
      ref="drawerFormRef"
      :label-width="100"
      :data="drawerFormData"
      :rules="drawerRules"
      @submit="handleSubmit"
    >
      <t-form-item label="名称" name="name">
        <t-input v-model:value="drawerFormData.name" placeholder="请输入数据源名称" />
      </t-form-item>
      <t-form-item label="数据库类型" name="type">
        <t-select v-model:value="drawerFormData.type" @change="onTypeChange">
          <t-option value="mysql" label="MySQL" />
          <t-option value="postgresql" label="PostgreSQL" />
          <t-option value="sqlite" label="SQLite" />
        </t-select>
      </t-form-item>
      <t-form-item label="主机地址" name="host">
        <t-input v-model:value="drawerFormData.host" placeholder="例如: localhost 或 192.168.1.100" />
      </t-form-item>
      <t-form-item label="端口" name="port">
        <t-input-number v-model:value="drawerFormData.port" :min="1" :max="65535" style="width: 100%" />
      </t-form-item>
      <t-form-item label="数据库名" name="databaseName">
        <t-input v-model:value="drawerFormData.databaseName" placeholder="请输入数据库名" />
      </t-form-item>
      <t-form-item label="用户名" name="username">
        <t-input v-model:value="drawerFormData.username" placeholder="请输入用户名" />
      </t-form-item>
      <t-form-item label="密码" name="password">
        <t-input v-model:value="drawerFormData.password" type="password" placeholder="请输入密码" />
      </t-form-item>
      <t-form-item label="字符集" name="charset">
        <t-input v-model:value="drawerFormData.charset" placeholder="utf8mb4" />
      </t-form-item>
      <t-form-item label="描述" name="description">
        <t-textarea v-model:value="drawerFormData.description" placeholder="请输入描述" />
      </t-form-item>
      <t-form-item>
        <t-space>
          <t-button theme="primary" type="submit">保存</t-button>
          <t-button theme="default" variant="outline" :loading="testLoading" @click="handleTestConnection">
            测试连接
          </t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-drawer>
</template>
