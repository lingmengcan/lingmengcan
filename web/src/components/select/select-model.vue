<script setup lang="ts">
  import { useLlmStore } from '@/store/modules/llm';
  import { PropType, onMounted, ref } from 'vue';

  interface SelectOption {
    label: string;
    value: string;
  }

  const props = defineProps({
    modelType: {
      type: [String, null] as PropType<string | null>,
      default: null,
    },
    modelName: {
      type: String as PropType<string | null>,
      default: null,
    },
  });

  const emit = defineEmits(['update:modelName']);

  // 状态select options
  const options = ref<SelectOption[]>([]);

  const handleSelect = (value: string) => {
    emit('update:modelName', value);
  };

  onMounted(async () => {
    const modelList = props.modelType ? await useLlmStore().getLlmListByType(props.modelType) : [];

    options.value = modelList.map((item) => ({
      label: item.modelName,
      value: item.modelName,
    }));
  });
</script>

<template>
  <t-select :value="modelName" :options="options" @change="handleSelect" />
</template>
