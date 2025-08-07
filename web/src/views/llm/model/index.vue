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
        <t-form-item name="modelName">
          <t-input v-model="queryFormData.modelName" :placeholder="$t('views.llm.model.placeholder.modelName')" />
        </t-form-item>

        <t-form-item name="modelType">
          <selectDict v-model:dict-code="queryFormData.modelType" :multiple="true" dict-type="LLM_TYPE" />
        </t-form-item>

        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" v-permission="['llm_model_index']">
              {{ $t('common.query') }}
            </t-button>
            <t-button theme="default" variant="base" type="reset">{{ $t('common.reset') }}</t-button>
          </t-space>
        </t-form-item>
      </t-form>

      <t-button v-permission="['llm_model_index']" theme="primary" @click="handleAdd">
        {{ $t('views.llm.model.add') }}
      </t-button>
    </div>
  </t-card>

  <!-- 列表 -->
  <div class="my-4">
    <t-row :gutter="[10, 10]">
      <t-col v-for="item in modelsData" :key="item.modelId" :xs="12" :sm="8" :md="6" :lg="4" :xl="3" class="h-48">
        <t-card
          size="small"
          class="w-full h-full flex flex-col"
          :title="item.modelName"
          :bordered="true"
          hoverShadow
          @click="handleEdit(item)"
        >
          <div class="flex-1 overflow-hidden text-sm text-gray-600 leading-relaxed">
            {{ item.description }}
          </div>
          <template #footer>
            <div class="text-center text-blue-600 hover:text-blue-800 transition-colors">
              {{ $t('views.llm.model.view') }}
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

  <!-- 新增修改模型 -->
  <t-drawer v-model:visible="showDrawer" size="599px" :header="drawerTitle" :footer="false">
    <t-form
      ref="drawerFormRef"
      :data="drawerFormData"
      :rules="drawerRules"
      label-align="right"
      :label-width="120"
      @submit="handleAddandEdit"
    >
      <t-form-item :label="$t('views.llm.model.name')" name="modelName">
        <t-input v-model="drawerFormData.modelName" :placeholder="$t('views.llm.model.placeholder.modelName')" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.model.description')" name="description">
        <t-textarea v-model="drawerFormData.description" :placeholder="$t('views.llm.model.placeholder.description')" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.model.type')" name="modelType">
        <selectDict
          v-model:dict-code="drawerFormData.modelType"
          v-model:dict-name="drawerFormData.modelTypeName"
          dict-type="LLM_TYPE"
        />
      </t-form-item>
      <t-form-item :label="$t('views.llm.model.apiType')" name="apiType">
        <selectDict v-model:dict-code="drawerFormData.apiType" dict-type="LLM_API_TYPE" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.model.baseUrl')" name="baseUrl">
        <t-input v-model="drawerFormData.baseUrl" :placeholder="$t('views.llm.model.placeholder.baseUrl')" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.model.apiKey')" name="apiKey">
        <t-input v-model="drawerFormData.apiKey" :placeholder="$t('views.llm.model.placeholder.apiKey')" />
      </t-form-item>
      <t-form-item :label="$t('views.llm.model.defaultEmbeddingModel')" name="defaultEmbeddingModel">
        <selectModel v-model:model-name="drawerFormData.defaultEmbeddingModel" model-type="EMBEDDING_LLM" />
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
  import { onMounted, ref } from 'vue';
  import selectDict from '@/components/select/select-dict.vue';
  import { addLlm, editLlm, getLlmList } from '@/api/llm/model';
  import { Llm } from '@/models/llm';
  import { LoadingPlugin, MessagePlugin } from 'tdesign-vue-next';
  import selectModel from '@/components/select/select-model.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const queryFormData = ref({
    modelName: '',
    modelType: '',
  });

  const modelsData = ref<Llm[]>([]);
  const page = ref<number>(1);
  const pageSize = ref<number>(10);
  const itemCount = ref(0);

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const formRef = ref(null);
  const drawerFormRef = ref(null);

  // 新增/修改弹窗数据初始化
  const modelInitData: Llm = {
    modelId: '',
    modelName: '',
    modelType: undefined,
    modelTypeName: '',
    baseUrl: '',
    apiKey: '',
    apiType: undefined,
    defaultEmbeddingModel: undefined,
    status: '0',
    description: '',
  };
  const drawerFormData = ref(modelInitData);

  const drawerRules = {
    modelName: [{ required: true, message: t('views.llm.model.placeholder.modelName'), trigger: 'blur' }],
    description: [{ required: true, message: t('views.llm.model.placeholder.description'), trigger: 'blur' }],
    modelType: [{ required: true, message: t('views.llm.model.placeholder.modelType'), trigger: 'blur' }],
    status: [{ required: true, message: t('views.llm.model.placeholder.status'), trigger: 'blur' }],
    sort: [{ required: true, type: 'number', message: t('views.llm.model.placeholder.status'), trigger: 'blur' }],
  };

  // 绑定表格数据
  const query = async (currentPage: number, currentPageSize = 10) => {
    try {
      const requestData = {
        ...queryFormData.value,
        page: currentPage,
        pageSize: currentPageSize,
      };

      const res = await getLlmList(requestData);
      if (res?.code === 0) {
        modelsData.value = res.data?.list;
        page.value = currentPage;
        pageSize.value = currentPageSize;
        itemCount.value = res.data.count;
      }
    } catch (err) {
      modelsData.value = [];
    }
  };

  const handleQuery = () => {
    query(page.value, pageSize.value);
  };

  const clearQuery = () => {
    queryFormData.value = {
      modelName: '',
      modelType: '',
    };
    query(page.value, pageSize.value);
  };

  const handlePageChange = (pageInfo: { current: number; pageSize: number }) => {
    query(pageInfo.current, pageInfo.pageSize);
  };

  // 新增
  const handleAdd = async () => {
    drawerTitle.value = t('views.llm.model.add');
    showDrawer.value = true;

    drawerFormData.value = { ...modelInitData };
  };

  // 修改
  const handleEdit = async (item: Llm) => {
    drawerTitle.value = t('views.llm.model.edit');
    showDrawer.value = true;

    // 赋值
    // 创建一个新的对象，包含 modelInitData 的属性和 item 的属性
    drawerFormData.value = { ...modelInitData, ...item, status: item.status.toString() };
  };

  const handleAddandEdit = async ({ validateResult, firstError, e }) => {
    e.preventDefault();

    LoadingPlugin(true);

    if (validateResult === true) {
      const requestData: Llm = drawerFormData.value;

      const res = drawerFormData.value.modelId ? await editLlm(requestData) : await addLlm(requestData);

      if (res?.code === 0) {
        showDrawer.value = false;
        drawerFormData.value = { ...modelInitData };
        query(page.value, pageSize.value);
      }
    } else {
      console.log('Validate Errors: ', firstError, validateResult);
      MessagePlugin.error(t('common.validationFailed'));
    }

    LoadingPlugin(false);
  };

  onMounted(async () => {
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
