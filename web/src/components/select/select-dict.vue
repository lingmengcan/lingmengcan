<script setup lang="ts">
  import { PropType, onMounted, ref, watchEffect } from 'vue';
  import { useDictStore } from '@/store/modules/dict';

  interface SelectOption {
    label: string;
    value: string;
  }

  interface SelectGroupOption {
    group: string;
    children: SelectOption[];
  }

  const props = defineProps({
    dictType: {
      type: [Array, String, null] as PropType<string | string[] | null>,
      default: null,
    },
    dictCode: {
      type: [Array, String, null] as PropType<string | string[] | null>,
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    grouped: {
      type: Boolean,
      default: false,
    },
  });

  const selectValue = ref(props.dictCode);

  const emit = defineEmits(['update:dictCode', 'update:dictName']);

  // 状态select options
  const options = ref<Array<SelectOption | SelectGroupOption>>([]);

  //监控父组件变化
  watchEffect(() => {
    selectValue.value = props.dictCode;
  });

  const handleSelect = (value: string | (string | number)[], context: any) => {
    if (Array.isArray(context.selectedOptions)) {
      const labels = context.selectedOptions.map((opt: any) => opt.label);
      emit('update:dictName', labels);
    } else {
      emit('update:dictName', context.selectedOptions?.label);
    }

    emit('update:dictCode', value);
  };

  onMounted(async () => {
    const type = props.dictType ? props.dictType : '';
    const dictArray = await useDictStore().getDictListByType(type);

    if (type) {
      const groups: Array<SelectOption | SelectGroupOption> = [];

      // 创建一个映射，将每个 dictType 与父类型名称关联起来
      const parentNameMap = dictArray.reduce((acc, dataItem) => {
        acc[dataItem.dictCode] = dataItem.dictName;
        return acc;
      }, {});

      dictArray.forEach((dict) => {
        const parentName = parentNameMap[dict.dictType];

        // 判断是否存在父类型
        if (parentName) {
          if (!groups[dict.dictType]) {
            groups[dict.dictType] = {
              group: parentName,
              children: [],
            };
          }
          groups[dict.dictType].children.push({
            label: dict.dictName,
            value: dict.dictCode,
          });
        } else {
          const hasChildren = dictArray.some((dataItem) => dataItem.dictType === dict.dictCode);

          if (!hasChildren) {
            groups.push({
              label: dict.dictName,
              value: dict.dictCode,
            });
          }
        }
      });

      const result = Object.values(groups);

      options.value = result;
    } else {
      options.value = dictArray.map((item) => ({
        label: item.dictName,
        value: item.dictCode,
      }));
    }
  });
</script>

<template>
  <t-select :value="selectValue" :multiple="multiple" :options="options" filterable @change="handleSelect" />
</template>
