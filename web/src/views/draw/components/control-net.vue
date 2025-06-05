<template>
  <n-grid :cols="6" :x-gap="24" :y-gap="16">
    <n-gi :span="6">
      <div class="pb-1">
        {{ $t('views.draw.stableDiffusion.controlNet.controlType') }}

        <div class="float-right">
          {{ $t('views.draw.stableDiffusion.controlNet.enable') }}
          <n-switch v-model:value="controlNetParamsRef.enabled" size="small" class="align-text-top!"></n-switch>
        </div>
      </div>
      <n-select
        :value="controlNetParamsRef.module"
        :options="controlTypeOptions"
        @update:value="handleControlTypeSelect"
      />
    </n-gi>
    <template v-if="controlNetParamsRef.module">
      <n-gi :span="6">
        <imageUpload v-model:base64Image="controlNetParamsRef.image" />
      </n-gi>
      <n-gi :span="6">
        <inputSlider
          v-model:value="controlNetParamsRef.weight"
          :min="0"
          :max="2"
          :step="0.05"
          :label="$t('views.draw.stableDiffusion.controlNet.weight')"
        />
      </n-gi>
      <n-gi :span="3">
        <inputSlider
          v-model:value="controlNetParamsRef.guidance_start"
          :min="0"
          :max="1"
          :step="0.01"
          :label="$t('views.draw.stableDiffusion.controlNet.guidanceStart')"
        />
      </n-gi>
      <n-gi :span="3">
        <inputSlider
          v-model:value="controlNetParamsRef.guidance_end"
          :min="0"
          :max="1"
          :step="0.01"
          :label="$t('views.draw.stableDiffusion.controlNet.guidanceEnd')"
        />
      </n-gi>
      <n-gi :span="6">
        <inputSlider
          v-model:value="controlNetParamsRef.processor_res"
          :min="64"
          :max="2048"
          :step="1"
          :label="$t('views.draw.stableDiffusion.controlNet.resolution')"
        />
      </n-gi>
      <n-gi v-if="displayControlNetParams?.max_threshold_a" :span="6">
        <inputSlider
          v-model:value="controlNetParamsRef.threshold_a"
          :min="displayControlNetParams.min_threshold_a"
          :max="displayControlNetParams.max_threshold_a"
          :step="displayControlNetParams.threshold_step"
          :label="displayControlNetParams.threshold_a_label"
        />
      </n-gi>
      <n-gi v-if="displayControlNetParams?.max_threshold_b" :span="6">
        <inputSlider
          v-model:value="controlNetParamsRef.threshold_b"
          :min="displayControlNetParams.min_threshold_b"
          :max="displayControlNetParams.max_threshold_b"
          :step="displayControlNetParams.threshold_step"
          :label="displayControlNetParams.threshold_b_label"
        />
      </n-gi>
    </template>
  </n-grid>
</template>

<script setup lang="ts">
  import inputSlider from './input-slider.vue';
  import imageUpload from './image-upload.vue';
  import { onMounted, PropType, ref, watch } from 'vue';
  import { SelectOption, SelectGroupOption } from 'naive-ui';
  import { getPreprocessorList } from '@/api/draw';
  import { ResultEnum } from '@/constants';
  import { ControlNetParams, ControlNetPreprocessor, DisplayControlNetParams } from '@/models/draw';

  const props = defineProps({
    controlNetParams: {
      type: Object as PropType<ControlNetParams>,
      default: null,
    },
  });

  const emit = defineEmits(['update:controlNetParams']);

  // 创建一个ref并初始化为props值
  const controlNetParamsRef = ref<ControlNetParams>({ ...props.controlNetParams });

  const displayControlNetParams = ref<DisplayControlNetParams>();

  // select options
  const controlTypeOptions = ref<Array<SelectOption | SelectGroupOption>>([]);
  const preprocessorList = ref<ControlNetPreprocessor[]>([]);

  const handleControlTypeSelect = (value: string) => {
    preprocessorList.value.forEach((item) => {
      if (item.preprocessorCode === value) {
        displayControlNetParams.value = item.params;
        controlNetParamsRef.value.model = item.params.model;
        controlNetParamsRef.value.threshold_a = item.params.threshold_a;
        controlNetParamsRef.value.threshold_b = item.params.threshold_b;
      }
    });

    controlNetParamsRef.value.module = value;
  };

  // 监听controlNetParamsRef的变化并emit给父组件
  watch(
    controlNetParamsRef,
    (newVal) => {
      emit('update:controlNetParams', newVal);
    },
    { deep: true }, // 深度监听对象的变化
  );

  onMounted(async () => {
    const res = await getPreprocessorList();

    if (res && res.code === ResultEnum.SUCCESS) {
      preprocessorList.value = res.data;

      controlTypeOptions.value = preprocessorList.value.map((item) => ({
        label: item.preprocessorName,
        value: item.preprocessorCode,
      }));
    }
  });
</script>
