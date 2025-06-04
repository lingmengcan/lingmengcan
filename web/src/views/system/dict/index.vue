<script lang="ts" setup>
  import { addDict, changeDictStatus, editDict, getDictList } from '@/api/system/dict';
  import { Dict, DictParams } from '@/models/dict';
  import { formatDateTime } from '@/utils';
  import { DataTableRowKey, FormInst, NButton, NSwitch, useDialog, useMessage } from 'naive-ui';
  import { h, onMounted, ref } from 'vue';
  import { DeleteOutlined, EditOutlined, PlusOutlined } from '@vicons/antd';
  import { getMenus } from '@/api/system/menu';
  import { handleTree } from '@/utils/menu';
  import { Menu } from '@/models/menu';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import { renderIcon } from '@/utils/icons';
  import { hasPermission } from '@/utils/permission';
  import selectStatus from '@/components/select/select-status.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const message = useMessage();
  const dialog = useDialog();

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const treeData = ref<Menu[]>([]);

  const allMenuKeys = ref<string[]>([]);

  const formRef = ref<FormInst | null>(null);
  const drawerFormRef = ref<FormInst | null>(null);

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
    dictName: { required: true, message: t('views.system.dict.placeholder.dictName'), trigger: 'blur' },
    dictCode: { required: true, message: t('views.system.dict.placeholder.dictCode'), trigger: 'blur' },
    dictType: { required: true, message: t('views.system.dict.placeholder.dictType'), trigger: 'blur' },
    sort: { type: 'number', required: true, message: t('views.system.dict.placeholder.sort'), trigger: 'blur' },
    status: { required: true, message: t('views.system.dict.placeholder.status'), trigger: 'blur' },
  };

  const queryFormData = ref({
    dictName: '',
    dictCode: '',
    dictType: '',
    status: null,
  });

  const columns = [
    {
      key: 'dictId',
      title: t('views.system.dict.dictId'),
      type: 'selection',
    },
    {
      key: 'dictName',
      title: t('views.system.dict.dictName'),
      width: 100,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'dictCode',
      title: t('views.system.dict.dictCode'),
      width: 100,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'dictType',
      title: t('views.system.dict.dictType'),
      width: 100,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'sort',
      title: t('views.system.dict.sort'),
      width: 60,
    },
    {
      key: 'status',
      title: t('common.status'),
      width: 60,
      align: 'center',
      fixed: 'left',
      render(row: RowData) {
        return h(NSwitch, {
          size: 'small',
          rubberBand: false,
          value: row['status'] === 0,
          disabled: !hasPermission('system_dict_edit'),
          tableLoading: !!row.changing,
          onUpdateValue: () => handleChangeStatus(row),
        });
      },
    },
    {
      key: 'createdAt',
      title: t('views.system.dict.createdAt'),
      width: 120,
      ellipsis: {
        tooltip: true,
      },
      render(row: RowData) {
        return h('span', formatDateTime(row['createdAt']));
      },
    },
    {
      key: 'actions',
      title: t('common.table.actions'),
      align: 'center',
      fixed: 'right',
      width: 180,
      render(row: RowData) {
        return [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              style: 'margin-left: 10px;',
              disabled: !hasPermission('system_dict_edit'),
              onClick: () => handleEdit(row),
            },
            {
              default: () => t('common.edit'),
              icon: renderIcon(EditOutlined),
            },
          ),

          h(
            NButton,
            {
              size: 'small',
              type: 'error',
              style: 'margin-left: 10px;',
              disabled: !hasPermission('system_dict_delete'),
              onClick: () => handleDelete(row),
            },
            {
              default: () => t('common.delete'),
              icon: renderIcon(DeleteOutlined),
            },
          ),
        ];
      },
    },
  ];

  const tableLoading = ref(true);
  const rowKey = (rowData: RowData) => {
    return rowData.dictId;
  };
  const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
  const tableData = ref<Dict[]>([]);
  const pagination = ref({
    page: 1,
    pageSize: 10,
    pageCount: 1,
    showSizePicker: true,
    showQuickJumper: true,
    pageSizes: [10, 20, 50],
    itemCount: 0,
    prefix({ itemCount }) {
      return `${itemCount} ${t('common.paginationItemCount')}`;
    },
    onChange: (page: number) => {
      pagination.value.page = page;
    },
    onUpdatePageSize: (pageSize: number) => {
      pagination.value.pageSize = pageSize;
      pagination.value.page = 1;
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
        pagination.value.page = page;
        pagination.value.pageSize = pageSize;
        pagination.value.itemCount = res.data.count;
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
    query(pagination.value.page, pagination.value.pageSize);
  };

  const clearQuery = () => {
    queryFormData.value = {
      dictName: '',
      dictCode: '',
      dictType: '',
      status: null,
    };
    query(1, pagination.value.pageSize);
  };

  const handlePageChange = (currentPage: number) => {
    query(currentPage, pagination.value.pageSize);
  };

  const handleCheck = (rowKeys: DataTableRowKey[]) => {
    checkedRowKeysRef.value = rowKeys;
  };

  // 改变状态
  const handleChangeStatus = (row: RowData) => {
    row.changing = true;
    let text = t('common.disable');

    const dict: Dict = { ...dictInitData };
    Object.assign(dict, row);

    switch (row.status) {
      case 1:
        text = t('common.enable');
        dict.status = 0;
        break;
      case 0:
        text = t('common.disable');
        dict.status = 1;
        break;
      case -1:
        text = t('common.edit');
        break;
    }

    dialog.info({
      title: t('common.info'),
      content: t('views.system.dict.confirmMessage', { action: text, dict: row.dictName }),
      positiveText: t('common.confirm'),
      negativeText: t('common.cancel'),
      onPositiveClick: async () => {
        const res = await changeDictStatus(dict);
        if (res?.code === 0) {
          message.success(`${text}${t('common.success')}`);
        }
        row.changing = false;
        await query(pagination.value.page, pagination.value.pageSize);
      },
      onNegativeClick: () => {
        row.changing = false;
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
  const handleDelete = async (row: RowData) => {
    row.status = -1;
    handleChangeStatus(row);
  };

  // 修改字典
  const handleEdit = async (row: RowData) => {
    drawerTitle.value = `${t('common.edit')}${t('views.system.dict.index')}`;
    showDrawer.value = true;

    // 赋值
    // 创建一个新的对象，包含 modelInitData 的属性和 item 的属性
    drawerFormData.value = { ...dictInitData, ...row };
  };

  const handleAddandEdit = (e: MouseEvent) => {
    e.preventDefault();
    const messageReactive = message.loading('处理中', {
      duration: 0,
    });
    drawerFormRef.value?.validate(async (errors) => {
      if (!errors) {
        const requestData: Dict = drawerFormData.value;

        const res = drawerFormData.value.dictId ? await editDict(requestData) : await addDict(requestData);

        if (res?.code === 0) {
          showDrawer.value = false;
          drawerFormData.value = { ...dictInitData };
          query(pagination.value.page, pagination.value.pageSize);
        }
      } else {
        console.log(errors);
        message.error(t('common.validationFailed'));
      }

      messageReactive.destroy();
    });
  };

  onMounted(async () => {
    getMenuTree();

    query(pagination.value.page, pagination.value.pageSize);
  });
</script>

<template>
  <n-card :bordered="false">
    <n-form ref="formRef" inline label-placement="left" label-width="auto" :model="queryFormData">
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="6" :label="$t('views.system.dict.dictName')" path="dictName">
          <n-input v-model:value="queryFormData.dictName" :placeholder="$t('views.system.dict.placeholder.dictName')" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" :label="$t('views.system.dict.dictCode')" path="dictCode">
          <n-input v-model:value="queryFormData.dictCode" :placeholder="$t('views.system.dict.placeholder.dictCode')" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" :label="$t('views.system.dict.dictType')" path="dictType">
          <selectDict v-model:dict-code="queryFormData.dictType" :multiple="true" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" :label="$t('common.status')" path="status">
          <selectStatus v-model:status="queryFormData.status" />
        </n-form-item-gi>
        <n-form-item-gi :span="6">
          <n-space>
            <n-button @click="clearQuery">{{ $t('common.reset') }}</n-button>
            <n-button v-permission="['system_dict_query']" type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </n-button>
          </n-space>
        </n-form-item-gi>
      </n-grid>
    </n-form>
  </n-card>
  <n-card :bordered="false" class="mt-2">
    <div class="mb-2">
      <!--顶部左侧区域-->
      <div class="flex items-center">
        <n-button v-permission="['system_dict_add']" type="primary" @click="handleAdd">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          {{ $t('views.system.dict.add') }}
        </n-button>
      </div>
    </div>
    <div>
      <n-data-table
        ref="table"
        remote
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
        :pagination="pagination"
        :row-key="rowKey"
        @update:checked-row-keys="handleCheck"
        @update:page="handlePageChange"
      />
    </div>
  </n-card>

  <!-- 新增修改字典 -->
  <n-drawer v-model:show="showDrawer" :width="399">
    <n-drawer-content :title="drawerTitle" closable>
      <n-form
        ref="drawerFormRef"
        label-placement="left"
        label-width="auto"
        :model="drawerFormData"
        :rules="drawerRules"
      >
        <n-form-item :label="$t('views.system.dict.dictName')" path="dictName">
          <n-input
            v-model:value="drawerFormData.dictName"
            :placeholder="$t('views.system.dict.placeholder.dictName')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.system.dict.dictCode')" path="dictCode">
          <n-input
            v-model:value="drawerFormData.dictCode"
            :placeholder="$t('views.system.dict.placeholder.dictCode')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.system.dict.dictType')" path="dictType">
          <selectDict
            v-model:dict-code="drawerFormData.dictType"
            :placeholder="$t('views.system.dict.placeholder.dictType')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.system.dict.sort')" path="sort">
          <n-input-number v-model:value="drawerFormData.sort" :min="0" />
        </n-form-item>
        <n-form-item :label="$t('common.status')" path="status">
          <selectStatus v-model:status="drawerFormData.status" />
        </n-form-item>
        <n-form-item :label="$t('views.system.dict.description')" path="description">
          <n-input
            v-model:value="drawerFormData.description"
            type="textarea"
            :placeholder="$t('views.system.dict.placeholder.description')"
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space>
          <n-button type="primary" attr-type="button" @click="handleAddandEdit">{{ $t('common.submit') }}</n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>
