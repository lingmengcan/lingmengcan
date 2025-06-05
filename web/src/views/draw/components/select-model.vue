<template>
  <n-popover ref="popoverRef" v-model:show="showPopover" trigger="click" placement="right-start" :show-arrow="false">
    <template #trigger>
      <n-button strong secondary class="float-right px-5! h-7! text-xs!" @click="showPopover = !showPopover">
        {{ $t('views.draw.stableDiffusion.changeModel') }}
      </n-button>
    </template>
    <n-grid :x-gap="12" :y-gap="12" cols="5" class="my-3 overflow-auto">
      <n-grid-item v-for="item in modelsData" :key="item.modelId" @click="handleClick(item)">
        <div class="relative w-40 border cursor-pointer h-28 max-w-40 max-h-28">
          <div class="flex items-center justify-center w-full h-full overflow-hidden">
            <img :src="`${cdnBaseUrl}${item.modelCover}`" alt="" class="block max-w-full max-h-full" />
          </div>
          <div
            class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-opacity-0 bg-slate-400 hover:bg-opacity-50 hover:text-white text-shadow"
          >
            <p>{{ item.modelName }}</p>
          </div>
        </div>
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
  </n-popover>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { PopoverInst } from 'naive-ui';
  import { DiffusionModel } from '@/models/diffusion-model';
  import { getDiffusionModelList } from '@/api/draw/model';

  const emit = defineEmits(['update:modelCode', 'update:modelName']);

  const popoverRef = ref<PopoverInst | null>(null);
  const showPopover = ref(false);
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

  const handlePageChange = (currentPage: number) => {
    query(currentPage, pageSize.value);
  };

  function handleClick(item: DiffusionModel) {
    emit('update:modelName', item.modelName);
    emit('update:modelCode', item.modelCode);
    showPopover.value = false;
  }

  onMounted(async () => {
    query(page.value, pageSize.value);
  });
</script>

<style lang="less" scoped></style>
