<script lang="ts" setup>
  import { ref, unref, onMounted, nextTick } from 'vue';
  import { useRoute } from 'vue-router';

  const currentRoute = useRoute();
  const loading = ref(false);
  const frameRef = ref<HTMLIFrameElement | null>(null);
  const frameSrc = ref<string>('');

  if (unref(currentRoute.meta)?.frameSrc) {
    frameSrc.value = unref(currentRoute.meta)?.frameSrc as string;
  }

  function hideLoading() {
    loading.value = false;
  }

  function init() {
    nextTick(() => {
      const iframe = unref(frameRef);
      if (!iframe) return;
      const _frame = iframe as any;
      if (_frame.attachEvent) {
        _frame.attachEvent('onload', () => {
          hideLoading();
        });
      } else {
        iframe.onload = () => {
          hideLoading();
        };
      }
    });
  }

  onMounted(() => {
    loading.value = true;
    init();
  });
</script>

<template>
  <t-loading :loading="loading" text="加载中...">
    <div class="w-full h-screen">
      <iframe
        ref="frameRef"
        :src="frameSrc"
        class="w-full h-full overflow-hidden border-0 box-border"
      ></iframe>
    </div>
  </t-loading>
</template>
