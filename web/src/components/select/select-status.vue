<script setup lang="ts">
  import { PropType, ref, watchEffect } from 'vue';

  const props = defineProps({
    status: {
      type: [Number, String, null] as PropType<number | string | null>,
      default: null,
    },
  });

  const selectValue = ref(props.status);

  const emit = defineEmits(['update:status']);

  // 状态select options
  const statusOptions = ref([
    { label: '正常', value: 0 },
    { label: '停用', value: 1 },
  ]);

  //监控父组件变化
  watchEffect(() => {
    selectValue.value = props.status;
  });

  const handleSelect = (value: number | string) => {
    emit('update:status', value);
  };
</script>

<template>
  <t-select :value="selectValue" :options="statusOptions" @change="handleSelect" />
</template>
