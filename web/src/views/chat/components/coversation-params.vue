<template>
  <t-popup :visible="paramVisible">
    <t-button shape="circle" theme="default" @click="handleToggle">
      <template #icon><SettingIcon /></template>
    </t-button>
    <template #content>
      <div class="p-3 min-w-96">
        <!-- 顶部标题栏 -->
        <div class="flex justify-between items-center mb-4">
          <h2>高级参数</h2>
          <t-button variant="text" @click="handleToggle">
            <close-icon class="hover:text-blue" />
          </t-button>
        </div>

        <!-- 参数表单 -->
        <t-space direction="vertical" class="w-full">
          <t-row>system prompt</t-row>
          <t-row>
            <t-textarea
              v-model="conversation.systemPrompt"
              placeholder="For mathematical formulas, please wrap the formula with $$ or $"
            />
          </t-row>
          <t-row>temperature</t-row>
          <t-row>
            <t-slider
              v-model="conversation.temperature"
              size="small"
              :min="0"
              :max="1"
              :step="0.1"
              :inputNumberProps="inputNumberConfig"
            />
          </t-row>
          <t-row>top_p</t-row>
          <t-row>
            <t-slider
              v-model="conversation.topP"
              size="small"
              :min="0"
              :max="1"
              :step="0.1"
              :inputNumberProps="inputNumberConfig"
            />
          </t-row>
          <t-row>max_tokens</t-row>
          <t-row>
            <t-slider
              v-model="conversation.maxTokens"
              size="small"
              :min="1"
              :max="9999"
              :inputNumberProps="inputNumberConfig"
            />
          </t-row>
        </t-space>

        <!-- 底部操作栏 -->
        <div class="flex justify-between items-center pt-4 mt-8 border-t">
          <div class="flex gap-3">
            <t-button variant="outline" @click="handleToggle">取消</t-button>
            <t-button type="button" theme="primary" @click="handleEditParams">确定</t-button>
          </div>
        </div>
      </div>
    </template>
  </t-popup>
</template>

<script lang="ts" setup>
  import { computed, PropType, ref } from 'vue';
  import { Conversation } from '@/models/chat';
  import { SettingIcon, CloseIcon } from 'tdesign-icons-vue-next';
  import { useChatStore } from '@/store/modules/chat';

  const props = defineProps({
    modelValue: {
      type: Object as PropType<Conversation>,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const conversation = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val),
  });

  const paramVisible = ref(false);

  const inputNumberConfig = ref({
    theme: 'normal', // 主题样式
    style: { width: '50px' }, // 自定义样式
    size: 'small', // 尺寸
  });

  const handleEditParams = () => {
    // 编辑逻辑
    if (conversation.value.conversationId) {
      useChatStore().updateConversation(conversation.value);
    }
    paramVisible.value = false;
  };

  const handleToggle = () => {
    // 取消逻辑
    paramVisible.value = !paramVisible.value;
  };
</script>
