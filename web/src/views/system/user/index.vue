<script lang="ts" setup>
  import { addUser, changeUserStatus, editUser, getUserList, resetPassword } from '@/api/system/user';
  import { User, UserParams } from '@/models/user';
  import { formatDateTime } from '@/utils';
  import { DataTableRowKey, FormInst, NButton, NSwitch, useDialog, useMessage } from 'naive-ui';
  import { h, onMounted, ref } from 'vue';
  import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@vicons/antd';
  import { getMenus } from '@/api/system/menu';
  import { handleTree } from '@/utils/menu';
  import { Menu } from '@/models/menu';
  import { RowData } from 'naive-ui/es/data-table/src/interface';
  import { renderIcon } from '@/utils/icons';
  import { hasPermission } from '@/utils/permission';
  import selectDict from '@/components/select/select-dict.vue';
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
  const userInitData: User = {
    userId: '',
    userName: '',
    nickName: '',
    password: '123456', //初始密码
    email: '',
    phone: '',
    sex: '',
    status: 0,
    description: '',
  };
  const drawerFormData = ref(userInitData);

  const drawerRules = {
    userName: { required: true, message: t('views.system.user.placeholder.userName'), trigger: 'blur' },
    nickName: { required: true, message: t('views.system.user.placeholder.nickName'), trigger: 'blur' },
    phone: { required: true, message: t('views.system.user.placeholder.phone'), trigger: 'blur' },
    email: { required: true, message: t('views.system.user.placeholder.email'), trigger: 'blur' },
    sex: { required: true, message: t('views.system.user.placeholder.sex'), trigger: 'blur' },
    status: { required: true, message: t('views.system.user.placeholder.status'), trigger: 'blur' },
  };

  const queryFormData = ref({
    userName: '',
    nickName: '',
    phone: '',
    status: null,
  });

  const showResetPwdModal = ref(false);
  const resetPwdData = ref({
    userId: '',
    userName: '',
    password: '',
  });

  const columns = [
    {
      key: 'userId',
      title: t('views.system.user.userId'),
      type: 'selection',
    },
    {
      key: 'userName',
      title: t('views.system.user.userName'),
      width: 100,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'nickName',
      title: t('views.system.user.nickName'),
      width: 100,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'phone',
      title: t('views.system.user.phone'),
      width: 100,
      ellipsis: {
        tooltip: true,
      },
    },
    {
      key: 'email',
      title: t('views.system.user.email'),
      width: 120,
      ellipsis: {
        tooltip: true,
      },
    },

    {
      key: 'status',
      title: t('views.system.user.status'),
      width: 60,
      align: 'center',
      fixed: 'left',
      render(row: RowData) {
        return h(NSwitch, {
          size: 'small',
          rubberBand: false,
          value: row['status'] === 0,
          disabled: !hasPermission('system_user_edit'),
          tableLoading: !!row.changing,
          onUpdateValue: () => handleChangeStatus(row),
        });
      },
    },
    {
      key: 'createdAt',
      title: t('views.system.user.createdAt'),
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
              disabled: !hasPermission('system_user_edit'),
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
              disabled: !hasPermission('system_user_delete'),
              onClick: () => handleDelete(row),
            },
            {
              default: () => t('common.delete'),
              icon: renderIcon(DeleteOutlined),
            },
          ),
          h(
            NButton,
            {
              size: 'small',
              type: 'info',
              style: 'margin-left: 10px;',
              disabled: !hasPermission('system_user_resetpwd'),
              onClick: () => handleResetPassword(row),
            },
            {
              default: () => t('views.system.user.resetPassword'),
              icon: renderIcon(ReloadOutlined),
            },
          ),
        ];
      },
    },
  ];

  const tableLoading = ref(true);
  const rowKey = (rowData: RowData) => {
    return rowData.userId;
  };
  const checkedRowKeysRef = ref<DataTableRowKey[]>([]);
  const tableData = ref<User[]>([]);
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
      const requestData: UserParams = {
        ...queryFormData.value,
        page: page,
        pageSize,
      };

      const res = await getUserList(requestData);
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
      userName: '',
      nickName: '',
      phone: '',
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

    const user: User = { ...userInitData };
    Object.assign(user, row);

    switch (row.status) {
      case 1:
        text = t('common.enable');
        user.status = 0;
        break;
      case 0:
        text = t('common.disable');
        user.status = 1;
        break;
      case -1:
        text = t('common.edit');
        break;
    }

    dialog.info({
      title: t('common.info'),
      content: t('views.system.user.confirmMessage', { action: text, user: row.userName }),
      positiveText: t('common.confirm'),
      negativeText: t('common.cancel'),
      onPositiveClick: async () => {
        const res = await changeUserStatus(user);
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

  // 新增用户
  const handleAdd = async () => {
    drawerTitle.value = `${t('common.add')}${t('views.system.user.index')}`;
    showDrawer.value = true;
    drawerFormData.value = { ...userInitData };
  };

  // 删除用户 status = -1
  const handleDelete = async (row: RowData) => {
    row.status = -1;
    handleChangeStatus(row);
  };

  // 修改用户
  const handleEdit = async (row: RowData) => {
    drawerTitle.value = `${t('common.edit')}${t('views.system.user.index')}`;
    showDrawer.value = true;

    // 赋值
    // 创建一个新的对象，包含 modelInitData 的属性和 item 的属性
    drawerFormData.value = { ...userInitData, ...row };
  };

  const handleAddandEdit = (e: MouseEvent) => {
    e.preventDefault();
    const messageReactive = message.loading('loading', {
      duration: 0,
    });
    drawerFormRef.value?.validate(async (errors) => {
      if (!errors) {
        const requestData: User = drawerFormData.value;

        const res = drawerFormData.value.userId ? await editUser(requestData) : await addUser(requestData);

        if (res?.code === 0) {
          showDrawer.value = false;
          drawerFormData.value = { ...userInitData };
          query(pagination.value.page, pagination.value.pageSize);
        }
      } else {
        console.log(errors);
        message.error(t('common.validationFailed'));
      }

      messageReactive.destroy();
    });
  };

  // 重置密码
  const handleResetPassword = async (row: RowData) => {
    resetPwdData.value.userName = row.userName;
    resetPwdData.value.userId = row.userId;

    showResetPwdModal.value = true;
  };

  // 提交重置密码
  const onResetPwd = async () => {
    const res = await resetPassword({
      userId: resetPwdData.value.userId,
      password: resetPwdData.value.password,
    });
    if (res?.code === 0) {
      showResetPwdModal.value = false;
      message.success(`${t('views.system.user.resetPassword')}${t('common.success')}`);
    }
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
        <n-form-item-gi :span="6" :label="$t('views.system.user.userName')" path="userName">
          <n-input v-model:value="queryFormData.userName" :placeholder="$t('views.system.user.placeholder.userName')" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" :label="$t('views.system.user.nickName')" path="nickName">
          <n-input v-model:value="queryFormData.nickName" :placeholder="$t('views.system.user.placeholder.nickName')" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" :label="$t('views.system.user.phone')" path="phone">
          <n-input v-model:value="queryFormData.phone" :placeholder="$t('views.system.user.placeholder.phone')" />
        </n-form-item-gi>
        <n-form-item-gi :span="6" :label="$t('views.system.user.status')" path="status">
          <selectStatus v-model:status="queryFormData.status" />
        </n-form-item-gi>
        <n-form-item-gi :span="6">
          <n-space>
            <n-button @click="clearQuery">{{ $t('common.reset') }}</n-button>
            <n-button v-permission="['system_user_query']" type="primary" @click="handleQuery">
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
        <n-button v-permission="['system_user_add']" type="primary" @click="handleAdd">
          <template #icon>
            <n-icon>
              <PlusOutlined />
            </n-icon>
          </template>
          {{ $t('views.system.user.add') }}
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

  <!-- 新增修改用户 -->
  <n-drawer v-model:show="showDrawer" :width="399">
    <n-drawer-content :title="drawerTitle" closable>
      <n-form
        ref="drawerFormRef"
        label-placement="left"
        label-width="auto"
        :model="drawerFormData"
        :rules="drawerRules"
      >
        <n-form-item :label="$t('views.system.user.userName')" path="userName">
          <n-input
            v-model:value="drawerFormData.userName"
            :placeholder="$t('views.system.user.placeholder.userName')"
          />
        </n-form-item>
        <n-form-item v-if="!drawerFormData.userId" :label="$t('views.system.user.password')" path="password">
          <n-input
            v-model:value="drawerFormData.password"
            type="password"
            show-password-on="click"
            :placeholder="$t('views.system.user.placeholder.password')"
          ></n-input>
        </n-form-item>
        <n-form-item :label="$t('views.system.user.nickName')" path="nickName">
          <n-input
            v-model:value="drawerFormData.nickName"
            :placeholder="$t('views.system.user.placeholder.nickName')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.system.user.email')" path="email">
          <n-input v-model:value="drawerFormData.email" :placeholder="$t('views.system.user.placeholder.email')" />
        </n-form-item>
        <n-form-item :label="$t('views.system.user.phone')" path="phone">
          <n-input v-model:value="drawerFormData.phone" :placeholder="$t('views.system.user.placeholder.phone')" />
        </n-form-item>
        <n-form-item :label="$t('views.system.user.sex')" path="sex">
          <selectDict v-model:dict-code="drawerFormData.sex" dict-type="SYS_SEX" />
        </n-form-item>
        <n-form-item :label="$t('views.system.user.status')" path="status">
          <selectStatus v-model:status="drawerFormData.status" />
        </n-form-item>
        <n-form-item :label="$t('views.system.user.description')" path="description">
          <n-input
            v-model:value="drawerFormData.description"
            type="textarea"
            :placeholder="$t('views.system.user.placeholder.description')"
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

  <!-- 重置密码对话框 -->
  <n-modal
    v-model:show="showResetPwdModal"
    :show-icon="false"
    preset="dialog"
    :title="`${$t('views.system.user.resetPassword')}: ${resetPwdData.userName}`"
  >
    <div>
      <div class="flex mb-3">{{ $t('views.system.user.resetPasswordInfo') }}</div>
      <n-input
        v-model="resetPwdData.password"
        class="flex mb-3"
        :placeholder="$t('views.system.user.placeholder.password')"
        type="password"
      />
      <n-button type="primary" @click="onResetPwd">{{ $t('common.submit') }}</n-button>
    </div>
  </n-modal>
</template>
