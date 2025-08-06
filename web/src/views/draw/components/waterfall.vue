<template>
  <div ref="containerRef" class="relative">
    <div v-for="item in items" :key="item.mediaId" class="absolute" :style="item.style">
      <template v-if="item.loading">
        <t-loading size="large" />
      </template>
      <template v-else>
        <t-image :src="item.src" class="rounded-md" :style="{ width: columnWidth + 'px' }" />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue';
  import { Media } from '@/models/draw';

  interface WaterfallItem {
    src: string;
    mediaId: string;
    loading: boolean;
    style: {
      top: string;
      left: string;
      width: string;
    };
  }

  const props = defineProps({
    images: {
      type: Array<Media>,
      default: [],
    },
    columnWidth: {
      type: Number,
      default: 0,
    },
    gutter: {
      type: Number,
      default: 0,
    },
  });

  const containerRef = ref<HTMLElement | null>(null);
  const items = ref<WaterfallItem[]>([]);

  const initializeWaterfall = () => {
    if (!containerRef.value) return;

    const columnHeights: number[] = [];
    const columnCount = Math.floor(containerRef.value.clientWidth / props.columnWidth);

    for (let i = 0; i < columnCount; i++) {
      columnHeights[i] = 0;
    }

    const tempItems: WaterfallItem[] = new Array(props.images.length);

    const promises = props.images.map((image, index) => {
      return new Promise<void>((resolve) => {
        const src = image.filePath;
        const mediaId = image.mediaId;
        const loading = image.status === 'in_progress';
        const img = new Image();
        img.src = src;
        img.onload = () => {
          const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const top = columnHeights[columnIndex];
          const left = columnIndex * (props.columnWidth + props.gutter);

          // 计算下一列高度
          columnHeights[columnIndex] += img.height * (props.columnWidth / img.width) + props.gutter;

          tempItems[index] = {
            src,
            mediaId,
            loading,
            style: {
              top: `${top}px`,
              left: `${left}px`,
              width: `${props.columnWidth}px`,
            },
          };

          resolve();
        };
      });
    });

    Promise.all(promises).then(() => {
      items.value = tempItems;
    });
  };

  onMounted(() => {
    nextTick(() => {
      initializeWaterfall();
      window.addEventListener('resize', initializeWaterfall);
    });
  });

  watch(
    () => props.images,
    () => {
      nextTick(initializeWaterfall);
    },
  );

  onBeforeUnmount(() => {
    window.removeEventListener('resize', initializeWaterfall);
  });
</script>
