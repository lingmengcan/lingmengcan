<template>
  <div class="space-y-6">
    <!-- 基础配置 -->
    <div>
      <h4 class="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">基础配置</h4>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">节点名称</label>
        <t-input v-model="localConfig.label" placeholder="请输入节点名称" @change="updateConfig" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">模型选择</label>
        <t-select v-model="localConfig.model" placeholder="请选择模型" @change="updateConfig">
          <t-option value="hunyuan-standard" label="混元标准版" />
          <t-option value="hunyuan-pro" label="混元专业版" />
          <t-option value="gpt-3.5-turbo" label="GPT-3.5 Turbo" />
          <t-option value="gpt-4" label="GPT-4" />
          <t-option value="claude-3" label="Claude-3" />
          <t-option value="qwen-max" label="通义千问" />
        </t-select>
      </div>
    </div>

    <!-- 高级配置 -->
    <div>
      <h4 class="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">高级配置</h4>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">温度 ({{ localConfig.temperature }})</label>
        <t-slider v-model="localConfig.temperature" :min="0" :max="2" :step="0.1" @change="updateConfig" />
        <div class="text-xs text-gray-500 mt-1 leading-relaxed">控制输出的随机性，值越高输出越随机</div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">最大令牌数</label>
        <t-input-number
          v-model="localConfig.maxTokens"
          :min="1"
          :max="4000"
          placeholder="1000"
          @change="updateConfig"
        />
        <div class="text-xs text-gray-500 mt-1 leading-relaxed">限制模型输出的最大长度</div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">Top P</label>
        <t-input-number
          v-model="localConfig.topP"
          :min="0"
          :max="1"
          :step="0.1"
          placeholder="0.9"
          @change="updateConfig"
        />
        <div class="text-xs text-gray-500 mt-1 leading-relaxed">控制输出的多样性</div>
      </div>
    </div>

    <!-- 提示词配置 -->
    <div>
      <h4 class="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">提示词配置</h4>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">系统提示词</label>
        <t-textarea
          v-model="localConfig.systemPrompt"
          placeholder="请输入系统提示词"
          :rows="4"
          @change="updateConfig"
        />
        <div class="text-xs text-gray-500 mt-1 leading-relaxed">定义AI助手的角色和行为</div>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">用户提示词</label>
        <t-textarea
          v-model="localConfig.userPrompt"
          placeholder="请输入用户提示词"
          :rows="3"
          @change="updateConfig"
        />
        <div class="text-xs text-gray-500 mt-1 leading-relaxed">用户输入的具体问题或指令</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    node: any;
  }>();

  const emit = defineEmits<{
    'update-node': [data: NodeData];
  }>();

  // 本地配置副本
  const localConfig = ref({
    label: props.node?.data?.label || 'LLM插件',
    model: 'hunyuan-standard',
    temperature: 0.7,
    maxTokens: 1000,
    topP: 0.9,
    systemPrompt: '',
    userPrompt: '',
    ...props.node?.data?.config,
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          ...localConfig.value,
          label: newNode.data?.label || 'LLM插件',
          ...newNode.data?.config,
        };
      }
    },
    { deep: true },
  );

  // 更新配置
  const updateConfig = () => {
    emit('update-node', {
      label: localConfig.value.label,
      config: {
        model: localConfig.value.model,
        temperature: localConfig.value.temperature,
        maxTokens: localConfig.value.maxTokens,
        topP: localConfig.value.topP,
        systemPrompt: localConfig.value.systemPrompt,
        userPrompt: localConfig.value.userPrompt,
      },
    });
  };
</script>