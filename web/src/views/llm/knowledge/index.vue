<template>
  <n-card :bordered="false">
    <n-form
      ref="formRef"
      inline
      label-placement="left"
      label-width="auto"
      :model="queryFormData"
      :show-feedback="false"
    >
      <n-grid :cols="24" :x-gap="24">
        <n-form-item-gi :span="5" path="knowledgeName">
          <n-input
            v-model:value="queryFormData.knowledgeName"
            :placeholder="$t('views.app.knowledge.placeholder.knowledgeName')"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="5" path="knowledgeType">
          <selectDict v-model:dict-code="queryFormData.knowledgeType" :multiple="true" dict-type="KNOWLEDGE_TYPE" />
        </n-form-item-gi>
        <n-form-item-gi :span="8">
          <n-space>
            <n-button @click="clearQuery">{{ $t('common.reset') }}</n-button>
            <n-button v-permission="['llm_model_index']" type="primary" @click="handleQuery">
              {{ $t('common.query') }}
            </n-button>
          </n-space>
        </n-form-item-gi>
        <n-gi :span="6">
          <div class="float-right">
            <n-button v-permission="['llm_model_index']" type="primary" @click="handleAdd">
              {{ $t('views.app.knowledge.add') }}
            </n-button>
          </div>
        </n-gi>
      </n-grid>
    </n-form>
  </n-card>
  <n-grid :x-gap="12" :y-gap="12" cols="4" class="my-3 overflow-auto">
    <n-grid-item v-for="item in knowledgesData" :key="item.knowledgeId">
      <n-card
        footer-style="padding: 10px;"
        class="w-full h-full"
        :title="item.knowledgeName"
        :segmented="{
          footer: true,
        }"
        hoverable
        @click="handleEdit(item)"
      >
        <div>{{ item.description }}</div>
        <template #footer>
          <div class="text-center">{{ $t('views.app.knowledge.view') }}</div>
        </template>
      </n-card>
    </n-grid-item>
  </n-grid>
  <n-pagination
    v-model:page="page"
    :page-size="pageSize"
    :item-count="itemCount"
    class="justify-end"
    show-quick-jumper
    show-size-picker
    @update:page="handlePageChange"
  >
    <template #prefix="{}">{{ itemCount }} {{ $t('common.paginationItemCount') }}</template>
  </n-pagination>

  <!-- 新增修改 -->
  <n-modal v-model:show="showModal" style="width: auto" preset="card" :title="drawerTitle" closable>
    <n-form ref="drawerFormRef" label-placement="left" label-width="auto" :model="drawerFormData" :rules="drawerRules">
      <n-form-item :label="$t('views.app.knowledge.name')" path="knowledgeName">
        <n-input
          v-model:value="drawerFormData.knowledgeName"
          :placeholder="$t('views.app.knowledge.placeholder.knowledgeName')"
        />
      </n-form-item>
      <n-form-item :label="$t('views.app.knowledge.description')" path="description">
        <n-input
          v-model:value="drawerFormData.description"
          type="textarea"
          :placeholder="$t('views.app.knowledge.placeholder.description')"
        />
      </n-form-item>
      <n-form-item :label="$t('views.app.knowledge.type')" path="knowledgeType">
        <selectDict
          v-model:dict-code="drawerFormData.knowledgeType"
          v-model:dict-name="drawerFormData.knowledgeTypeName"
          dict-type="KNOWLEDGE_TYPE"
        />
      </n-form-item>
      <n-form-item :label="$t('views.app.knowledge.llm')" path="llm">
        <selectModel v-model:model-name="drawerFormData.llm" model-type="GENERAL_LLM" />
      </n-form-item>
      <n-form-item :label="$t('views.app.knowledge.embeddingModel')" path="embeddingModel">
        <selectModel v-model:model-name="drawerFormData.embeddingModel" model-type="EMBEDDING_LLM" />
      </n-form-item>
      <n-form-item :label="$t('views.app.knowledge.params')" path="params">
        <n-space>
          <n-button>{{ $t('views.app.knowledge.chunkSize') }}</n-button>
          <n-input
            v-model:value="drawerFormData.params.chunkSize"
            :placeholder="$t('views.app.knowledge.placeholder.chunkSize')"
          />

          <n-button>{{ $t('views.app.knowledge.chunkOverlap') }}</n-button>
          <n-input
            v-model:value="drawerFormData.params.chunkOverlap"
            :placeholder="$t('views.app.knowledge.placeholder.chunkOverlap')"
          />
        </n-space>
      </n-form-item>
      <n-form-item :label="$t('common.status')" path="status">
        <selectDict v-model:dict-code="drawerFormData.status" dict-type="SYS_STATUS" />
      </n-form-item>
    </n-form>
    <template #footer>
      <div class="text-center">
        <n-button type="primary" attr-type="button" @click="handleAddandEdit">{{ $t('common.confirm') }}</n-button>
      </div>
    </template>
  </n-modal>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { Knowledge } from '@/models/app';
  import { useI18n } from 'vue-i18n';
  import { FormInst, useMessage } from 'naive-ui';
  import { addKnowledge, editKnowledge, getKnowledgeList } from '@/api/llm/app';
  import selectModel from '@/components/select/select-model.vue';

  const { t } = useI18n();
  const message = useMessage();

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

  const formRef = ref<FormInst | null>(null);
  const drawerFormRef = ref<FormInst | null>(null);

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
    knowledgeName: { required: true, message: t('views.app.knowledge.placeholder.knowledgeName'), trigger: 'blur' },
    description: { required: true, message: t('views.app.knowledge.placeholder.description'), trigger: 'blur' },
    knowledgeType: { required: true, message: t('views.app.knowledge.placeholder.knowledgeType'), trigger: 'blur' },
    llm: { required: true, message: t('views.app.knowledge.placeholder.llm'), trigger: 'blur' },
    embeddingModel: { required: true, message: t('views.app.knowledge.placeholder.embeddingModel'), trigger: 'blur' },
    chunkSize: { required: true, message: t('views.app.knowledge.placeholder.chunkSize'), trigger: 'blur' },
    chunkOverlap: { required: true, message: t('views.app.knowledge.placeholder.chunkOverlap'), trigger: 'blur' },
    status: { required: true, message: t('views.app.knowledge.placeholder.status'), trigger: 'blur' },
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

  const handlePageChange = (currentPage: number) => {
    query(currentPage, pageSize.value);
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

  const handleAddandEdit = (e: MouseEvent) => {
    e.preventDefault();
    const messageReactive = message.loading('loading', {
      duration: 0,
    });
    drawerFormRef.value?.validate(async (errors) => {
      if (!errors) {
        const requestData: Knowledge = drawerFormData.value;

        const res = drawerFormData.value.knowledgeId
          ? await editKnowledge(requestData)
          : await addKnowledge(requestData);

        if (res?.code === 0) {
          showModal.value = false;
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
