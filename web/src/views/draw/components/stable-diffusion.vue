<template>
  <div class="flex-1 px-4 pb-4 overflow-auto">
    <t-row :gutter="[24, 16]">
      <t-col :span="12">
        <div class="pb-1">{{ $t('views.draw.stableDiffusion.personalizedGeneration') }}</div>
        <selectLora v-model:lora-list="loraListValue" @selected="selectedLora" />
      </t-col>
      <t-col :span="12">
        <div class="pb-1">
          {{ $t('views.draw.stableDiffusion.prompt') }}
        </div>
        <t-textarea
          v-model="txt2imgParamsRef.prompt"
          :autosize="{ minRows: 5, maxRows: 5 }"
          placeholder="请输入提示词..."
        />
      </t-col>
      <t-col :span="12">
        <div class="pb-1">
          {{ $t('views.draw.stableDiffusion.negativePrompt') }}
        </div>
        <t-textarea
          v-model="txt2imgParamsRef.negative_prompt"
          :autosize="{ minRows: 3, maxRows: 3 }"
          placeholder="请输入负面提示词..."
        />
      </t-col>
      <t-col :span="12">
        <div class="pb-1">
          {{ $t('views.draw.stableDiffusion.batchSize') }}
          <t-tag class="float-right" size="small">{{ txt2imgParamsRef.batch_size }}</t-tag>
        </div>
        <t-slider v-model="txt2imgParamsRef.batch_size" :min="1" :max="5" :step="1" />
      </t-col>
      <t-col :span="6">
        <div class="pb-1">
          {{ $t('views.draw.stableDiffusion.width') }}
          <t-tag class="float-right" size="small">{{ txt2imgParamsRef.width }}</t-tag>
        </div>
        <t-slider v-model="txt2imgParamsRef.width" :min="64" :max="2048" :step="1" />
      </t-col>
      <t-col :span="6">
        <div class="pb-1">
          {{ $t('views.draw.stableDiffusion.height') }}
          <t-tag class="float-right" size="small">{{ txt2imgParamsRef.height }}</t-tag>
        </div>
        <t-slider v-model="txt2imgParamsRef.height" :min="64" :max="2048" :step="1" />
      </t-col>
      <t-col :span="6">
        <div class="pb-1">
          {{ $t('views.draw.stableDiffusion.steps') }}
          <t-tag class="float-right" size="small">{{ txt2imgParamsRef.steps }}</t-tag>
        </div>
        <t-slider v-model="txt2imgParamsRef.steps" :min="1" :max="99" :step="1" />
      </t-col>
      <t-col :span="6">
        <div class="pb-1">
          {{ $t('views.draw.stableDiffusion.cfgScale') }}
          <t-tag class="float-right" size="small">{{ txt2imgParamsRef.cfg_scale }}</t-tag>
        </div>
        <t-slider v-model="txt2imgParamsRef.cfg_scale" :min="1" :max="30" :step="1" />
      </t-col>
      <t-col :span="6">
        <div class="pb-1">
          {{ $t('views.draw.stableDiffusion.sampler') }}
        </div>
        <selectDict
          v-model:dict-code="txt2imgParamsRef.sampler_index"
          :dict-name="txt2imgParamsRef.sampler_name"
          dict-type="SAMPLER"
        />
      </t-col>
      <t-col :span="6">
        <div class="pb-1">{{ $t('views.draw.stableDiffusion.seed') }}</div>
        <t-input-number v-model="txt2imgParamsRef.seed" theme="normal" />
      </t-col>
      <t-col :span="12">
        <div>
          {{ $t('views.draw.stableDiffusion.restoreFaces') }}
          <t-switch v-model="txt2imgParamsRef.restore_faces" size="small" class="float-right" />
        </div>
      </t-col>
      <t-col :span="12">
        <div>
          {{ $t('views.draw.stableDiffusion.hiresFix') }}

          <t-switch v-model="txt2imgParamsRef.enable_hr" size="small" class="float-right" />
          <transition name="collapse" mode="out-in">
            <t-row v-if="txt2imgParamsRef.enable_hr" :gutter="[24, 16]" class="pt-1">
              <t-col :span="6">
                <div class="py-2">
                  {{ $t('views.draw.stableDiffusion.width') }}
                  <t-tag class="float-right" size="small">{{ txt2imgParamsRef.hr_resize_x }}</t-tag>
                </div>
                <t-slider v-model="txt2imgParamsRef.hr_resize_x" :min="512" :max="3840" :step="1" />
              </t-col>
              <t-col :span="6">
                <div class="py-2">
                  {{ $t('views.draw.stableDiffusion.height') }}
                  <t-tag class="float-right" size="small">
                    {{ txt2imgParamsRef.hr_resize_y }}
                  </t-tag>
                </div>
                <t-slider v-model="txt2imgParamsRef.hr_resize_y" :min="512" :max="3840" :step="1" />
              </t-col>
              <t-col :span="12">
                <div class="pb-1">
                  {{ $t('views.draw.stableDiffusion.upscaler1') }}
                </div>
                <selectDict v-model:dict-code="txt2imgParamsRef.hr_upscaler" dict-type="HIRES_FIX_UPSCALER" />
              </t-col>
              <t-col :span="12">
                <div class="pb-1">
                  {{ $t('views.draw.stableDiffusion.hiresSteps') }}
                  <t-tag class="float-right" size="small">
                    {{ txt2imgParamsRef.hr_second_pass_steps }}
                  </t-tag>
                </div>
                <t-slider v-model="txt2imgParamsRef.hr_second_pass_steps" :min="0" :max="150" :step="1" />
              </t-col>
              <t-col :span="12">
                <div class="pb-1">
                  {{ $t('views.draw.stableDiffusion.denoisingStrength') }}
                  <t-tag class="float-right" size="small">
                    {{ txt2imgParamsRef.denoising_strength }}
                  </t-tag>
                </div>
                <t-slider v-model="txt2imgParamsRef.denoising_strength" :min="0" :max="1" :step="0.1" />
              </t-col>
            </t-row>
          </transition>
        </div>
      </t-col>
      <t-col :span="12">
        <t-collapse>
          <t-collapse-panel header="ControlNet" value="1" size="small">
            <t-tabs
              v-model="controlNetValue"
              theme="card"
              addable
              @add="handleControNetAdd"
              @remove="handleControNetRemove"
            >
              <t-tab-panel
                v-for="(_, index) in controlNetParamsListRef"
                :key="index"
                :value="index"
                :label="$t('views.draw.stableDiffusion.controlNet.control') + ' ' + index"
                :removable="controlNetParamsListRef.length > 1"
              >
                <controlNet v-model:control-net-params="controlNetParamsListRef[index]" />
              </t-tab-panel>
            </t-tabs>
          </t-collapse-panel>
        </t-collapse>
      </t-col>
    </t-row>
  </div>
</template>

<script setup lang="ts">
  import { ref, PropType, reactive, watchEffect } from 'vue';
  import selectLora from './select-lora.vue';
  import controlNet from './control-net.vue';
  import { ControlNetParams, Txt2ImgParams } from '@/models/draw';

  const props = defineProps({
    txt2imgParams: {
      type: Object as PropType<Txt2ImgParams>,
      default: null,
    },

    loraList: {
      type: Array<String>,
      default: [],
    },
  });

  const txt2imgParamsRef = ref(props.txt2imgParams);
  const loraListValue = ref(props.loraList);
  const emit = defineEmits(['update:txt2imgParams', 'update:loraList']);

  const defaultControlNetParams: ControlNetParams = {
    enabled: true, // 启用
    control_mode: 'Balanced', // 对应webui 的 Control Mode 可以直接填字符串 推荐使用下标 0 1 2
    module: undefined, // 对应webui 的 Preprocessor
    weight: 1, // 对应webui 的Control Weight
    resize_mode: 'Crop and Resize',
    guidance_start: 0, // 什么时候介入 对应webui 的 Starting Control Step
    guidance_end: 1, // 什么时候退出 对应webui 的 Ending Control Step
    pixel_perfect: true, // 像素完美
    processor_res: 512, // 预处理器分辨率
    save_detected_map: true, // 因为使用了 controlnet API会返回生成controlnet的效果图，默认是True，如果不需要，改成False
    image: '', // 图片 格式为base64
  };

  const controlNetParamsListRef = reactive(Array.from({ length: 1 }, () => ({ ...defaultControlNetParams })));

  const controlNetValue = ref(0);

  function handleControNetAdd() {
    controlNetParamsListRef.push({ ...defaultControlNetParams });

    controlNetValue.value = controlNetParamsListRef.length - 1;
  }

  function handleControNetRemove(index: number) {
    controlNetParamsListRef.splice(index, 1);

    if (index === controlNetValue.value) {
      controlNetValue.value = Math.min(index, controlNetParamsListRef.length - 1);
    }
  }

  const selectedLora = () => {
    emit('update:loraList', loraListValue.value);
  };

  //监控父组件变化
  watchEffect(() => {
    txt2imgParamsRef.value.alwayson_scripts!.controlnet.args = controlNetParamsListRef;
  });
</script>

<style scoped>
  .collapse-enter-active,
  .collapse-leave-active {
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .collapse-enter-from,
  .collapse-leave-to {
    opacity: 0;
    max-height: 0;
  }

  .collapse-enter-to,
  .collapse-leave-from {
    opacity: 1;
    max-height: 500px;
  }

  :deep(.t-collapse-panel__content) {
    padding: 5px;
  }
</style>
