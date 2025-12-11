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
      <t-form-item :label="$t('views.system.role.roleName')" name="roleName">
        <t-input v-model:value="queryFormData.roleName" :placeholder="$t('views.system.role.placeholder.roleName')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.role.roleCode')" name="roleCode">
        <t-input v-model:value="queryFormData.roleCode" :placeholder="$t('views.system.role.placeholder.roleCode')" />
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectStatus v-model:status="queryFormData.status" />
      </t-form-item>
      <t-form-item>
        <t-space>
          <t-button type="reset">{{ $t('common.reset') }}</t-button>
          <t-button v-permission="['system_role_query']" theme="primary" type="submit">
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
        <t-button v-permission="['system_role_add']" theme="primary" @click="handleAdd">
          <template #icon>
            <t-icon name="add" />
          </template>
          {{ $t('views.system.role.add') }}
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
          <t-button
            size="small"
            variant="base"
            theme="primary"
            style="margin-left: 10px"
            :disabled="!hasPermission('system_role_edit')"
            @click="handleMenu(row)"
          >
            <template #icon>
              <t-icon name="menu" />
            </template>
            {{ $t('views.system.role.menuRights') }}
          </t-button>

          <t-button
            size="small"
            variant="base"
            theme="default"
            style="margin-left: 10px"
            :disabled="!hasPermission('system_role_edit')"
            @click="handleUser(row)"
          >
            <template #icon>
              <t-icon name="user" />
            </template>
            {{ $t('views.system.role.roleUsers') }}
          </t-button>

          <t-button
            size="small"
            variant="base"
            theme="primary"
            style="margin-left: 10px"
            :disabled="!hasPermission('system_role_edit')"
            @click="handleEdit(row)"
          >
            <template #icon>
              <t-icon name="edit" />
            </template>
            {{ $t('common.edit') }}
          </t-button>

          <t-button
            size="small"
            variant="base"
            theme="danger"
            style="margin-left: 10px"
            :disabled="!hasPermission('system_role_delete')"
            @click="handleDelete(row)"
          >
            <template #icon>
              <t-icon name="delete" />
            </template>
            {{ $t('common.delete') }}
          </t-button>
        </template>
      </t-table>
    </div>
  </t-card>

  <!-- 新增修改角色 -->
  <t-drawer v-model:visible="showDrawer" size="399px" :footer="false">
    <template #header>{{ drawerTitle }}</template>
    <t-form
      ref="drawerFormRef"
      :label-width="120"
      :data="drawerFormData"
      :rules="drawerRules"
      @submit="handleAddandEdit"
    >
      <t-form-item :label="$t('views.system.role.roleName')" name="roleName">
        <t-input v-model:value="drawerFormData.roleName" :placeholder="$t('views.system.role.placeholder.roleName')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.role.roleCode')" name="roleCode">
        <t-input v-model:value="drawerFormData.roleCode" :placeholder="$t('views.system.role.placeholder.roleCode')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.role.sort')" name="sort">
        <t-input-number v-model:value="drawerFormData.sort" :min="0" />
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectStatus v-model:status="drawerFormData.status" />
      </t-form-item>
      <t-form-item :label="$t('common.description')" name="description">
        <t-textarea v-model:value="drawerFormData.description" :placeholder="$t('common.description')" />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" type="submit">{{ $t('common.confirm') }}</t-button>
      </t-form-item>
    </t-form>
  </t-drawer>

  <!-- 菜单权限管理 -->
  <t-dialog v-model:visible="showMenuModal" :header="editRoleTitle" width="500px">
    <div class="py-3 menu-list">
      <t-tree
        checkable
        :data="treeData"
        :keys="{ value: 'menuId', label: 'menuName', children: 'children' }"
        :expand-all="expandAll"
        :value="checkedKeys"
        value-mode="all"
        style="max-height: 450px; overflow: auto"
        @change="checkedTree"
      />
    </div>
    <template #footer>
      <t-space>
        <t-button variant="base" @click="expandHandle">
          {{ expandAll ? $t('views.system.role.unexpand') : $t('views.system.role.expand') }}
        </t-button>

        <t-button variant="base" @click="checkedAllHandle">
          {{ checkedAll ? $t('views.system.role.unselectAll') : $t('views.system.role.selectAll') }}
        </t-button>
        <t-button theme="primary" :loading="formBtnLoading" @click="confirmMenuForm">
          {{ $t('common.submit') }}
        </t-button>
      </t-space>
    </template>
  </t-dialog>
</template>

<script lang="ts" setup>
  import { addRole, changeRoleMenus, changeRoleStatus, editRole, getRoleList, getRoleMenuIds } from '@/api/system/role';
  import { Role, RoleMenus, RoleParams } from '@/models/role';
  import { formatDateTime } from '@/utils';
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { getMenus } from '@/api/system/menu';
  import { handleTree } from '@/utils/menu';
  import { Menu } from '@/models/menu';
  import { hasPermission } from '@/utils/permission';
  import { useI18n } from 'vue-i18n';
  import selectStatus from '@/components/select/select-status.vue';
  import {
    MessagePlugin,
    DialogPlugin,
    LoadingPlugin,
    Switch as TSwitch,
    Button as TButton,
    Icon as TIcon,
  } from 'tdesign-vue-next';

  const { t } = useI18n();

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

  const formRef = ref(null);
  const drawerFormRef = ref(null);

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
    roleName: [{ required: true, message: t('views.system.role.placeholder.roleName'), trigger: 'blur' }],
    roleCode: [{ required: true, message: t('views.system.role.placeholder.roleCode'), trigger: 'blur' }],
    status: [{ required: true, message: t('views.system.role.placeholder.status'), trigger: 'blur' }],
    sort: [{ type: 'number', required: true, message: t('views.system.role.placeholder.sort'), trigger: 'blur' }],
  };

  const queryFormData = ref({
    roleName: '',
    roleCode: '',
    status: null,
  });

  const columns = [
    {
      colKey: 'roleId',
      title: t('views.system.role.roleId'),
      type: 'multiple',
    },
    {
      colKey: 'roleName',
      title: t('views.system.role.roleName'),
      width: 120,
      ellipsis: true,
    },
    {
      colKey: 'roleCode',
      title: t('views.system.role.roleCode'),
      width: 120,
      ellipsis: true,
    },
    {
      colKey: 'sort',
      title: t('views.system.role.sort'),
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
          disabled: !hasPermission('system_role_edit'),
          loading: row.changing,
          onChange: () => handleChangeStatus(row, row.status),
        });
      },
    },
    {
      colKey: 'createdAt',
      title: t('views.system.role.createdAt'),
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
      width: 320,
    },
  ];

  const tableLoading = ref(true);
  const rowKey = 'roleId';

  const tableData = ref<Role[]>([]);
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
      const requestData: RoleParams = {
        ...queryFormData.value,
        page: page,
        pageSize,
      };

      const res = await getRoleList(requestData);
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
      roleName: '',
      roleCode: '',
      status: null,
    };
    pagination.value.current = 1;
    query(1, pagination.value.pageSize);
  };

  // 改变状态
  const handleChangeStatus = (row: any, status: number) => {
    row.changing = true;
    let text = t('common.disable');

    const role: Role = { roleId: '', roleName: '', roleCode: '', sort: 0, status: 0 };
    Object.assign(role, row);

    switch (status) {
      case 1:
        text = t('common.enable');
        role.status = 0;
        break;
      case 0:
        text = t('common.disable');
        role.status = 1;
        break;
      case -1:
        role.status = status;
        text = t('common.delete');
        break;
    }

    const confirmDialog = DialogPlugin.confirm({
      header: t('common.info'),
      body: t('views.system.role.confirmMessage', { action: text, user: row.roleName }),
      confirmBtn: t('common.confirm'),
      cancelBtn: t('common.cancel'),
      onConfirm: async () => {
        const res = await changeRoleStatus(role);
        if (res?.code === 0) {
          MessagePlugin.success(`${text}${t('common.success')}`);
          // 更新当前行的状态
          row.status = role.status;
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

  // 新增角色
  const handleAdd = async () => {
    drawerTitle.value = `${t('common.add')}${t('views.system.role.index')}`;
    showDrawer.value = true;
    drawerFormData.value = { ...roleInitData };
  };

  // 删除角色 status = -1
  const handleDelete = async (row: any) => {
    handleChangeStatus(row, -1);
  };

  // 修改角色
  const handleEdit = async (row: any) => {
    drawerTitle.value = `${t('common.edit')}${t('views.system.role.index')}`;
    showDrawer.value = true;
    drawerFormData.value = { ...roleInitData, ...row };
  };

  const handleAddandEdit = async ({ validateResult, firstError, e }) => {
    e.preventDefault();

    LoadingPlugin(true);
    if (validateResult === true) {
      const requestData: Role = drawerFormData.value;

      const res = drawerFormData.value.roleId ? await editRole(requestData) : await addRole(requestData);

      if (res?.code === 0) {
        showDrawer.value = false;
        drawerFormData.value = { ...roleInitData };
        query(pagination.value.current, pagination.value.pageSize);
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.error(t('common.validationFailed'));
    }

    LoadingPlugin(false);
  };

  // 分配菜单
  const handleMenu = async (row: any) => {
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
    MessagePlugin.success(t('common.success'));
    query(pagination.value.current, pagination.value.pageSize);
    formBtnLoading.value = false;
  };

  // 分配用户
  const handleUser = async (row: any) => {
    router.push({
      path: '/right/role/user/',
      query: { id: row.roleId },
    });
  };

  onMounted(async () => {
    getMenuTree();
    query(pagination.value.current, pagination.value.pageSize);
  });
</script>
