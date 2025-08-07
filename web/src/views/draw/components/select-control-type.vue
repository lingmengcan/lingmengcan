<script setup lang="ts">
  import { PropType, onMounted, ref, watchEffect } from 'vue';
  import { getPreprocessorList } from '@/api/draw';
  import { ResultEnum } from '@/constants';
  import { ControlNetParams, ControlNetPreprocessor } from '@/models/draw';

  const props = defineProps({
    controlNetParams: {
      type: Object as PropType<ControlNetParams>,
      default: null,
    },
    preprocessorCode: {
      type: String as PropType<string>,
      default: null,
    },
  });

  const selectValue = ref(props.preprocessorCode);
  const preprocessorList = ref<ControlNetPreprocessor[]>([]);

  const emit = defineEmits(['update:preprocessorCode', 'update:controlNetParams']);

  // select options
  const options = ref<Array<{ label: string; value: string }>>([]);

  //监控父组件变化
  watchEffect(() => {
    selectValue.value = props.preprocessorCode;
  });

  const handleSelect = (value: string) => {
    preprocessorList.value.forEach((item) => {
      if (item.preprocessorCode === value) {
        emit('update:controlNetParams', item.params);
      }
    });

    emit('update:preprocessorCode', value);
  };

  onMounted(async () => {
    const res = await getPreprocessorList();

    if (res && res.code === ResultEnum.SUCCESS) {
      const list = res.data;
      preprocessorList.value = list;

      options.value = list.map((item) => ({
        label: item.preprocessorName,
        value: item.preprocessorCode,
      }));
    }
  });
</script>

<template>
  <t-select v-model="selectValue" :options="options" filterable placeholder="请选择预处理器" @change="handleSelect" />
</template>
