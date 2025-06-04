<template>
  <n-card :bordered="false">
    <n-form ref="formRef" inline label-placement="left" label-width="auto" :model="queryFormData">
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="6" :label="$t('views.system.role.roleName')" path="roleName">
          <n-input v-model:value="queryFormData.roleName" :placeholder="$t('views.system.role.placeholder.roleName')" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" :label="$t('views.system.role.roleCode')" path="roleCode">
          <n-input v-model:value="queryFormData.roleCode" :placeholder="$t('views.system.role.placeholder.roleCode')" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" :label="$t('common.status')" path="status">
          <selectStatus v-model:status="queryFormData.status" />
        </n-form-item-gi>
        <n-form-item-gi :span="6">
          <n-space>
            <n-button @click="clearQuery">{{ $t('common.reset') }}</n-button>
            <n-button v-permission="['system_role_query']" type="primary" @click="handleQuery">
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
        <n-button v-permission="['system_role_add']" type="primary" @click="handleAdd">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          {{ $t('views.system.role.add') }}
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

  <!-- 新增修改角色 -->
  <n-drawer v-model:show="showDrawer" :width="399">
    <n-drawer-content :title="drawerTitle" closable>
      <n-form
        ref="drawerFormRef"
        label-placement="left"
        label-width="auto"
        :model="drawerFormData"
        :rules="drawerRules"
      >
        <n-form-item :label="$t('views.system.role.roleName')" path="roleName">
          <n-input
            v-model:value="drawerFormData.roleName"
            :placeholder="$t('views.system.role.placeholder.roleName')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.system.role.roleCode')" path="roleCode">
          <n-input
            v-model:value="drawerFormData.roleCode"
            :placeholder="$t('views.system.role.placeholder.roleCode')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.system.role.sort')" path="sort">
          <n-input-number v-model:value="drawerFormData.sort" :min="0" />
        </n-form-item>
        <n-form-item :label="$t('common.status')" path="status">
          <selectStatus v-model:status="drawerFormData.status" />
        </n-form-item>
        <n-form-item :label="$t('views.system.role.description')" path="description">
          <n-input
            v-model:value="drawerFormData.description"
            type="textarea"
            :placeholder="$t('views.system.role.placeholder.description')"
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

  <!-- 菜单权限管理 -->
  <n-modal v-model:show="showMenuModal" :show-icon="false" preset="dialog" :title="editRoleTitle">
    <div class="py-3 menu-list">
      <n-tree
        block-line
        checkable
        :virtual-scroll="true"
        :data="treeData"
        key-field="menuId"
        label-field="menuName"
        :default-expand-all="expandAll"
        :checked-keys="checkedKeys"
        style="max-height: 950px; overflow: hidden"
        @update:checked-keys="checkedTree"
      />
    </div>
    <template #action>
      <n-space>
        <n-button type="info" ghost icon-placement="left" @click="expandHandle">
          {{ expandAll ? $t('views.system.role.unexpand') : $t('views.system.role.expand') }}
        </n-button>

        <n-button type="info" ghost icon-placement="left" @click="checkedAllHandle">
          {{ checkedAll ? $t('views.system.role.unselectAll') : $t('views.system.role.selectAll') }}
        </n-button>
        <n-button type="primary" :table-loading="formBtnLoading" @click="confirmMenuForm">
          {{ $t('common.submit') }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script lang="ts" setup>
  import { addRole, changeRoleMenus, changeRoleStatus, editRole, getRoleList, getRoleMenuIds } from '@/api/system/role';
  import { Role, RoleMenus, RoleParams } from '@/models/role';
  import { formatDateTime } from '@/utils';
  import { DataTableRowKey, FormInst, NButton, NSwitch, useDialog, useMessage } from 'naive-ui';
  import { h, onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { UserSwitchOutlined, DeleteOutlined, EditOutlined, PlusOutlined, MenuOutlined } from '@vicons/antd';
  import { getMenus } from '@/api/system/menu';
  import { handleTree } from '@/utils/menu';
  import { Menu } from '@/models/menu';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import { renderIcon } from '@/utils/icons';
  import { hasPermission } from '@/utils/permission';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const message = useMessage();
  const dialog = useDialog();
  const router = useRouter();

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const showMenuModal = ref(false);
  const formBtnLoading = ref(false);
  const checkedAll = ref(false);
  const editRoleTitle = ref('');
  const treeData = ref<Menu[]>([]);
  const checkedKeys = ref<string[]>([]);
  const expandAll = ref(false);
  const allMenuKeys = ref<string[]>([]);
  const roleId = ref('');

  const formRef = ref<FormInst | null>(null);
  const drawerFormRef = ref<FormInst | null>(null);

  // 新增/修改弹窗数据初始化

  // 新增/修改弹窗数据初始化
  const roleInitData = {
    roleId: '',
    roleName: '',
    roleCode: '',
    status: 0,
    sort: 0,
    description: '',
  };
  const drawerFormData = ref(roleInitData);

  const drawerRules = {
    roleName: { required: true, message: t('views.system.role.placeholder.roleName'), trigger: 'blur' },
    roleCode: { required: true, message: t('views.system.role.placeholder.roleCode'), trigger: 'blur' },
    status: { required: true, message: t('views.system.role.placeholder.status'), trigger: 'blur' },
    sort: { type: 'number', required: true, message: t('views.system.role.placeholder.sort'), trigger: 'blur' },
  };

  const queryFormData = ref({
    roleName: '',
    roleCode: '',
    status: null,
  });

  const columns = [
    {
      key: 'roleId',
      title: t('views.system.role.roleId'),
      type: 'selection',
    },
    {
      key: 'roleName',
      title: t('views.system.role.roleName'),
      width: 120,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'roleCode',
      title: t('views.system.role.roleCode'),
      width: 120,
    },
    {
      key: 'sort',
      title: t('views.system.role.sort'),
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
          disabled: !hasPermission('system_role_edit'),
          tableLoading: !!row.changing,
          onUpdateValue: () => handleChangeStatus(row),
        });
      },
    },
    {
      key: 'createdAt',
      title: t('views.system.role.createdAt'),
      width: 120,
      render(row: RowData) {
        return h('span', formatDateTime(row['createdAt']));
      },
    },
    {
      key: 'actions',
      title: t('common.table.actions'),
      align: 'center',
      fixed: 'right',
      width: 320,
      render(row: RowData) {
        return [
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              secondary: true,
              disabled: !hasPermission('system_role_edit'),
              onClick: () => handleMenu(row),
            },
            { default: () => t('views.system.role.menuRights'), icon: renderIcon(MenuOutlined) },
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              tertiary: true,
              style: 'margin-left: 10px;',
              disabled: !hasPermission('system_role_edit'),
              onClick: () => handleUser(row),
            },
            { default: () => t('views.system.role.roleUsers'), icon: renderIcon(UserSwitchOutlined) },
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'primary',
              style: 'margin-left: 10px;',
              disabled: !hasPermission('system_role_edit'),
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
              disabled: !hasPermission('system_role_delete'),
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
    return rowData.roleId;
  };
  const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
  const tableData = ref<Role[]>([]);
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
      const requestData: RoleParams = {
        ...queryFormData.value,
        page: page,
        pageSize,
      };

      const res = await getRoleList(requestData);
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
      roleName: '',
      roleCode: '',
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

    const role: Role = { roleId: '', roleName: '', roleCode: '', sort: 0, status: 0 };
    Object.assign(role, row);

    switch (row.status) {
      case 1:
        text = t('common.enable');
        role.status = 0;
        break;
      case 0:
        text = t('common.disable');
        role.status = 1;
        break;
      case -1:
        text = t('common.edit');
        break;
    }

    dialog.info({
      title: t('common.info'),
      content: t('views.system.role.confirmMessage', { action: text, user: row.roleName }),
      positiveText: t('common.confirm'),
      negativeText: t('common.cancel'),
      onPositiveClick: async () => {
        const res = await changeRoleStatus(role);
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

  // 新增角色
  const handleAdd = async () => {
    drawerTitle.value = `${t('common.add')}${t('views.system.role.index')}`;
    showDrawer.value = true;
    drawerFormData.value = roleInitData;
  };

  // 删除角色 statu = -1
  const handleDelete = async (row: RowData) => {
    row.status = -1;
    handleChangeStatus(row);
  };

  // 修改角色
  const handleEdit = async (row: RowData) => {
    drawerTitle.value = `${t('common.add')}${t('views.system.role.index')}`;
    showDrawer.value = true;
    drawerFormData.value = {
      roleId: row.roleId,
      roleCode: row.roleCode,
      roleName: row.roleName,
      status: row.status,
      sort: row.sort,
      description: row.description,
    };
  };

  const handleAddandEdit = (e: MouseEvent) => {
    e.preventDefault();
    const messageReactive = message.loading('处理中', {
      duration: 0,
    });
    drawerFormRef.value?.validate(async (errors) => {
      if (!errors) {
        const requestData: Role = {
          ...drawerFormData.value,
          createdUser: '',
          updatedUser: '',
          createdAt: '',
          updatedAt: '',
        };

        const res = drawerFormData.value.roleId ? await editRole(requestData) : await addRole(requestData);

        if (res?.code === 0) {
          showDrawer.value = false;
          drawerFormData.value = roleInitData;
          query(pagination.value.page, pagination.value.pageSize);
        }
      } else {
        console.log(errors);
        message.error(t('common.validationFailed'));
      }

      messageReactive.destroy();
    });
  };

  // 分配菜单
  const handleMenu = async (row: RowData) => {
    editRoleTitle.value = `分配 ${row.roleName} 的菜单权限`;

    roleId.value = row.roleId;
    const res = await getRoleMenuIds(row.roleId);
    if (res?.code === 0 && res?.data) {
      checkedKeys.value = res?.data;
    }
    showMenuModal.value = true;
  };

  function checkedTree(keys: string[]) {
    checkedKeys.value = keys;
  }

  function expandHandle() {
    expandAll.value = !expandAll.value;
  }

  function checkedAllHandle() {
    if (!checkedAll.value) {
      checkedKeys.value = allMenuKeys.value;

      checkedAll.value = true;
    } else {
      checkedKeys.value = [];
      checkedAll.value = false;
    }
  }

  const confirmMenuForm = async () => {
    formBtnLoading.value = true;

    showMenuModal.value = false;
    const requestData: RoleMenus = {
      roleId: roleId.value,
      menuIds: checkedKeys.value,
    };

    await changeRoleMenus(requestData);
    message.success(t('common.success'));
    query(pagination.value.page, pagination.value.pageSize);
    formBtnLoading.value = false;
  };

  // 分配用户
  const handleUser = async (row: RowData) => {
    router.push({
      path: '/right/role/user/',
      query: { id: row.roleId },
    });
  };

  onMounted(async () => {
    getMenuTree();

    query(pagination.value.page, pagination.value.pageSize);
  });
</script>
