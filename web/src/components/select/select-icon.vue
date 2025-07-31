<template>
  <t-select
    v-model="selectIcon"
    placeholder="请选择图标"
    filterable
    clearable
    :filter="filterMethod"
    :style="{ width: '400px' }"
    :popup-props="{ overlayInnerStyle: { width: '400px' } }"
  >
    <t-option v-for="item in filteredOptions" :key="item.stem" :value="item.stem" class="overlay-options">
      <div>
        <t-icon :name="item.stem" :style="{ marginRight: '2px' }" />
        <span class="text-xs text-gray-600">{{ item.stem }}</span>
      </div>
    </t-option>
    <!-- <template #valueDisplay>
      <div class="flex items-center">
        <t-icon :name="selectIcon" :style="{ marginRight: '8px' }" />
        {{ selectIcon }}
      </div>
    </template> -->
  </t-select>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { manifest } from 'tdesign-icons-vue-next';

  // 获取全部图标的列表
  const options = ref(manifest);
  const filterText = ref('');

  const props = defineProps({
    value: {
      type: String,
      required: true,
    },
  });
  const emit = defineEmits(['updated:value', 'selected']);

  const selectIcon = ref(props.value || '选择图标');

  // 过滤后的图标列表
  const filteredOptions = computed(() => {
    if (!filterText.value) {
      return options.value;
    }
    return options.value.filter((item) => item.stem.toLowerCase().includes(filterText.value.toLowerCase()));
  });

  // 自定义过滤方法
  const filterMethod = (value: string) => {
    filterText.value = value;
    return true; // 返回 true 让组件使用我们的 filteredOptions
  };

  // 监听 selectIcon 变化，并将值更新到父组件
  watch(selectIcon, (newValue) => {
    emit('updated:value', newValue);
    emit('selected', newValue);
  });

  // 监听 props.value 变化，更新本地值
  watch(
    () => props.value,
    (newValue) => {
      if (newValue !== selectIcon.value) {
        selectIcon.value = newValue;
      }
    },
  );
</script>

<style lang="less">
  .overlay-options {
    display: inline-block;
    font-size: 20px;
  }
</style>
