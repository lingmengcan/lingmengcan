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
      <t-form-item :label="$t('views.system.menu.menuName')" name="menuName">
        <t-input v-model:value="queryFormData.menuName" :placeholder="$t('views.system.menu.placeholder.menuName')" />
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectStatus v-model:status="queryFormData.status" />
      </t-form-item>
      <t-form-item>
        <t-space>
          <t-button type="reset">{{ $t('common.reset') }}</t-button>
          <t-button v-permission="['system_menu_query']" theme="primary" type="submit">
            {{ $t('common.query') }}
          </t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-card>

  <t-card :bordered="false" class="mt-4!">
    <div class="mb-2">
      <!--顶部左侧区域-->
      <div class="flex items-center">
        <t-button v-permission="['system_menu_add']" theme="primary" @click="handleAdd">
          <template #icon>
            <t-icon name="add" />
          </template>
          {{ $t('views.system.menu.add') }}
        </t-button>
      </div>
    </div>
    <div>
      <t-enhanced-table
        ref="table"
        bordered
        hover
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
        :row-key="rowKey"
        :tree="{ childrenKey: 'children', treeNodeColumnIndex: 1, indent: 24, checkStrictly: true }"
        :expand-tree-node="true"
      >
        <template #operation="{ row }">
          <t-space size="small">
            <t-button
              size="small"
              variant="base"
              theme="default"
              :disabled="!hasPermission('system_menu_add')"
              @click="handleSubAdd(row.menuId)"
            >
              <template #icon>
                <t-icon name="folder-add" />
              </template>
              {{ $t('views.system.menu.newSubMenu') }}
            </t-button>

            <t-button
              size="small"
              theme="primary"
              :disabled="!hasPermission('system_menu_edit')"
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
              :disabled="!hasPermission('system_menu_delete')"
              @click="handleDelete(row)"
            >
              <template #icon>
                <t-icon name="delete" />
              </template>
              {{ $t('common.delete') }}
            </t-button>
          </t-space>
        </template>
      </t-enhanced-table>
    </div>
  </t-card>

  <!-- 新增修改菜单 -->
  <t-drawer v-model:visible="showDrawer" size="600px" :footer="false">
    <template #header>{{ drawerTitle }}</template>
    <t-form
      ref="drawerFormRef"
      :label-width="120"
      :data="drawerFormData"
      :rules="drawerRules"
      @submit="handleAddandEdit"
    >
      <t-form-item :label="$t('views.system.menu.parentMenu')" name="parentId">
        <t-tree-select
          v-model:value="drawerFormData.parentId"
          :data="treeMenus"
          :keys="{ value: 'menuId', label: 'menuName', children: 'children' }"
        />
      </t-form-item>
      <t-form-item :label="$t('views.system.menu.menuType')" name="menuType">
        <t-radio-group v-model:value="drawerFormData.menuType">
          <t-radio v-for="item in typeOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </t-radio>
        </t-radio-group>
      </t-form-item>
      <t-form-item :label="$t('views.system.menu.icon')" name="icon">
        <SelectIcon v-model:value="drawerFormData.icon" @selected="onSelectedIcon" />
      </t-form-item>
      <t-form-item :label="$t('views.system.menu.menuName')" name="menuName">
        <t-input v-model:value="drawerFormData.menuName" :placeholder="$t('views.system.menu.placeholder.menuName')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.menu.menuCode')" name="menuCode">
        <t-input v-model:value="drawerFormData.menuCode" :placeholder="$t('views.system.menu.placeholder.menuCode')" />
      </t-form-item>
      <t-form-item :label="$t('views.system.menu.sort')" name="sort">
        <t-input-number v-model:value="drawerFormData.sort" :min="0" />
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectStatus v-model:status="drawerFormData.status" />
      </t-form-item>
      <t-form-item v-if="drawerFormData.menuType !== 'action'" :label="$t('views.system.menu.path')" name="path">
        <t-input v-model:value="drawerFormData.path" :placeholder="$t('views.system.menu.placeholder.path')" />
      </t-form-item>
      <t-form-item
        v-if="drawerFormData.menuType === 'contents'"
        :label="$t('views.system.menu.redirect')"
        name="redirect"
      >
        <t-input v-model:value="drawerFormData.redirect" :placeholder="$t('views.system.menu.placeholder.redirect')" />
      </t-form-item>
      <t-form-item v-if="drawerFormData.menuType === 'button'" :label="$t('views.system.menu.query')" name="query">
        <t-input v-model:value="drawerFormData.query" :placeholder="$t('views.system.menu.placeholder.query')" />
      </t-form-item>
      <t-form-item
        v-if="drawerFormData.menuType !== 'button'"
        :label="$t('views.system.menu.component')"
        name="component"
      >
        <t-input
          v-model:value="drawerFormData.component"
          :placeholder="$t('views.system.menu.placeholder.component')"
        />
      </t-form-item>
      <t-form-item
        v-if="drawerFormData.menuType !== 'button'"
        :label="$t('views.system.menu.permissions')"
        name="permissions"
      >
        <t-input
          v-model:value="drawerFormData.permissions"
          :placeholder="$t('views.system.menu.placeholder.permissions')"
        />
      </t-form-item>
      <t-form-item :label="$t('views.system.menu.cached')" name="cached">
        <t-switch v-model:value="drawerFormData.cached" />
      </t-form-item>
      <t-form-item :label="$t('views.system.menu.hidden')" name="hidden">
        <t-switch v-model:value="drawerFormData.hidden" />
      </t-form-item>
      <t-form-item :label="$t('views.system.menu.description')">
        <t-textarea
          v-model:value="drawerFormData.description"
          :placeholder="$t('views.system.menu.placeholder.description')"
        />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" type="submit">{{ $t('common.submit') }}</t-button>
      </t-form-item>
    </t-form>
  </t-drawer>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import selectStatus from '@/components/select/select-status.vue';
  import SelectIcon from '@/components/select/select-icon.vue';
  import { formatDateTime } from '@/utils';
  import { Menu, MenuParams } from '@/models/menu';
  import { addMenu, deleteMenu, editMenu, getMenuList, getMenus } from '@/api/system/menu';
  import { handleTree } from '@/utils/menu';
  import { hasPermission } from '@/utils/permission';
  import { useI18n } from 'vue-i18n';
  import {
    MessagePlugin,
    DialogPlugin,
    LoadingPlugin,
    Tag as TTag,
    Button as TButton,
    Icon as TIcon,
  } from 'tdesign-vue-next';

  const { t } = useI18n();

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const formRef = ref(null);
  const drawerFormRef = ref(null);

  const queryFormData = ref({
    menuName: '',
    status: null,
  });

  const columns = [
    {
      colKey: 'menuId',
      type: 'multiple',
    },
    {
      colKey: 'menuName',
      title: t('views.system.menu.menuName'),
      width: 200,
    },
    {
      colKey: 'icon',
      title: t('views.system.menu.icon'),
      width: 70,
      cell: (h: any, { row }: any) => {
        return row.icon ? h(TIcon, { name: row.icon, size: '20px' }) : null;
      },
    },
    {
      colKey: 'sort',
      title: t('views.system.menu.sort'),
      width: 50,
    },
    {
      colKey: 'permissions',
      title: t('views.system.menu.permissions'),
      width: 120,
      ellipsis: true,
    },
    {
      colKey: 'component',
      title: t('views.system.menu.component'),
      width: 80,
      ellipsis: true,
    },
    {
      colKey: 'status',
      title: t('common.status'),
      width: 50,
      align: 'center',
      fixed: 'left',
      cell: (h: any, { row }: any) => {
        return h(
          TTag,
          {
            theme: 'primary',
            variant: 'light',
          },
          {
            default: () => (row['status'] === 0 ? t('common.enable') : t('common.disable')),
          },
        );
      },
    },
    {
      colKey: 'createdAt',
      title: t('views.system.menu.createdAt'),
      width: 130,
      cell: (h: any, { row }: any) => {
        return h('span', formatDateTime(row['createdAt']));
      },
    },
    {
      colKey: 'operation',
      title: t('common.table.actions'),
      align: 'center',
      fixed: 'right',
      width: 240,
    },
  ];

  const tableLoading = ref(true);
  const rowKey = 'menuId';
  const tableData = ref<Menu[]>([]);

  // 新增/修改弹窗数据初始化
  const menuInitData = {
    menuId: '',
    parentId: '',
    menuType: 'contents',
    menuName: '',
    menuCode: '',
    icon: '',
    status: 0,
    hidden: false,
    cached: false,
    sort: 0,
    permissions: '',
    path: '',
    query: '',
    redirect: '',
    component: '',
    description: '',
  };

  const drawerFormData = ref(menuInitData);
  const drawerRules = {
    menuName: [{ required: true, message: t('views.system.menu.placeholder.menuName'), trigger: 'blur' }],
    sort: [{ type: 'number', required: true, message: t('views.system.menu.placeholder.sort'), trigger: 'blur' }],
  };

  // 状态 type options
  const typeOptions = ref([
    { label: t('views.system.menu.contents'), value: 'contents' },
    { label: t('views.system.menu.menu'), value: 'menu' },
    { label: t('views.system.menu.action'), value: 'action' },
  ]);

  const treeMenus = ref<Menu[]>([]);

  // 查询菜单下拉树结构
  const getTreeselect = () => {
    getMenus().then((response) => {
      treeMenus.value = [];
      const menu: Menu = { menuId: '0', menuName: '根菜单', children: [] };
      menu.children = handleTree(response.data, 'menuId');
      treeMenus.value.push(menu);
    });
  };

  function onSelectedIcon(item: string) {
    drawerFormData.value.icon = item;
  }

  // 绑定表格数据
  const query = async () => {
    try {
      tableLoading.value = true;
      const requestData: MenuParams = {
        ...queryFormData.value,
      };

      const res = await getMenuList(requestData);

      if (res?.code === 0) {
        const treeData = handleTree(res.data, 'menuId', 'parentId');
        tableData.value = treeData;
      }
    } catch (err) {
      tableData.value = [];
    }
    tableLoading.value = false;
  };

  const handleQuery = () => {
    query();
  };

  const clearQuery = () => {
    queryFormData.value = {
      menuName: '',
      status: null,
    };
    query();
  };

  // 新增菜单
  const handleAdd = async () => {
    getTreeselect();

    drawerTitle.value = t('views.system.menu.add');
    showDrawer.value = true;
    drawerFormData.value = { ...menuInitData };
  };

  // 新增子菜单
  const handleSubAdd = async (menuId: string) => {
    getTreeselect();

    drawerTitle.value = t('views.system.menu.add');
    showDrawer.value = true;
    drawerFormData.value = { ...menuInitData };
    drawerFormData.value.parentId = menuId;
  };

  // 删除菜单
  const handleDelete = async (row: any) => {
    const confirmDialog = DialogPlugin.confirm({
      header: t('common.info'),
      body: t('views.system.menu.confirmMessage', { menu: row.menuName }),
      confirmBtn: t('common.confirm'),
      cancelBtn: t('common.cancel'),
      onConfirm: async () => {
        const res = await deleteMenu(row.menuId);
        if (res?.code === 0) {
          MessagePlugin.success(`${t('common.delete')}${t('common.success')}`);
        } else {
          MessagePlugin.warning(res.message);
        }
        row.changing = false;
        await query();
        confirmDialog.hide();
      },
      onClose: () => {
        row.changing = false;
        confirmDialog.hide();
      },
    });
  };

  // 修改菜单
  const handleEdit = async (row: any) => {
    getTreeselect();

    drawerTitle.value = `${t('common.edit')}${t('views.system.menu.index')}`;
    showDrawer.value = true;
    drawerFormData.value = {
      menuId: row.menuId,
      parentId: row.parentId,
      menuType: row.menuType,
      menuName: row.menuName,
      menuCode: row.menuCode,
      icon: row.icon,
      hidden: row.hidden === 1,
      cached: row.cached === 1,
      permissions: row.permissions,
      path: row.path,
      query: row.query,
      redirect: row.redirect,
      component: row.component,
      status: row.status,
      sort: row.sort,
      description: row.description,
    };
  };

  const handleAddandEdit = async ({ validateResult, firstError, e }) => {
    e.preventDefault();

    LoadingPlugin(true);
    if (validateResult === true) {
      const requestData: Menu = {
        ...drawerFormData.value,
      };

      const res = drawerFormData.value.menuId ? await editMenu(requestData) : await addMenu(requestData);

      if (res?.code === 0) {
        showDrawer.value = false;
        drawerFormData.value = { ...menuInitData };
        query();
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.error(t('common.validationFailed'));
    }

    LoadingPlugin(false);
  };

  onMounted(async () => {
    await query();
  });
</script>
