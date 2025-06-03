<template>
  <t-row :gutter="6">
    <t-col :span="6">{{ label }}</t-col>
    <t-col :span="3">
      <t-input-number v-model="sliderValue" :min="min" :max="max" :step="step" theme="normal" size="small" />
    </t-col>
  </t-row>
  <t-row :gutter="6">
    <t-slider v-model="sliderValue" class="flex-1" :min="min" :max="max" :step="step" />
  </t-row>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const props = defineProps({
    modelValue: Number,
    label: String,
    min: Number,
    max: Number,
    step: Number,
  });

  const emit = defineEmits(['update:modelValue']);

  const sliderValue = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });
</script>
