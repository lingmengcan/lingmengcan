<script lang="ts" setup>
  import { addUser, changeUserStatus, editUser, getUserList, resetPassword } from '@/api/system/user';
  import { User, UserParams } from '@/models/user';
  import { formatDateTime } from '@/utils';
  import { onMounted, ref } from 'vue';
  import { hasPermission } from '@/utils/permission';
  import selectDict from '@/components/select/select-dict.vue';
  import selectStatus from '@/components/select/select-status.vue';
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

  const formRef = ref(null);
  const drawerFormRef = ref(null);

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
    userName: [{ required: true, message: t('views.system.user.placeholder.userName'), trigger: 'blur' }],
    nickName: [{ required: true, message: t('views.system.user.placeholder.nickName'), trigger: 'blur' }],
    phone: [{ required: true, message: t('views.system.user.placeholder.phone'), trigger: 'blur' }],
    email: [{ required: true, message: t('views.system.user.placeholder.email'), trigger: 'blur' }],
    sex: [{ required: true, message: t('views.system.user.placeholder.sex'), trigger: 'blur' }],
    status: [{ required: true, message: t('views.system.user.placeholder.status'), trigger: 'blur' }],
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
      colKey: 'userId',
      type: 'multiple',
    },
    {
      colKey: 'userName',
      title: t('views.system.user.userName'),
      width: 100,
      ellipsis: true,
    },
    {
      colKey: 'nickName',
      title: t('views.system.user.nickName'),
      width: 100,
      ellipsis: true,
    },
    {
      colKey: 'phone',
      title: t('views.system.user.phone'),
      width: 100,
      ellipsis: true,
    },
    {
      colKey: 'email',
      title: t('views.system.user.email'),
      width: 120,
      ellipsis: true,
    },
    {
      colKey: 'status',
      title: t('views.system.user.status'),
      width: 60,
      align: 'center',
      fixed: 'left',
      cell: (h: any, { row }: any) => {
        return h(TSwitch, {
          size: 'small',
          modelValue: row['status'] === 0,
          disabled: !hasPermission('system_user_edit'),
          loading: row.changing,
          onChange: () => handleChangeStatus(row, row.status),
        });
      },
    },
    {
      colKey: 'createdAt',
      title: t('views.system.user.createdAt'),
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
  const rowKey = 'userId';

  const tableData = ref<User[]>([]);
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
      const requestData: UserParams = {
        ...queryFormData.value,
        page: page,
        pageSize,
      };

      const res = await getUserList(requestData);
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

  const handleQuery = () => {
    query(pagination.value.current, pagination.value.pageSize);
  };

  const clearQuery = () => {
    queryFormData.value = {
      userName: '',
      nickName: '',
      phone: '',
      status: null,
    };
    pagination.value.current = 1;
    query(1, pagination.value.pageSize);
  };

  // 改变状态
  const handleChangeStatus = (row: any, status: number) => {
    row.changing = true;
    let text = t('common.disable');

    const user: User = { ...userInitData };
    Object.assign(user, row);

    switch (status) {
      case 1:
        text = t('common.enable');
        user.status = 0;
        break;
      case 0:
        text = t('common.disable');
        user.status = 1;
        break;
      case -1:
        user.status = status;
        text = t('common.delete');
        break;
    }

    const confirmDialog = DialogPlugin.confirm({
      header: t('common.info'),
      body: t('views.system.user.confirmMessage', { action: text, user: row.userName }),
      confirmBtn: t('common.confirm'),
      cancelBtn: t('common.cancel'),
      onConfirm: async () => {
        const res = await changeUserStatus(user);
        if (res?.code === 0) {
          MessagePlugin.success(`${text}${t('common.success')}`);
          // 更新当前行的状态
          row.status = user.status;
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

  // 新增用户
  const handleAdd = async () => {
    drawerTitle.value = `${t('common.add')}${t('views.system.user.index')}`;
    showDrawer.value = true;
    drawerFormData.value = { ...userInitData };
  };

  // 删除用户 status = -1
  const handleDelete = async (row: any) => {
    handleChangeStatus(row, -1);
  };

  // 修改用户
  const handleEdit = async (row: any) => {
    drawerTitle.value = `${t('common.edit')}${t('views.system.user.index')}`;
    showDrawer.value = true;

    // 赋值
    // 创建一个新的对象，包含 modelInitData 的属性和 item 的属性
    drawerFormData.value = { ...userInitData, ...row };
  };

  const handleAddandEdit = async ({ validateResult, firstError, e }) => {
    e.preventDefault();

    LoadingPlugin(true);
    if (validateResult === true) {
      const requestData: User = drawerFormData.value;

      const res = drawerFormData.value.userId ? await editUser(requestData) : await addUser(requestData);

      if (res?.code === 0) {
        showDrawer.value = false;
        drawerFormData.value = { ...userInitData };
        query(pagination.value.current, pagination.value.pageSize);
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.error(t('common.validationFailed'));
    }

    LoadingPlugin(false);
  };

  // 重置密码
  const handleResetPassword = async (row: any) => {
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
      MessagePlugin.success(`${t('views.system.user.resetPassword')}${t('common.success')}`);
    }
  };

  onMounted(async () => {
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
      <t-form-item :label="$t('views.system.user.userName')" name="userName">
        <t-input v-model:value="queryFormData.userName" :placeholder="$t('views.system.user.placeholder.userName')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.nickName')" name="nickName">
        <t-input v-model:value="queryFormData.nickName" :placeholder="$t('views.system.user.placeholder.nickName')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.phone')" name="phone">
        <t-input v-model:value="queryFormData.phone" :placeholder="$t('views.system.user.placeholder.phone')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.status')" name="status">
        <selectStatus v-model:status="queryFormData.status" />
      </t-form-item>
      <t-form-item>
        <t-space>
          <t-button type="reset">{{ $t('common.reset') }}</t-button>
          <t-button v-permission="['system_user_query']" theme="primary" type="submit">
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
        <t-button v-permission="['system_user_add']" theme="primary" @click="handleAdd">
          <template #icon>
            <t-icon name="add" />
          </template>
          {{ $t('views.system.user.add') }}
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
              :disabled="!hasPermission('system_user_edit')"
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
              :disabled="!hasPermission('system_user_delete')"
              @click="handleDelete(row)"
            >
              <template #icon>
                <t-icon name="delete" />
              </template>
              {{ $t('common.delete') }}
            </t-button>

            <t-button
              size="small"
              theme="default"
              :disabled="!hasPermission('system_user_resetpwd')"
              @click="handleResetPassword(row)"
            >
              <template #icon>
                <t-icon name="refresh" />
              </template>
              {{ $t('views.system.user.resetPassword') }}
            </t-button>
          </t-space>
        </template>
      </t-table>
    </div>
  </t-card>

  <!-- 新增修改用户 -->
  <t-drawer v-model:visible="showDrawer" size="399px" :footer="false">
    <template #header>{{ drawerTitle }}</template>
    <t-form
      ref="drawerFormRef"
      :label-width="120"
      :data="drawerFormData"
      :rules="drawerRules"
      @submit="handleAddandEdit"
    >
      <t-form-item :label="$t('views.system.user.userName')" name="userName">
        <t-input v-model:value="drawerFormData.userName" :placeholder="$t('views.system.user.placeholder.userName')" />
      </t-form-item>
      <t-form-item v-if="!drawerFormData.userId" :label="$t('views.system.user.password')" name="password">
        <t-input
          v-model:value="drawerFormData.password"
          type="password"
          :placeholder="$t('views.system.user.placeholder.password')"
        />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.nickName')" name="nickName">
        <t-input v-model:value="drawerFormData.nickName" :placeholder="$t('views.system.user.placeholder.nickName')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.email')" name="email">
        <t-input v-model:value="drawerFormData.email" :placeholder="$t('views.system.user.placeholder.email')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.phone')" name="phone">
        <t-input v-model:value="drawerFormData.phone" :placeholder="$t('views.system.user.placeholder.phone')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.sex')" name="sex">
        <selectDict v-model:dict-code="drawerFormData.sex" dict-type="SYS_SEX" />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.status')" name="status">
        <selectStatus v-model:status="drawerFormData.status" />
      </t-form-item>
      <t-form-item :label="$t('views.system.user.description')" name="description">
        <t-textarea
          v-model:value="drawerFormData.description"
          :placeholder="$t('views.system.user.placeholder.description')"
        />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" type="submit">{{ $t('common.confirm') }}</t-button>
      </t-form-item>
    </t-form>
  </t-drawer>

  <!-- 重置密码对话框 -->
  <t-dialog
    v-model:visible="showResetPwdModal"
    :header="`${$t('views.system.user.resetPassword')}: ${resetPwdData.userName}`"
    :footer="false"
  >
    <div>
      <div class="flex mb-3">{{ $t('views.system.user.resetPasswordInfo') }}</div>
      <t-input
        v-model:value="resetPwdData.password"
        class="flex mb-3"
        :placeholder="$t('views.system.user.placeholder.password')"
        type="password"
      />
      <t-button theme="primary" @click="onResetPwd">{{ $t('common.submit') }}</t-button>
    </div>
  </t-dialog>
</template>
