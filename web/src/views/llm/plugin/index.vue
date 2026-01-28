<template>
  <t-card :bordered="false">
    <div class="flex justify-between items-center">
      <t-form
        ref="formRef"
        layout="inline"
        :label-width="0"
        :data="queryFormData"
        @submit="handleQuery"
        @reset="clearQuery"
      >
        <t-form-item name="pluginName">
          <t-input v-model="queryFormData.pluginName" :placeholder="$t('views.llm.plugin.placeholder.pluginName')" />
        </t-form-item>

        <t-form-item name="pluginType">
          <selectDict v-model:dict-code="queryFormData.pluginType" :multiple="true" dict-type="PLUGIN_TYPE" />
        </t-form-item>

        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" v-permission="['llm_plugin_index']">
              {{ $t('common.query') }}
            </t-button>
            <t-button theme="default" variant="base" type="reset">{{ $t('common.reset') }}</t-button>
          </t-space>
        </t-form-item>
      </t-form>

      <t-button v-permission="['llm_plugin_index']" theme="primary" @click="handleAdd">
        {{ $t('views.llm.plugin.add') }}
      </t-button>
    </div>
  </t-card>

  <!-- 插件分类标签 -->
  <div class="my-4">
    <t-tabs v-model="activeTab">
      <t-tab-panel :value="'all'" :label="$t('views.llm.plugin.all')"></t-tab-panel>
      <t-tab-panel
        v-for="category in categories"
        :key="category.code"
        :value="category.code"
        :label="category.name"
      ></t-tab-panel>
    </t-tabs>
  </div>

  <!-- 插件列表 -->
  <div class="my-4">
    <t-row :gutter="[10, 10]">
      <t-col v-for="item in pluginsData" :key="item.pluginId" :xs="12" :sm="8" :md="6" :lg="4" :xl="3" class="h-48">
        <t-card
          size="small"
          class="w-full h-full flex flex-col"
          :title="item.pluginName"
          :bordered="true"
          hoverShadow
          @click="handleEdit(item)"
        >
          <div class="flex-1 overflow-hidden text-sm text-gray-600 leading-relaxed">
            {{ item.description }}
          </div>
          <template #footer>
            <div class="flex justify-between items-center">
              <t-tag theme="primary" variant="light" size="small">{{ item.pluginTypeName }}</t-tag>
              <div class="text-blue-600 hover:text-blue-800 transition-colors">
                {{ $t('views.llm.plugin.view') }}
              </div>
            </div>
          </template>
        </t-card>
      </t-col>
    </t-row>
  </div>

  <t-pagination
    v-model="page"
    :page-size="pageSize"
    :total="itemCount"
    show-jumper
    @change="handlePageChange"
  ></t-pagination>

  <!-- 新增修改插件 -->
  <t-drawer v-model:visible="showDrawer" size="599px" :header="drawerTitle" :footer="false">
    <t-form
      ref="drawerFormRef"
      :data="drawerFormData"
      :rules="drawerRules"
      label-align="right"
      :label-width="120"
      @submit="handleAddandEdit"
    >
      <t-form-item :label="$t('views.llm.plugin.name')" name="pluginName">
        <t-input v-model="drawerFormData.pluginName" :placeholder="$t('views.llm.plugin.placeholder.pluginName')" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.plugin.description')" name="description">
        <t-textarea
          v-model="drawerFormData.description"
          :placeholder="$t('views.llm.plugin.placeholder.description')"
        />
      </t-form-item>
      <t-form-item :label="$t('views.llm.plugin.type')" name="pluginType">
        <selectDict
          v-model:dict-code="drawerFormData.pluginType"
          v-model:dict-name="drawerFormData.pluginTypeName"
          dict-type="PLUGIN_TYPE"
        />
      </t-form-item>
      <t-form-item :label="$t('views.llm.plugin.icon')" name="icon">
        <t-input v-model="drawerFormData.icon" :placeholder="$t('views.llm.plugin.placeholder.icon')" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.plugin.version')" name="version">
        <t-input v-model="drawerFormData.version" :placeholder="$t('views.llm.plugin.placeholder.version')" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.plugin.author')" name="author">
        <t-input v-model="drawerFormData.author" :placeholder="$t('views.llm.plugin.placeholder.author')" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.plugin.config')" name="config">
        <div style="width: 100%">
          <!-- 编辑模式 -->
          <t-textarea
            v-model="drawerFormData.config"
            :placeholder="$t('views.llm.plugin.placeholder.config')"
            :autosize="{ minRows: 6, maxRows: 10 }"
            class="font-mono text-sm"
            @focus="formatJsonConfig"
          />

          <div class="mt-2 text-xs text-gray-500">提示：请输入有效的JSON格式配置</div>
        </div>
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectDict v-model:dict-code="drawerFormData.status" dict-type="SYS_STATUS" />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" type="submit">{{ $t('common.confirm') }}</t-button>
      </t-form-item>
    </t-form>
  </t-drawer>
</template>

<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import selectDict from '@/components/select/select-dict.vue';
  import { LoadingPlugin, MessagePlugin } from 'tdesign-vue-next';
  import { useI18n } from 'vue-i18n';
  import { Plugin } from '@/models/plugin';
  import { getPluginList, addPlugin, editPlugin } from '@/api/llm/plugin';
  import { useDictStore } from '@/store/modules/dict';

  const { t } = useI18n();

  // 查询表单数据
  const queryFormData = ref({
    pluginName: '',
    pluginType: '',
  });

  // 标签页切换
  const activeTab = ref('all');

  // 插件分类数据
  const categories = ref<Array<{ code: string; name: string }>>([]);

  // 插件数据
  const pluginsData = ref<Plugin[]>([]);
  const page = ref<number>(1);
  const pageSize = ref<number>(10);
  const itemCount = ref(0);

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const formRef = ref(null);
  const drawerFormRef = ref(null);

  // 新增/修改弹窗数据初始化
  const pluginInitData: Plugin = {
    pluginId: '',
    pluginName: '',
    pluginType: undefined,
    pluginTypeName: '',
    icon: '',
    version: '1.0.0',
    author: '',
    config: '',
    status: 0,
    description: '',
    createdUser: '',
    updatedUser: '',
  };
  const drawerFormData = ref<Plugin>({ ...pluginInitData });

  const drawerRules = {
    pluginName: [{ required: true, message: t('views.llm.plugin.placeholder.pluginName'), trigger: 'blur' }],
    description: [{ required: true, message: t('views.llm.plugin.placeholder.description'), trigger: 'blur' }],
    pluginType: [{ required: true, message: t('views.llm.plugin.placeholder.pluginType'), trigger: 'blur' }],
    status: [{ required: true, message: t('views.llm.plugin.placeholder.status'), trigger: 'blur' }],
  };

  // 绑定表格数据
  const query = async (currentPage: number, currentPageSize = 10) => {
    try {
      // 使用真实API调用获取数据
      const res = await getPluginList({
        pluginName: queryFormData.value.pluginName,
        pluginType: queryFormData.value.pluginType,
        page: currentPage,
        pageSize: currentPageSize,
      });

      // 处理API返回的数据
      if (res && res.data) {
        pluginsData.value = res.data.list || [];
        itemCount.value = res.data.total || 0;
        page.value = currentPage;
        pageSize.value = currentPageSize;
      }

      // 如果需要根据标签页进行本地过滤
      if (activeTab.value !== 'all') {
        pluginsData.value = pluginsData.value.filter((item) => item.pluginType === activeTab.value);
      }
    } catch (err) {
      pluginsData.value = [];
    }
  };

  const handleQuery = () => {
    query(page.value, pageSize.value);
  };

  const clearQuery = () => {
    queryFormData.value = {
      pluginName: '',
      pluginType: '',
    };
    query(page.value, pageSize.value);
  };

  const handlePageChange = (pageInfo: { current: number; pageSize: number }) => {
    query(pageInfo.current, pageInfo.pageSize);
  };

  // 新增
  const handleAdd = async () => {
    drawerTitle.value = t('views.llm.plugin.add');
    showDrawer.value = true;

    drawerFormData.value = { ...pluginInitData };
  };

  // 修改
  const handleEdit = async (item: Plugin) => {
    drawerTitle.value = t('views.llm.plugin.edit');
    showDrawer.value = true;

    // 赋值，确保 config 是字符串格式
    const configStr = typeof item.config === 'object' 
      ? JSON.stringify(item.config, null, 2) 
      : (item.config || '');
    drawerFormData.value = { ...pluginInitData, ...item, config: configStr };
  };

  const handleAddandEdit = async ({ validateResult, firstError, e }) => {
    e.preventDefault();

    LoadingPlugin(true);

    if (validateResult === true) {
      const requestData = drawerFormData.value;

      // 确保状态是数字类型
      if (typeof requestData.status === 'string') {
        requestData.status = parseInt(requestData.status as string, 10);
      }

      try {
        // 使用实际API调用
        const res = drawerFormData.value.pluginId ? await editPlugin(requestData) : await addPlugin(requestData);

        if (res?.code === 0) {
          showDrawer.value = false;
          drawerFormData.value = { ...pluginInitData };
          query(page.value, pageSize.value);
          MessagePlugin.success(t('common.operationSuccess'));
        } else {
          MessagePlugin.error(res?.message || t('common.operationFailed'));
        }
      } catch (error) {
        console.error('API调用失败:', error);
        MessagePlugin.error(t('common.operationFailed'));
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.error(t('common.validationFailed'));
    }

    LoadingPlugin(false);
  };

  // 格式化JSON配置
  const formatJsonConfig = () => {
    if (drawerFormData.value.config) {
      try {
        // 如果已经是对象，直接格式化；如果是字符串，先解析
        const parsed = typeof drawerFormData.value.config === 'object'
          ? drawerFormData.value.config
          : JSON.parse(drawerFormData.value.config);
        drawerFormData.value.config = JSON.stringify(parsed, null, 2);
      } catch (error) {
        MessagePlugin.error('JSON格式错误，无法格式化');
        console.warn('配置不是有效的JSON格式:', error);
      }
    }
  };

  // 获取插件分类数据
  const loadCategories = async () => {
    try {
      const dictArray = await useDictStore().getDictListByType('PLUGIN_TYPE');
      categories.value = dictArray.map((item) => ({
        code: item.dictCode,
        name: item.dictName,
      }));
    } catch (error) {
      console.error('获取插件分类失败:', error);
    }
  };

  // 监听标签页变化
  watch(activeTab, () => {
    query(1, pageSize.value);
  });

  onMounted(async () => {
    await loadCategories();
    query(page.value, pageSize.value);
  });
</script>

<style scoped>
  /* 确保卡片内容区域正确布局 */
  :deep(.t-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
