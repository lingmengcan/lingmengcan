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
        <t-form-item name="mcpName">
          <t-input v-model:value="queryFormData.mcpName" :placeholder="$t('views.llm.mcp.placeholder.mcpName')" />
        </t-form-item>
        <t-form-item name="mcpType">
          <selectDict v-model:dict-code="queryFormData.mcpType" :multiple="true" dict-type="MCP_TYPE" />
        </t-form-item>
        <t-form-item>
          <t-space>
            <t-button theme="primary" type="submit" v-permission="['llm_mcp_index']">
              {{ $t('common.query') }}
            </t-button>
            <t-button theme="default" variant="base" type="reset">{{ $t('common.reset') }}</t-button>
          </t-space>
        </t-form-item>
      </t-form>

      <t-button v-permission="['llm_mcp_add']" theme="primary" @click="handleAdd">
        {{ $t('views.llm.mcp.add') }}
      </t-button>
    </div>
  </t-card>

  <!-- mcp列表 -->
  <div class="mt-4 mb-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 h-full">
      <div v-for="item in mcpsData" :key="item.mcpId" class="list-card-item h-full">
        <t-card
          :bordered="false"
          class="w-full h-full flex flex-col"
          :title="item.mcpName"
          hover-shadow
          @click="handleEdit(item)"
        >
          <template #content>
            <div class="grow h-full overflow-hidden">{{ item.description }}</div>
          </template>
          <template #footer>
            <div class="text-center border-t border-gray-200 pt-2">{{ $t('views.llm.mcp.view') }}</div>
          </template>
        </t-card>
      </div>
    </div>
  </div>
  <t-pagination v-model="page" :page-size="pageSize" :total="total" @current-change="handlePageChange"></t-pagination>

  <!-- 新增修改MCP -->
  <!-- <t-drawer v-model:show="showDrawer" :width="599">
    <t-drawer-content :title="drawerTitle" closable>
      <t-form
        ref="drawerFormRef"
        label-placement="left"
        label-width="auto"
        :model="drawerFormData"
        :rules="drawerRules"
      >
        <t-form-item :label="$t('views.llm.mcp.name')" name="modelName">
          <t-input
            v-model:value="drawerFormData.mcpName"
            :placeholder="$t('views.llm.mcp.placeholder.mcpName')"
          />
        </t-form-item>
        <t-form-item :label="$t('views.llm.mcp.description')" name="description">
          <t-input
            v-model:value="drawerFormData.description"
            type="textarea"
            :placeholder="$t('views.llm.mcp.placeholder.description')"
          />
        </t-form-item>
        <t-form-item :label="$t('views.llm.mcp.type')" name="modelType">
          <selectDict
            v-model:dict-code="drawerFormData.mcpType"
            v-model:dict-name="drawerFormData.mcpTypeName"
            dict-type="LLM_TYPE"
          />
        </t-form-item>
        <t-form-item :label="$t('views.llm.mcp.apiType')" name="apiType">
          <selectDict v-model:dict-code="drawerFormData.apiType" dict-type="LLM_API_TYPE" />
        </t-form-item>
        <t-form-item :label="$t('views.llm.mcp.baseUrl')" name="baseUrl">
          <t-input v-model:value="drawerFormData.baseUrl" :placeholder="$t('views.llm.mcp.placeholder.baseUrl')" />
        </t-form-item>
        <t-form-item :label="$t('views.llm.mcp.apiKey')" name="apiKey">
          <t-input v-model:value="drawerFormData.apiKey" :placeholder="$t('views.llm.mcp.placeholder.apiKey')" />
        </t-form-item>
        <t-form-item :label="$t('views.llm.mcp.defaultEmbeddingModel')" name="defaultEmbeddingModel">
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
    mcpName: '',
    mcpType: '',
  });

  const mcpsData = ref<Llm[]>([]);
  const page = ref(1);
  const pageSize = ref(10);
  const total = ref(0);

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const formRef = ref<FormInst | null>(null);
  const drawerFormRef = ref<FormInst | null>(null);

  // 新增/修改弹窗数据初始化
  const mcpInitData: Llm = {
    mcpId: '',
    mcpName: '',
    mcpType: undefined,
    mcpTypeName: '',
    baseUrl: '',
    apiKey: '',
    apiType: undefined,
    defaultEmbeddingModel: undefined,
    status: '0',
    description: '',
  };
  const drawerFormData = ref(mcpInitData);

  const drawerRules = {
    mcpName: { required: true, message: t('views.llm.mcp.placeholder.mcpName'), trigger: 'blur-sm' },
    description: { required: true, message: t('views.llm.mcp.placeholder.description'), trigger: 'blur-sm' },
    mcpType: { required: true, message: t('views.llm.mcp.placeholder.mcpType'), trigger: 'blur-sm' },
    status: { required: true, message: t('views.llm.mcp.placeholder.status'), trigger: 'blur-sm' },
    sort: { required: true, type: 'number', message: t('views.llm.mcp.placeholder.status'), trigger: 'blur-sm' },
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
        mcpsData.value = res.data?.list;
        page.value = currentPage;
        pageSize.value = currentPageSize;
        total.value = res.data.count;
      }
    } catch (err) {
      mcpsData.value = [];
    }
  };

  const handleQuery = () => {
    query(page.value, pageSize.value);
  };

  const clearQuery = () => {
    queryFormData.value = {
      mcpName: '',
      mcpType: '',
    };
    query(page.value, pageSize.value);
  };

  const handlePageChange = (currentPage: number) => {
    query(currentPage, pageSize.value);
  };

  // 新增
  const handleAdd = async () => {
    drawerTitle.value = t('views.llm.mcp.add');
    showDrawer.value = true;

    drawerFormData.value = { ...mcpInitData };
  };

  // 修改
  const handleEdit = async (item: Llm) => {
    drawerTitle.value = t('views.llm.mcp.edit');
    showDrawer.value = true;

    // 赋值
    // 创建一个新的对象，包含 mcpInitData 的属性和 item 的属性
    drawerFormData.value = { ...mcpInitData, ...item, status: item.status.toString() };
  };

  const handleAddandEdit = (e: MouseEvent) => {
    e.preventDefault();
    const messageReactive = message.loading('loading', {
      duration: 0,
    });
    drawerFormRef.value?.validate(async (errors) => {
      if (!errors) {
        const requestData: Llm = drawerFormData.value;

        const res = drawerFormData.value.mcpId ? await editLlm(requestData) : await addLlm(requestData);

        if (res?.code === 0) {
          showDrawer.value = false;
          drawerFormData.value = { ...mcpInitData };
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
