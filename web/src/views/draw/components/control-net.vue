<template>
  <t-row :gutter="[24, 16]">
    <t-col :span="12">
      <div class="pb-1">
        {{ $t('views.draw.stableDiffusion.controlNet.controlType') }}

        <div class="float-right">
          {{ $t('views.draw.stableDiffusion.controlNet.enable') }}
          <t-switch v-model="controlNetParamsRef.enabled" size="small" class="align-text-top!"></t-switch>
        </div>
      </div>
      <t-select
        v-model="controlNetParamsRef.module"
        :options="controlTypeOptions"
        placeholder="请选择控制类型"
        @change="handleControlTypeSelect"
      />
    </t-col>
    <template v-if="controlNetParamsRef.module">
      <t-col :span="12">
        <imageUpload v-model:base64Image="controlNetParamsRef.image" />
      </t-col>
      <t-col :span="12">
        <inputSlider
          v-model:value="controlNetParamsRef.weight"
          :min="0"
          :max="2"
          :step="0.05"
          :label="$t('views.draw.stableDiffusion.controlNet.weight')"
        />
      </t-col>
      <t-col :span="6">
        <inputSlider
          v-model:value="controlNetParamsRef.guidance_start"
          :min="0"
          :max="1"
          :step="0.01"
          :label="$t('views.draw.stableDiffusion.controlNet.guidanceStart')"
        />
      </t-col>
      <t-col :span="6">
        <inputSlider
          v-model:value="controlNetParamsRef.guidance_end"
          :min="0"
          :max="1"
          :step="0.01"
          :label="$t('views.draw.stableDiffusion.controlNet.guidanceEnd')"
        />
      </t-col>
      <t-col :span="12">
        <inputSlider
          v-model:value="controlNetParamsRef.processor_res"
          :min="64"
          :max="2048"
          :step="1"
          :label="$t('views.draw.stableDiffusion.controlNet.resolution')"
        />
      </t-col>
      <t-col v-if="displayControlNetParams?.max_threshold_a" :span="12">
        <inputSlider
          v-model:value="controlNetParamsRef.threshold_a"
          :min="displayControlNetParams.min_threshold_a"
          :max="displayControlNetParams.max_threshold_a"
          :step="displayControlNetParams.threshold_step"
          :label="displayControlNetParams.threshold_a_label"
        />
      </t-col>
      <t-col v-if="displayControlNetParams?.max_threshold_b" :span="12">
        <inputSlider
          v-model:value="controlNetParamsRef.threshold_b"
          :min="displayControlNetParams.min_threshold_b"
          :max="displayControlNetParams.max_threshold_b"
          :step="displayControlNetParams.threshold_step"
          :label="displayControlNetParams.threshold_b_label"
        />
      </t-col>
    </template>
  </t-row>
</template>

<script setup lang="ts">
  import inputSlider from './input-slider.vue';
  import imageUpload from './image-upload.vue';
  import { onMounted, PropType, ref, watch } from 'vue';
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
  const controlTypeOptions = ref<Array<{ label: string; value: string }>>([]);
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
