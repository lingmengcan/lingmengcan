<template>
  <div class="flex w-full h-full overflow-hidden rounded-md">
    <div class="relative flex h-full w-[500px] flex-col py-3 transition-all bg-[#ffffff99]">
      <div class="px-4">
        <span class="text-base">{{ $t('views.draw.stableDiffusion.model') }}</span>
        <t-tag>{{ modelName }}</t-tag>
        <selectModel
          v-model:model-name="modelName"
          v-model:model-code="txt2imgParams.override_settings.sd_model_checkpoint"
        />
      </div>
      <t-tabs size="large" placement="top" default-value="txt2img" class="flex-1 flex flex-col overflow-hidden">
        <t-tab-panel value="txt2img" :label="$t('views.draw.stableDiffusion.txt2img')" class="flex-1 overflow-hidden">
          <stableDiffusion v-model:txt2img-params="txt2imgParams" v-model:lora-list="loraList" />
        </t-tab-panel>
        <t-tab-panel value="img2img" :label="$t('views.draw.stableDiffusion.img2img')" class="flex-1 overflow-hidden">
          <stableDiffusion v-model:txt2img-params="txt2imgParams" v-model:lora-list="loraList" />
        </t-tab-panel>
        <t-tab-panel value="2video" :label="$t('views.draw.stableDiffusion.genVideo')" disabled></t-tab-panel>
      </t-tabs>
      <div class="flex justify-center pt-3 border-t">
        <t-button theme="primary" :loading="generating" @click="handleGenerate">生成图片</t-button>
      </div>
    </div>

    <div ref="scrollRef" class="flex-1 pl-5 overflow-auto" @scroll="handleScroll">
      <div v-masonry transition-duration="0s" :gutter="10" item-selector=".masonry-item">
        <div v-for="image in images" :key="image.mediaId" v-masonry-tile class="w-64 masonry-item">
          <div
            v-if="image.status === 'in_progress'"
            class="flex items-center justify-center w-64 h-64 mb-3 bg-white rounded-md opacity-50"
          >
            <t-loading size="large" />
          </div>

          <t-image v-else :src="image.filePath" class="w-full mb-3 rounded-md" fit="cover" />
        </div>
      </div>
      <div v-if="scrolling" class="flex items-center justify-center py-4">
        <t-loading size="small" />
        <span class="ml-2">加载中...</span>
      </div>
      <div v-if="noMore" class="flex items-center justify-center py-4">
        <t-tag variant="outline">没有更多了</t-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, computed } from 'vue';
  import selectModel from './components/select-model.vue';
  import stableDiffusion from './components/stable-diffusion.vue';
  import { Media, Txt2ImgParams } from '@/models/draw';
  import { getMediaList, txt2img } from '@/api/draw';

  const modelName = ref('SD 1.5');
  const loraList = ref<Array<String>>([]);

  const txt2imgParams = reactive<Txt2ImgParams>({
    prompt: 'masterpiece, best quality, Winter, snow, forest, sun slanting, dark clouds',
    negative_prompt:
      'sfw, (worst quality:2), (low quality:2), (normal quality:2), lowers, monochrome, blurry, (wrong:2), (Mutated hands and fingers:1.5), text',
    seed: -1, // 随机种子，用于控制生成的随机性
    sampler_name: 'DPM++ 2M', // 采样器的名称
    batch_size: 1, // 每批次生成的图像数量
    steps: 20, // 生成步骤数
    cfg_scale: 7, // CFG比例，控制图像生成的一致性
    width: 512, // 图像宽度
    height: 512, // 图像高度
    restore_faces: false, // 是否修复面部
    denoising_strength: 0.7, // 去噪强度
    override_settings: { sd_model_checkpoint: 'v1-5-pruned-emaonly.safetensors [6ce0161689]' }, // 覆盖设置，包含自定义的设置
    enable_hr: false, // 是否启用高分辨率
    hr_upscaler: 'Latent', // 高分辨率上高清算法
    hr_second_pass_steps: 0, // 高分辨率第二阶段步骤数
    hr_resize_x: 1024, // 高分辨率调整后的宽度
    hr_resize_y: 1024, // 高分辨率调整后的高度
    sampler_index: 'DPM++ 2M', // 采样方法
    alwayson_scripts: {
      controlnet: {
        args: [],
      },
    },
  });

  const generating = ref(false);

  // 定义图片数组
  const images = ref<Media[]>([]);
  const page = ref<number>(1);
  const pageSize = ref<number>(10);
  const itemCount = ref(0);

  const scrollRef = ref<HTMLElement | null>(null);
  const scrolling = ref(false);

  const noMore = computed(() => pageSize.value * page.value > itemCount.value);

  // 获取所有图片
  const getImages = async (currentPage: number, currentPageSize = 10) => {
    try {
      const requestData = {
        mediaType: 'image',
        status: 'completed',
        page: currentPage,
        pageSize: currentPageSize,
      };

      const res = await getMediaList(requestData);

      if (res?.code === 0) {
        if (currentPage === 1) {
          images.value = res.data?.list;
        } else {
          images.value.push(...res.data?.list);
        }

        page.value = currentPage;
        pageSize.value = currentPageSize;
        itemCount.value = res.data.count;
      }
    } catch (err) {
      images.value = [];
    }
  };

  const handleGenerate = async () => {
    for (let i = 0; i < txt2imgParams.batch_size; i++) {
      images.value.unshift({
        mediaId: `mediaId${i}`,
        mediaType: 'image',
        fileName: '',
        filePath: '',
        ai: '',
        generationParameters: '',
        status: 'in_progress',
      });
    }

    generating.value = true;
    const prompt = `${txt2imgParams.prompt} ${loraList.value.join(' ')}`;

    const requestData = {
      ...txt2imgParams,
      prompt,
    };

    const res = await txt2img(requestData);

    if (res?.code === 0) {
      images.value.splice(0, txt2imgParams.batch_size);

      const txt2imgs = res.data.images;

      images.value.unshift(...txt2imgs);

      generating.value = false;
    }
  };

  // 处理滚动加载
  const handleScroll = async (e: Event) => {
    if (scrolling.value || noMore.value) return;

    const target = e.target as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = target;

    // 当滚动到距离底部10px时触发加载
    if (scrollHeight - scrollTop - clientHeight < 10) {
      scrolling.value = true;
      await getImages(page.value + 1, pageSize.value);
      scrolling.value = false;
    }
  };

  onMounted(async () => {
    await getImages(page.value, pageSize.value);
  });
</script>

<style lang="less" scoped>
  :deep(.t-tabs__content) {
    height: 100%;
    overflow: hidden;
  }

  :deep(.t-tab-panel) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
