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
        <n-form-item-gi :span="5" path="modelName">
          <n-input
            v-model:value="queryFormData.modelName"
            :placeholder="$t('views.draw.model.placeholder.modelName')"
          />
        </n-form-item-gi>
        <n-form-item-gi :span="5" path="modelType">
          <selectDict v-model:dict-code="queryFormData.modelType" :multiple="true" dict-type="DIFFUSION_MODEL_TYPE" />
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
              {{ $t('views.draw.model.add') }}
            </n-button>
          </div>
        </n-gi>
      </n-grid>
    </n-form>
  </n-card>
  <n-grid :x-gap="12" :y-gap="12" cols="4" class="my-3 overflow-auto">
    <n-grid-item v-for="item in modelsData" :key="item.modelId">
      <n-card
        footer-style="padding: 10px;"
        class="w-full h-full"
        :title="item.modelName"
        :segmented="{
          footer: true,
        }"
        hoverable
        @click="handleEdit(item)"
      >
        <div>{{ item.description }}</div>
        <template #footer>
          <div class="text-center">{{ $t('views.draw.model.view') }}</div>
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

  <!-- 新增修改模型 -->
  <n-drawer v-model:show="showDrawer" :width="599">
    <n-drawer-content :title="drawerTitle" closable>
      <n-form
        ref="drawerFormRef"
        label-placement="left"
        label-width="auto"
        :model="drawerFormData"
        :rules="drawerRules"
      >
        <n-form-item :label="$t('views.draw.model.name')" path="modelName">
          <n-input
            v-model:value="drawerFormData.modelName"
            :placeholder="$t('views.draw.model.placeholder.modelName')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.draw.model.code')" path="modelName">
          <n-input
            v-model:value="drawerFormData.modelCode"
            :placeholder="$t('views.draw.model.placeholder.modelCode')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.draw.model.type')" path="modelType">
          <selectDict
            v-model:dict-code="drawerFormData.modelType"
            v-model:dict-name="drawerFormData.modelTypeName"
            dict-type="DIFFUSION_MODEL_TYPE"
          />
        </n-form-item>
        <n-form-item
          v-if="drawerFormData.modelType !== 'BASE_MODEL' && drawerFormData.modelType !== 'NOT_DIFFUSION_MODEL'"
          :label="$t('views.draw.model.baseModel')"
          path="BaseModelId"
        >
          <selectDiffusion v-model:model-id="drawerFormData.baseModelId" model-type="BASE_MODEL" />
        </n-form-item>
        <n-form-item v-if="drawerFormData.modelType !== 'BASE_MODEL'" :label="$t('views.draw.model.tags')" path="tags">
          <selectDict
            v-model:dict-code="drawerFormData.tags"
            :multiple="true"
            :dict-type="['DIFFUSION_TAGS', 'TOPIC', 'STYLE']"
          />
        </n-form-item>
        <n-form-item :label="$t('views.draw.model.description')" path="description">
          <n-input
            v-model:value="drawerFormData.description"
            type="textarea"
            :placeholder="$t('views.draw.model.placeholder.description')"
          />
        </n-form-item>
        <n-form-item :label="$t('views.draw.model.cover')" path="modelCover">
          <n-upload
            accept=".png,.jpeg,.jpg"
            action="/api/file/upload-image"
            :max="1"
            list-type="image-card"
            :default-file-list="modelCoverRef"
            with-credentials
            :headers="{ Authorization: `Bearer ${token}` }"
            @finish="afterUploaded"
            @remove="removeImage"
          >
            {{ $t('views.draw.model.upload') }}
          </n-upload>
        </n-form-item>
        <n-form-item :label="$t('common.status')" path="status">
          <selectDict v-model:dict-code="drawerFormData.status" dict-type="SYS_STATUS" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space>
          <n-button type="primary" attr-type="button" @click="handleAddandEdit">{{ $t('common.confirm') }}</n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import selectDict from '@/components/select/select-dict.vue';
  import { addDiffusionModel, editDiffusionModel, getDiffusionModelList } from '@/api/draw/model';
  import { DiffusionModel } from '@/models/diffusion-model';
  import { FormInst, useMessage, UploadFileInfo } from 'naive-ui';
  import selectDiffusion from '@/components/select/select-diffusion.vue';
  import storage from '@/utils/storage';
  import { ACCESS_TOKEN } from '@/constants';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();
  const message = useMessage();

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

  const formRef = ref<FormInst | null>(null);
  const drawerFormRef = ref<FormInst | null>(null);

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
  const modelCoverRef = ref<UploadFileInfo[]>([]);

  const drawerRules = {
    modelName: { required: true, message: t('views.draw.model.placeholder.modelName'), trigger: 'blur' },
    description: { required: true, message: t('views.draw.model.placeholder.description'), trigger: 'blur' },
    modelType: { required: true, message: t('views.draw.model.placeholder.modelType'), trigger: 'blur' },
    status: { required: true, message: t('views.draw.model.placeholder.status'), trigger: 'blur' },
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

  const handlePageChange = (currentPage: number) => {
    query(currentPage, pageSize.value);
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

    modelCoverRef.value = [];
    if (item.modelCover) {
      modelCoverRef.value = [
        {
          id: '1',
          name: t('views.draw.model.cover'),
          status: 'finished',
          url: `${import.meta.env.VITE_APP_CDN_BASEURL}${item.modelCover}`,
        },
      ];
    }
  };

  function afterUploaded({ file, event }: { file: UploadFileInfo; event?: ProgressEvent }) {
    // 定义允许的文件类型数组
    const res = JSON.parse((event?.target as XMLHttpRequest).response);
    if (res?.code === 0) {
      const filePath = res.data;

      drawerFormData.value.modelCover = filePath;
      console.log(file.fullPath);
    }
  }

  function removeImage() {
    drawerFormData.value.modelCover = '';
  }

  const handleAddandEdit = (e: MouseEvent) => {
    e.preventDefault();
    const messageReactive = message.loading('loading', {
      duration: 0,
    });
    drawerFormRef.value?.validate(async (errors) => {
      if (!errors) {
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
        message.error(t('common.validationFailed'));
      }

      messageReactive.destroy();
    });
  };

  onMounted(async () => {
    query(page.value, pageSize.value);
  });
</script>

<style scoped>
  /* Add any necessary styling here */
</style>
