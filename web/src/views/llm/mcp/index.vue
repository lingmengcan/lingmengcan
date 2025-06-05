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
          <t-input v-model:value="queryFormData.modelName" :placeholder="$t('views.llm.model.placeholder.modelName')" />
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

  <!-- mcp列表 -->
  <!-- mcp列表 -->
  <div class="mt-4 mb-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <div v-for="item in modelsData" :key="item.modelId" class="list-card-item h-full">
        <t-card
          :bordered="false"
          class="w-full h-full flex flex-col"
          :title="item.modelName"
          hover-shadow
          @click="handleEdit(item)"
        >
          <template #content>
            <div class="grow h-full">{{ item.description }}</div>
          </template>
          <template #footer>
            <div class="text-center border-t border-gray-200 pt-2">{{ $t('views.llm.model.view') }}</div>
          </template>
        </t-card>
      </div>
    </div>
  </div>
  <t-pagination
    v-model:page="page"
    :page-size="pageSize"
    :item-count="itemCount"
    class="justify-end"
    show-quick-jumper
    show-size-picker
    @update:page="handlePageChange"
  >
    <template #prefix="{}">{{ itemCount }} {{ $t('common.paginationItemCount') }}</template>
  </t-pagination>

  <!-- 新增修改模型 -->
  <!-- <t-drawer v-model:show="showDrawer" :width="599">
    <t-drawer-content :title="drawerTitle" closable>
      <t-form
        ref="drawerFormRef"
        label-placement="left"
        label-width="auto"
        :model="drawerFormData"
        :rules="drawerRules"
      >
        <t-form-item :label="$t('views.llm.model.name')" name="modelName">
          <t-input
            v-model:value="drawerFormData.modelName"
            :placeholder="$t('views.llm.model.placeholder.modelName')"
          />
        </t-form-item>
        <t-form-item :label="$t('views.llm.model.description')" name="description">
          <t-input
            v-model:value="drawerFormData.description"
            type="textarea"
            :placeholder="$t('views.llm.model.placeholder.description')"
          />
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
          <t-input v-model:value="drawerFormData.baseUrl" :placeholder="$t('views.llm.model.placeholder.baseUrl')" />
        </t-form-item>
        <t-form-item :label="$t('views.llm.model.apiKey')" name="apiKey">
          <t-input v-model:value="drawerFormData.apiKey" :placeholder="$t('views.llm.model.placeholder.apiKey')" />
        </t-form-item>
        <t-form-item :label="$t('views.llm.model.defaultEmbeddingModel')" name="defaultEmbeddingModel">
          <selectModel v-model:model-name="drawerFormData.defaultEmbeddingModel" model-type="EMBEDDING_LLM" />
        </t-form-item>
        <t-form-item :label="$t('common.status')" name="status">
          <selectDict v-model:dict-code="drawerFormData.status" dict-type="SYS_STATUS" />
        </t-form-item>
      </t-form>
      <template #footer>
        <t-space>
          <t-button type="primary" attr-type="button" @click="handleAddandEdit">{{ $t('common.confirm') }}</t-button>
        </t-space>
      </template>
    </t-drawer-content>
  </t-drawer> -->
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import selectDict from '@/components/select/select-dict.vue';
  import { addLlm, editLlm, getLlmList } from '@/api/llm/model';
  import { Llm } from '@/models/llm';
  import { FormInst, useMessage } from 'naive-ui';
  import selectModel from '@/components/select/select-model.vue';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const message = useMessage();

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

  const formRef = ref<FormInst | null>(null);
  const drawerFormRef = ref<FormInst | null>(null);

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
    modelName: { required: true, message: t('views.llm.model.placeholder.modelName'), trigger: 'blur-sm' },
    description: { required: true, message: t('views.llm.model.placeholder.description'), trigger: 'blur-sm' },
    modelType: { required: true, message: t('views.llm.model.placeholder.modelType'), trigger: 'blur-sm' },
    status: { required: true, message: t('views.llm.model.placeholder.status'), trigger: 'blur-sm' },
    sort: { required: true, type: 'number', message: t('views.llm.model.placeholder.status'), trigger: 'blur-sm' },
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

  const handlePageChange = (currentPage: number) => {
    query(currentPage, pageSize.value);
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

  const handleAddandEdit = (e: MouseEvent) => {
    e.preventDefault();
    const messageReactive = message.loading('loading', {
      duration: 0,
    });
    drawerFormRef.value?.validate(async (errors) => {
      if (!errors) {
        const requestData: Llm = drawerFormData.value;

        const res = drawerFormData.value.modelId ? await editLlm(requestData) : await addLlm(requestData);

        if (res?.code === 0) {
          showDrawer.value = false;
          drawerFormData.value = { ...modelInitData };
          query(page.value, pageSize.value);
        }
      } else {
        console.log(errors);
        message.error(t('common.validationFailed'));
      }

      messageReactive.destroy();
    });
  };

  onMounted(async () => {
    query(page.value, pageSize.value);
  });
</script>

<style lang="less" scoped>
  .list-card-item {
    :deep(.t-card__body) {
      height: 100%;
    }
  }
</style>
