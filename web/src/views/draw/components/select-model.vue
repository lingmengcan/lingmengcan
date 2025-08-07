<template>
  <t-popup ref="popupRef" v-model="showPopup" trigger="click" placement="right-top" :show-arrow="false">
    <template #content>
      <div class="my-3 overflow-auto" style="width: 800px; max-height: 400px">
        <div class="grid grid-cols-5 gap-3">
          <div
            v-for="item in modelsData"
            :key="item.modelId"
            class="relative w-40 border cursor-pointer h-28 max-w-40 max-h-28"
            @click="handleClick(item)"
          >
            <div class="flex items-center justify-center w-full h-full overflow-hidden">
              <img :src="`${cdnBaseUrl}${item.modelCover}`" alt="" class="block max-w-full max-h-full" />
            </div>
            <div
              class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-opacity-0 bg-slate-400 hover:bg-opacity-50 hover:text-white text-shadow"
            >
              <p>{{ item.modelName }}</p>
            </div>
          </div>
        </div>
      </div>
      <t-pagination
        v-model="page"
        :page-size="pageSize"
        :total="itemCount"
        show-jumper
        @change="handlePageChange"
      ></t-pagination>
    </template>

    <t-button variant="outline" size="small" class="float-right px-5 h-7 text-xs">
      {{ $t('views.draw.stableDiffusion.changeModel') }}
    </t-button>
  </t-popup>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { DiffusionModel } from '@/models/diffusion-model';
  import { getDiffusionModelList } from '@/api/draw/model';

  const emit = defineEmits(['update:modelCode', 'update:modelName']);

  const popupRef = ref();
  const showPopup = ref(false);
  const cdnBaseUrl = import.meta.env.VITE_APP_CDN_BASEURL;

  const modelsData = ref<DiffusionModel[]>([]);
  const page = ref<number>(1);
  const pageSize = ref<number>(10);
  const itemCount = ref(0);

  // 绑定表格数据
  const query = async (currentPage: number, currentPageSize = 10) => {
    try {
      const requestData = {
        modelName: '',
        modelType: 'CHECKPOINT_DIFFUSION',
        page: currentPage,
        pageSize: currentPageSize,
      };

      const res = await getDiffusionModelList(requestData);
      if (res?.code === 0) {
        modelsData.value = res.data.list;
        page.value = currentPage;
        pageSize.value = currentPageSize;
        itemCount.value = res.data.count;
      }
    } catch (err) {
      modelsData.value = [];
    }
  };

  const handlePageChange = (pageInfo: { current: number; pageSize: number }) => {
    query(pageInfo.current, pageInfo.pageSize);
  };

  function handleClick(item: DiffusionModel) {
    emit('update:modelName', item.modelName);
    emit('update:modelCode', item.modelCode);
    showPopup.value = false;
  }

  onMounted(async () => {
    query(page.value, pageSize.value);
  });
</script>

<style lang="less" scoped>
  .grid {
    display: grid;
  }

  .grid-cols-5 {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  .gap-3 {
    gap: 0.75rem;
  }

  .text-shadow {
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  :deep(.t-popup__content) {
    padding: 12px;
  }
</style>
