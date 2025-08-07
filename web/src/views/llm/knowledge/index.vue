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
        <t-form-item name="knowledgeName">
          <t-input
            v-model="queryFormData.knowledgeName"
            :placeholder="$t('views.app.knowledge.placeholder.knowledgeName')"
          />
        </t-form-item>
        <t-form-item name="knowledgeType">
          <selectDict v-model:dict-code="queryFormData.knowledgeType" :multiple="true" dict-type="KNOWLEDGE_TYPE" />
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
        {{ $t('views.app.knowledge.add') }}
      </t-button>
    </div>
  </t-card>

  <!-- 列表 -->
  <div class="my-4">
    <t-row :gutter="[10, 10]">
      <t-col
        :xs="12"
        :sm="8"
        :md="6"
        :lg="4"
        :xl="3"
        class="h-48"
        v-for="item in knowledgesData"
        :key="item.knowledgeId"
      >
        <t-card
          size="small"
          class="w-full h-full flex flex-col"
          :title="item.knowledgeName"
          :bordered="true"
          hoverShadow
          @click="handleEdit(item)"
        >
          <div class="flex-1 overflow-hidden text-sm text-gray-600 leading-relaxed">
            {{ item.description }}
          </div>
          <template #footer>
            <div class="text-center text-blue-600 hover:text-blue-800 transition-colors">
              {{ $t('views.app.knowledge.view') }}
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

  <!-- 新增修改 -->
  <t-dialog v-model:visible="showModal" :header="drawerTitle" width="600" :close-btn="true" :footer="false">
    <t-form
      ref="drawerFormRef"
      :data="drawerFormData"
      :rules="drawerRules"
      label-align="right"
      :label-width="120"
      @submit="handleAddandEdit"
    >
      <t-form-item :label="$t('views.app.knowledge.name')" name="knowledgeName">
        <t-input
          v-model="drawerFormData.knowledgeName"
          :placeholder="$t('views.app.knowledge.placeholder.knowledgeName')"
        />
      </t-form-item>
      <t-form-item :label="$t('views.app.knowledge.description')" name="description">
        <t-textarea
          v-model="drawerFormData.description"
          :placeholder="$t('views.app.knowledge.placeholder.description')"
        />
      </t-form-item>
      <t-form-item :label="$t('views.app.knowledge.type')" name="knowledgeType">
        <selectDict
          v-model:dict-code="drawerFormData.knowledgeType"
          v-model:dict-name="drawerFormData.knowledgeTypeName"
          dict-type="KNOWLEDGE_TYPE"
        />
      </t-form-item>
      <t-form-item :label="$t('views.app.knowledge.llm')" name="llm">
        <selectModel v-model:model-name="drawerFormData.llm" model-type="GENERAL_LLM" />
      </t-form-item>
      <t-form-item :label="$t('views.app.knowledge.embeddingModel')" name="embeddingModel">
        <selectModel v-model:model-name="drawerFormData.embeddingModel" model-type="EMBEDDING_LLM" />
      </t-form-item>
      <t-form-item :label="$t('views.app.knowledge.params')" name="params">
        <t-space size="small">
          <t-button variant="outline">{{ $t('views.app.knowledge.chunkSize') }}</t-button>
          <t-input-number
            v-model="drawerFormData.params.chunkSize"
            theme="normal"
            autoWidth
            :placeholder="$t('views.app.knowledge.placeholder.chunkSize')"
          />

          <t-button variant="outline">{{ $t('views.app.knowledge.chunkOverlap') }}</t-button>
          <t-input
            v-model="drawerFormData.params.chunkOverlap"
            autoWidth
            :placeholder="$t('views.app.knowledge.placeholder.chunkOverlap')"
          />
        </t-space>
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectDict v-model:dict-code="drawerFormData.status" dict-type="SYS_STATUS" />
      </t-form-item>
      <t-form-item>
        <div class="text-center">
          <t-button theme="primary" type="submit">{{ $t('common.confirm') }}</t-button>
        </div>
      </t-form-item>
    </t-form>
  </t-dialog>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { Knowledge } from '@/models/app';
  import { useI18n } from 'vue-i18n';
  import { LoadingPlugin, MessagePlugin } from 'tdesign-vue-next';
  import { addKnowledge, editKnowledge, getKnowledgeList } from '@/api/llm/app';
  import selectModel from '@/components/select/select-model.vue';

  const { t } = useI18n();

  const queryFormData = ref({
    knowledgeName: '',
    knowledgeType: '',
  });

  const knowledgesData = ref<Knowledge[]>([]);
  const page = ref<number>(1);
  const pageSize = ref<number>(10);
  const itemCount = ref(0);

  const showModal = ref(false);
  const drawerTitle = ref('');

  const formRef = ref(null);
  const drawerFormRef = ref(null);

  // 新增/修改弹窗数据初始化
  const modelInitData: Knowledge = {
    knowledgeId: '',
    knowledgeName: '',
    knowledgeType: undefined,
    knowledgeTypeName: '',
    llm: undefined,
    embeddingModel: undefined,
    params: {
      separators: ['\n\n', '\n', '。', '.', '！', '？', '，'],
      chunkSize: 300,
      chunkOverlap: 200,
      keepSeparator: false,
    },
    status: '0',
    description: '',
  };
  const drawerFormData = ref(modelInitData);

  const drawerRules = {
    knowledgeName: [{ required: true, message: t('views.app.knowledge.placeholder.knowledgeName'), trigger: 'blur' }],
    description: [{ required: true, message: t('views.app.knowledge.placeholder.description'), trigger: 'blur' }],
    knowledgeType: [{ required: true, message: t('views.app.knowledge.placeholder.knowledgeType'), trigger: 'blur' }],
    llm: [{ required: true, message: t('views.app.knowledge.placeholder.llm'), trigger: 'blur' }],
    embeddingModel: [{ required: true, message: t('views.app.knowledge.placeholder.embeddingModel'), trigger: 'blur' }],
    chunkSize: [{ required: true, message: t('views.app.knowledge.placeholder.chunkSize'), trigger: 'blur' }],
    chunkOverlap: [{ required: true, message: t('views.app.knowledge.placeholder.chunkOverlap'), trigger: 'blur' }],
    status: [{ required: true, message: t('views.app.knowledge.placeholder.status'), trigger: 'blur' }],
  };

  // 绑定表格数据
  const query = async (currentPage: number, currentPageSize = 10) => {
    try {
      const requestData = {
        ...queryFormData.value,
        page: currentPage,
        pageSize: currentPageSize,
      };

      const res = await getKnowledgeList(requestData);
      if (res?.code === 0) {
        knowledgesData.value = res.data?.list;
        page.value = currentPage;
        pageSize.value = currentPageSize;
        itemCount.value = res.data.count;
      }
    } catch (err) {
      knowledgesData.value = [];
    }
  };

  const handleQuery = () => {
    query(page.value, pageSize.value);
  };

  const clearQuery = () => {
    queryFormData.value = {
      knowledgeName: '',
      knowledgeType: '',
    };
    query(page.value, pageSize.value);
  };

  const handlePageChange = (pageInfo: { current: number; pageSize: number }) => {
    query(pageInfo.current, pageInfo.pageSize);
  };

  // 新增
  const handleAdd = async () => {
    drawerTitle.value = t('views.app.knowledge.add');
    showModal.value = true;

    drawerFormData.value = { ...modelInitData };
  };

  // 修改
  const handleEdit = async (item: Knowledge) => {
    drawerTitle.value = t('views.app.knowledge.edit');
    showModal.value = true;

    // 赋值
    // 创建一个新的对象，包含 modelInitData 的属性和 item 的属性
    drawerFormData.value = { ...modelInitData, ...item, status: item.status.toString() };
  };

  const handleAddandEdit = async ({ validateResult, firstError, e }) => {
    e.preventDefault();
    LoadingPlugin(true);

    if (validateResult === true) {
      const requestData: Knowledge = drawerFormData.value;

      const res = drawerFormData.value.knowledgeId ? await editKnowledge(requestData) : await addKnowledge(requestData);

      if (res?.code === 0) {
        showModal.value = false;
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
