<template>
  <div class="relative">
    <n-popover ref="popoverRef" v-model:show="showPopover" trigger="click" placement="right" :show-arrow="false">
      <template #trigger>
        <div
          class="flex items-center w-full px-2 bg-white border border-gray-300 rounded-sm cursor-pointer min-h-9"
          @click="togglePopover"
        >
          <div class="flex flex-wrap items-center grow h-full overflow-hidden space-1">
            <n-tag
              v-for="item in selectedItems"
              :key="item.modelId"
              closable
              class="m-[2px]"
              :data-model-id="item.modelId"
              @close="removeItem(item)"
            >
              {{ item.modelCode }}
            </n-tag>
            <div v-if="selectedItems.length === 0" class="text-gray-300">{{ $t('common.select') }}</div>
          </div>
          <button class="self-center ml-2 text-gray-500" @click.stop="clearAllSelected">&times;</button>
        </div>
      </template>
      <n-grid :x-gap="12" :y-gap="12" cols="5" class="my-3 overflow-auto">
        <n-grid-item v-for="item in modelsData" :key="item.modelId" @click.stop="handleClick(item)">
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
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { PopoverInst } from 'naive-ui';
  import { DiffusionModel } from '@/models/diffusion-model';
  import { getDiffusionModelList } from '@/api/draw/model';

  const emit = defineEmits(['update:loraList', 'selected']);

  const popoverRef = ref<PopoverInst | null>(null);
  const showPopover = ref(false);
  const cdnBaseUrl = import.meta.env.VITE_APP_CDN_BASEURL;

  const modelsData = ref<DiffusionModel[]>([]);
  const selectedItems = ref<DiffusionModel[]>([]);
  const page = ref<number>(1);
  const pageSize = ref<number>(10);
  const itemCount = ref(0);

  const togglePopover = () => {
    showPopover.value = !showPopover.value;
  };

  const removeItem = (item: DiffusionModel) => {
    const index = selectedItems.value.indexOf(item);
    if (index > -1) {
      selectedItems.value.splice(index, 1);

      const modelCodeList = selectedItems.value.map((model) => model.modelCode);
      emit('update:loraList', modelCodeList);
      emit('selected', modelCodeList);
    }
  };

  // 绑定表格数据
  const query = async (currentPage: number, currentPageSize = 10) => {
    try {
      const requestData = {
        modelName: '',
        modelType: 'LORA_DIFFUSION',
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
    if (selectedItems.value.some((dataItem) => dataItem.modelId === item.modelId)) {
      // 这里已经选中项给个震动的动画
      const element = document.querySelector(`[data-model-id="${item.modelId}"]`);
      if (element) {
        element.classList.add('animate-shake');
        setTimeout(() => {
          element.classList.remove('animate-shake');
        }, 1000);
      }
    } else {
      selectedItems.value.push(item);
    }

    const modelCodeList = selectedItems.value.map((model) => model.modelCode);
    emit('update:loraList', modelCodeList);
    emit('selected', modelCodeList);
    showPopover.value = false;
  }

  function clearAllSelected() {
    selectedItems.value = [];
    emit('update:loraList', []);
    emit('selected', []);
  }

  onMounted(async () => {
    query(page.value, pageSize.value);
  });
</script>
