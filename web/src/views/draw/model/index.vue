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
          <t-input v-model="queryFormData.modelName" :placeholder="$t('views.draw.model.placeholder.modelName')" />
        </t-form-item>

        <t-form-item name="modelType">
          <selectDict v-model:dict-code="queryFormData.modelType" :multiple="true" dict-type="DIFFUSION_MODEL_TYPE" />
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
        {{ $t('views.draw.model.add') }}
      </t-button>
    </div>
  </t-card>

  <!-- 列表 -->
  <div class="my-4">
    <t-row :gutter="[10, 10]">
      <t-col v-for="item in modelsData" :key="item.modelId" :xs="12" :sm="8" :md="6" :lg="4" :xl="3" class="h-48">
        <t-card
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
              {{ $t('views.draw.model.view') }}
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
      <t-form-item :label="$t('views.draw.model.name')" name="modelName">
        <t-input v-model="drawerFormData.modelName" :placeholder="$t('views.draw.model.placeholder.modelName')" />
      </t-form-item>
      <t-form-item :label="$t('views.draw.model.code')" name="modelCode">
        <t-input v-model="drawerFormData.modelCode" :placeholder="$t('views.draw.model.placeholder.modelCode')" />
      </t-form-item>
      <t-form-item :label="$t('views.draw.model.type')" name="modelType">
        <selectDict
          v-model:dict-code="drawerFormData.modelType"
          v-model:dict-name="drawerFormData.modelTypeName"
          dict-type="DIFFUSION_MODEL_TYPE"
        />
      </t-form-item>
      <t-form-item
        v-if="drawerFormData.modelType !== 'BASE_MODEL' && drawerFormData.modelType !== 'NOT_DIFFUSION_MODEL'"
        :label="$t('views.draw.model.baseModel')"
        name="baseModelId"
      >
        <selectDiffusion v-model:model-id="drawerFormData.baseModelId" model-type="BASE_MODEL" />
      </t-form-item>
      <t-form-item v-if="drawerFormData.modelType !== 'BASE_MODEL'" :label="$t('views.draw.model.tags')" name="tags">
        <selectDict
          v-model:dict-code="drawerFormData.tags"
          :multiple="true"
          :dict-type="['DIFFUSION_TAGS', 'TOPIC', 'STYLE']"
        />
      </t-form-item>
      <t-form-item :label="$t('views.draw.model.description')" name="description">
        <t-textarea
          v-model="drawerFormData.description"
          :placeholder="$t('views.draw.model.placeholder.description')"
        />
      </t-form-item>
      <t-form-item :label="$t('views.draw.model.cover')" name="modelCover">
        <t-upload
          v-model="modelCoverRef"
          accept="image/*"
          action="/api/file/upload-image"
          :size-limit="{ size: 5, unit: 'MB' }"
          theme="image"
          :headers="{ Authorization: `Bearer ${token}` }"
          @remove="removeImage"
          @fail="uploadFail"
          @success="uploadSuccess"
        ></t-upload>
      </t-form-item>
      <t-form-item :label="$t('common.status')" name="status">
        <selectDict v-model:dict-code="drawerFormData.status" dict-type="SYS_STATUS" />
      </t-form-item>
      <t-form-item>
        <t-space>
          <t-button theme="primary" type="submit">{{ $t('common.confirm') }}</t-button>
        </t-space>
      </t-form-item>
    </t-form>
  </t-drawer>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import selectDict from '@/components/select/select-dict.vue';
  import { addDiffusionModel, editDiffusionModel, getDiffusionModelList } from '@/api/draw/model';
  import { DiffusionModel } from '@/models/diffusion-model';
  import { LoadingPlugin, MessagePlugin, UploadProps } from 'tdesign-vue-next';
  import selectDiffusion from '@/components/select/select-diffusion.vue';
  import storage from '@/utils/storage';
  import { ACCESS_TOKEN } from '@/constants';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const token = storage.get(ACCESS_TOKEN, '');

  const queryFormData = ref({
    modelName: '',
    modelType: '',
  });

  const modelsData = ref<DiffusionModel[]>([]);
  const page = ref<number>(1);
  const pageSize = ref<number>(10);
  const itemCount = ref(0);

  const showDrawer = ref(false);
  const drawerTitle = ref('');

  const formRef = ref(null);
  const drawerFormRef = ref(null);

  // 新增/修改弹窗数据初始化
  const modelInitData: DiffusionModel = {
    modelId: '',
    baseModelId: undefined,
    modelName: '',
    modelCode: '',
    modelType: undefined,
    modelTypeName: '',
    modelCover: '',
    status: '0',
    description: '',
    tags: '',
  };
  const drawerFormData = ref(modelInitData);
  const modelCoverRef = ref<UploadProps['value']>([]);

  const drawerRules = {
    modelName: [{ required: true, message: t('views.draw.model.placeholder.modelName'), trigger: 'blur' }],
    description: [{ required: true, message: t('views.draw.model.placeholder.description'), trigger: 'blur' }],
    modelType: [{ required: true, message: t('views.draw.model.placeholder.modelType'), trigger: 'blur' }],
    status: [{ required: true, message: t('views.draw.model.placeholder.status'), trigger: 'blur' }],
  };

  // 绑定表格数据
  const query = async (currentPage: number, currentPageSize = 10) => {
    try {
      const requestData = {
        ...queryFormData.value,
        page: currentPage,
        pageSize: currentPageSize,
      };

      const res = await getDiffusionModelList(requestData);
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
    drawerTitle.value = t('views.draw.model.add');
    showDrawer.value = true;

    drawerFormData.value = { ...modelInitData };
    modelCoverRef.value = [];
  };

  // 修改
  const handleEdit = async (item: DiffusionModel) => {
    drawerTitle.value = t('views.draw.model.edit');
    showDrawer.value = true;

    // 赋值
    // 创建一个新的对象，包含 modelInitData 的属性和 item 的属性
    drawerFormData.value = { ...modelInitData, ...item, status: item.status.toString() };

    if (item.modelCover) {
      console.log(item.modelCover);
      modelCoverRef.value = [
        {
          name: t('views.draw.model.cover'),
          url: `${import.meta.env.VITE_APP_CDN_BASEURL}${item.modelCover}`,
        },
      ];
    }
  };

  const uploadFail = ({ file }) => {
    MessagePlugin.error(`文件 ${file.name} 上传失败`);
  };

  const removeImage = () => {
    drawerFormData.value.modelCover = '';
  };

  const uploadSuccess: UploadProps['onSuccess'] = (params) => {
    // 定义允许的文件类型数组
    const res = params.response;
    if (res?.code === 0) {
      const filePath = res.data;

      drawerFormData.value.modelCover = filePath;
    }
    MessagePlugin.success('upload successfully');
  };

  const handleAddandEdit = async ({ validateResult, firstError, e }) => {
    e.preventDefault();

    LoadingPlugin(true);

    if (validateResult === true) {
      const requestData: DiffusionModel = drawerFormData.value;

      const res = drawerFormData.value.modelId
        ? await editDiffusionModel(requestData)
        : await addDiffusionModel(requestData);

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
