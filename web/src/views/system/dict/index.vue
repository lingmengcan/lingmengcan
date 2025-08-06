<script lang="ts" setup>
  import { addDict, changeDictStatus, editDict, getDictList } from '@/api/system/dict';
  import { Dict, DictParams } from '@/models/dict';
  import { formatDateTime } from '@/utils';
  import { onMounted, ref } from 'vue';
  import { getMenus } from '@/api/system/menu';
  import { handleTree } from '@/utils/menu';
  import { Menu } from '@/models/menu';
  import { hasPermission } from '@/utils/permission';
  import selectStatus from '@/components/select/select-status.vue';
  import selectDict from '@/components/select/select-dict.vue';
  import { useI18n } from 'vue-i18n';
  import {
    MessagePlugin,
    DialogPlugin,
    LoadingPlugin,
    Switch as TSwitch,
    Button as TButton,
    Icon as TIcon,
  } from 'tdesign-vue-next';

  const { t } = useI18n();

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const treeData = ref<Menu[]>([]);
  const allMenuKeys = ref<string[]>([]);

  const formRef = ref(null);
  const drawerFormRef = ref(null);

  // 新增/修改弹窗数据初始化
  const dictInitData: Dict = {
    dictId: '',
    dictName: '',
    dictCode: '',
    dictType: '',
    sort: 0,
    status: 0,
    description: '',
  };
  const drawerFormData = ref(dictInitData);

  const drawerRules = {
    dictName: [{ required: true, message: t('views.system.dict.placeholder.dictName'), trigger: 'blur' }],
    dictCode: [{ required: true, message: t('views.system.dict.placeholder.dictCode'), trigger: 'blur' }],
    dictType: [{ required: true, message: t('views.system.dict.placeholder.dictType'), trigger: 'blur' }],
    sort: [{ type: 'number', required: true, message: t('views.system.dict.placeholder.sort'), trigger: 'blur' }],
    status: [{ required: true, message: t('views.system.dict.placeholder.status'), trigger: 'blur' }],
  };

  const queryFormData = ref({
    dictName: '',
    dictCode: '',
    dictType: '',
    status: null,
  });

  const columns = [
    {
      colKey: 'dictId',
      title: t('views.system.dict.dictId'),
      type: 'multiple',
    },
    {
      colKey: 'dictName',
      title: t('views.system.dict.dictName'),
      width: 100,
      ellipsis: true,
    },
    {
      colKey: 'dictCode',
      title: t('views.system.dict.dictCode'),
      width: 100,
      ellipsis: true,
    },
    {
      colKey: 'dictType',
      title: t('views.system.dict.dictType'),
      width: 100,
      ellipsis: true,
    },
    {
      colKey: 'sort',
      title: t('views.system.dict.sort'),
      width: 60,
    },
    {
      colKey: 'status',
      title: t('common.status'),
      width: 60,
      align: 'center',
      fixed: 'left',
      cell: (h: any, { row }: any) => {
        return h(TSwitch, {
          size: 'small',
          modelValue: row['status'] === 0,
          disabled: !hasPermission('system_dict_edit'),
          loading: row.changing,
          onChange: () => handleChangeStatus(row, row.status),
        });
      },
    },
    {
      colKey: 'createdAt',
      title: t('views.system.dict.createdAt'),
      width: 120,
      ellipsis: true,
      cell: (h: any, { row }: any) => {
        return h('span', formatDateTime(row['createdAt']));
      },
    },
    {
      colKey: 'operation',
      title: t('common.table.actions'),
      align: 'center',
      fixed: 'right',
      width: 180,
    },
  ];

  const tableLoading = ref(true);
  const rowKey = 'dictId';

  const tableData = ref<Dict[]>([]);
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

  // 绑定表格数据
  const query = async (page: number, pageSize = 10) => {
    try {
      tableLoading.value = true;
      const requestData: DictParams = {
        ...queryFormData.value,
        page: page,
        pageSize,
      };

      const res = await getDictList(requestData);
      if (res?.code === 0) {
        tableData.value = res.data?.list;
        pagination.value.current = page;
        pagination.value.pageSize = pageSize;
        pagination.value.total = res.data.count;
      }
    } catch (err) {
      tableData.value = [];
    }
    tableLoading.value = false;
  };

  // 查询菜单下拉树结构
  const getMenuTree = () => {
    getMenus().then((response) => {
      const menus = handleTree<Menu>(response.data, 'menuId');
      allMenuKeys.value = response.data.map((item) => item.menuId);
      treeData.value = menus;
    });
  };

  const handleQuery = () => {
    query(pagination.value.current, pagination.value.pageSize);
  };

  const clearQuery = () => {
    queryFormData.value = {
      dictName: '',
      dictCode: '',
      dictType: '',
      status: null,
    };
    pagination.value.current = 1;
    query(1, pagination.value.pageSize);
  };

  // 改变状态
  const handleChangeStatus = (row: any, status: number) => {
    row.changing = true;
    let text = t('common.disable');

    const dict: Dict = { ...dictInitData };
    Object.assign(dict, row);

    switch (status) {
      case 1:
        text = t('common.enable');
        dict.status = 0;
        break;
      case 0:
        text = t('common.disable');
        dict.status = 1;
        break;
      case -1:
        dict.status = status;
        text = t('common.delete');
        break;
    }

    const confirmDialog = DialogPlugin.confirm({
      header: t('common.info'),
      body: t('views.system.dict.confirmMessage', { action: text, dict: row.dictName }),
      confirmBtn: t('common.confirm'),
      cancelBtn: t('common.cancel'),
      onConfirm: async () => {
        const res = await changeDictStatus(dict);
        if (res?.code === 0) {
          MessagePlugin.success(`${text}${t('common.success')}`);
          // 更新当前行的状态
          row.status = dict.status;
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

  // 新增字典
  const handleAdd = async () => {
    drawerTitle.value = `${t('common.add')}${t('views.system.dict.index')}`;
    showDrawer.value = true;
    drawerFormData.value = { ...dictInitData };
  };

  // 删除字典 status = -1
  const handleDelete = async (row: any) => {
    handleChangeStatus(row, -1);
  };

  // 修改字典
  const handleEdit = async (row: any) => {
    drawerTitle.value = `${t('common.edit')}${t('views.system.dict.index')}`;
    showDrawer.value = true;

    // 赋值
    // 创建一个新的对象，包含 modelInitData 的属性和 item 的属性
    drawerFormData.value = { ...dictInitData, ...row };
  };

  const handleAddandEdit = async ({ validateResult, firstError, e }) => {
    e.preventDefault();

    LoadingPlugin(true);
    if (validateResult === true) {
      const requestData: Dict = drawerFormData.value;

      const res = drawerFormData.value.dictId ? await editDict(requestData) : await addDict(requestData);

      if (res?.code === 0) {
        showDrawer.value = false;
        drawerFormData.value = { ...dictInitData };
        query(pagination.value.current, pagination.value.pageSize);
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.error(t('common.validationFailed'));
    }

    LoadingPlugin(false);
  };

  onMounted(async () => {
    getMenuTree();
    query(pagination.value.current, pagination.value.pageSize);
  });
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
      <t-form-item :label="$t('views.system.dict.dictName')" name="dictName">
        <t-input v-model:value="queryFormData.dictName" :placeholder="$t('views.system.dict.placeholder.dictName')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.dict.dictCode')" name="dictCode">
        <t-input v-model:value="queryFormData.dictCode" :placeholder="$t('views.system.dict.placeholder.dictCode')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.dict.dictType')" name="dictType">
        <selectDict v-model:dict-code="queryFormData.dictType" :multiple="true" />
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectStatus v-model:status="queryFormData.status" />
      </t-form-item>
      <t-form-item>
        <t-space>
          <t-button type="reset">{{ $t('common.reset') }}</t-button>
          <t-button v-permission="['system_dict_query']" theme="primary" type="submit">
            {{ $t('common.query') }}
          </t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-card>

  <!-- 表格 -->
  <t-card :bordered="false" class="mt-4!">
    <div class="mb-2">
      <!--顶部左侧区域-->
      <div class="flex items-center">
        <t-button v-permission="['system_dict_add']" theme="primary" @click="handleAdd">
          <template #icon>
            <t-icon name="add" />
          </template>
          {{ $t('views.system.dict.add') }}
        </t-button>
      </div>
    </div>
    <div>
      <t-table
        ref="table"
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
            <t-button
              size="small"
              theme="primary"
              :disabled="!hasPermission('system_dict_edit')"
              @click="handleEdit(row)"
            >
              <template #icon>
                <t-icon name="edit" />
              </template>
              {{ $t('common.edit') }}
            </t-button>

            <t-button
              size="small"
              theme="danger"
              :disabled="!hasPermission('system_dict_delete')"
              @click="handleDelete(row)"
            >
              <template #icon>
                <t-icon name="delete" />
              </template>
              {{ $t('common.delete') }}
            </t-button>
          </t-space>
        </template>
      </t-table>
    </div>
  </t-card>

  <!-- 新增修改字典 -->
  <t-drawer v-model:visible="showDrawer" size="399px" :footer="false">
    <template #header>{{ drawerTitle }}</template>
    <t-form
      ref="drawerFormRef"
      :label-width="120"
      :data="drawerFormData"
      :rules="drawerRules"
      @submit="handleAddandEdit"
    >
      <t-form-item :label="$t('views.system.dict.dictName')" name="dictName">
        <t-input v-model:value="drawerFormData.dictName" :placeholder="$t('views.system.dict.placeholder.dictName')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.dict.dictCode')" name="dictCode">
        <t-input v-model:value="drawerFormData.dictCode" :placeholder="$t('views.system.dict.placeholder.dictCode')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.dict.dictType')" name="dictType">
        <selectDict v-model:dict-code="drawerFormData.dictType" />
      </t-form-item>
      <t-form-item :label="$t('views.system.dict.sort')" name="sort">
        <t-input-number v-model:value="drawerFormData.sort" :min="0" />
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectStatus v-model:status="drawerFormData.status" />
      </t-form-item>
      <t-form-item :label="$t('views.system.dict.description')" name="description">
        <t-textarea
          v-model:value="drawerFormData.description"
          :placeholder="$t('views.system.dict.placeholder.description')"
        />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" type="submit">{{ $t('common.confirm') }}</t-button>
      </t-form-item>
    </t-form>
  </t-drawer>
</template>
