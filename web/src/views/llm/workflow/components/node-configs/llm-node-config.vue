<template>
  <div>
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- 模型选择 -->
      <t-collapse-panel value="model" header="模型">
        <div class="flex items-center gap-2">
          <selectModel
            v-model:model-name="localConfig.model"
            class="flex-1"
            size="small"
            model-type="GENERAL_LLM"
            @update:model-name="updateConfig"
          />
          <!-- 模型参数弹窗 -->
          <t-popup placement="bottom-right" trigger="click">
            <t-button variant="outline" size="small">
              <t-icon name="setting" />
            </t-button>
            <template #content>
              <div class="p-5 text-xs">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-base font-semibold">temperature</span>
                    <span class="text-base font-semibold">{{ localConfig.temperature }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mb-4 leading-relaxed">
                    较高的数值会使输出更加随机，而较低的数值会使其更加集中和确定
                  </p>
                  <t-slider v-model="localConfig.temperature" :min="0" :max="2" :step="0.01" @change="updateConfig" />
                </div>

                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-base font-semibold">top_p</span>
                    <span class="text-base font-semibold">{{ localConfig.topP }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mb-4 leading-relaxed">
                    影响输出文本的多样性，取值越大，生成文本的多样性越强
                  </p>
                  <t-slider v-model="localConfig.topP" :min="0" :max="1" :step="0.01" @change="updateConfig" />
                </div>

                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-base font-semibold">max tokens</span>
                    <span class="text-base font-semibold">{{ localConfig.maxTokens }}</span>
                  </div>
                  <p class="text-sm text-gray-500 mb-4 leading-relaxed">最大 token 的数量</p>
                  <t-slider v-model="localConfig.maxTokens" :min="0" :max="8192" :step="1" @change="updateConfig" />
                </div>
              </div>
            </template>
          </t-popup>
        </div>
      </t-collapse-panel>

      <!-- 输入 -->
      <t-collapse-panel value="input" header="输入">
        <!-- 变量名 -->
        <t-space size="small">
          <t-form-item label="变量名" class="compact-form-item">
            <t-input v-model="localConfig.variableName" placeholder="input" size="small" @change="updateConfig" />
          </t-form-item>
          <!-- 变量类型 -->
          <t-form-item label="变量类型" class="compact-form-item">
            <t-select v-model="localConfig.inputType" placeholder="Text" size="small" @change="updateConfig">
              <t-option value="text" label="Text" />
              <t-option value="json" label="Json" />
              <t-option value="number" label="Number" />
              <t-option value="boolean" label="Boolean" />
            </t-select>
          </t-form-item>
        </t-space>
      </t-collapse-panel>

      <!-- 系统提示词 -->
      <t-collapse-panel value="systemPrompt" header="系统提示词">
        <t-textarea
          v-model="localConfig.systemPrompt"
          size="small"
          placeholder="系统提示词，可以使用{{变量名}}、{{变量名.子变量名}}、{{变量名[数组索引]}}的方式引用输入参数中的变量"
          :autosize="{ minRows: 4, maxRows: 8 }"
          @change="updateConfig"
        />
      </t-collapse-panel>

      <!-- 用户提示词 -->
      <t-collapse-panel value="userPrompt" header="用户提示词">
        <t-textarea
          v-model="localConfig.userPrompt"
          size="small"
          placeholder="用户提示词，可以使用{{变量名}}、{{变量名.子变量名}}、{{变量名[数组索引]}}的方式引用输入参数中的变量"
          :autosize="{ minRows: 4, maxRows: 8 }"
          @change="updateConfig"
        />
      </t-collapse-panel>

      <!-- 输出 -->
      <t-collapse-panel value="output" header="输出">
        <!-- 节点名称和输出类型 -->
        <t-space size="small">
          <t-form-item label="输出变量" class="compact-form-item">
            <t-input v-model="localConfig.variableName" placeholder="output" size="small" @change="updateConfig" />
          </t-form-item>

          <!-- 输出类型 -->
          <t-form-item label="变量类型" class="compact-form-item">
            <t-select v-model="localConfig.outputType" placeholder="text" size="small" @change="updateConfig">
              <t-option value="text" label="Text" />
              <t-option value="json" label="Json" />
            </t-select>
          </t-form-item>
        </t-space>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import selectModel from '@/components/select/select-model.vue';

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

  // 折叠面板激活状态
  const activeNames = ref(['model', 'systemPrompt', 'userPrompt', 'output']);

  // 本地配置副本
  const localConfig = ref({
    label: props.node?.data?.label || 'LLM插件',
    model: props.node?.data?.config?.model || 'lingmengcan',
    temperature: props.node?.data?.config?.temperature ?? 0.5,
    maxTokens: props.node?.data?.config?.maxTokens || 4096,
    topP: props.node?.data?.config?.topP ?? 1,
    systemPrompt: props.node?.data?.config?.systemPrompt || '',
    userPrompt: props.node?.data?.config?.userPrompt || '',
    outputVariable: props.node?.data?.config?.outputVariable || 'output',
    outputType: props.node?.data?.config?.outputType || 'string',
    variableName: props.node?.data?.config?.variableName || 'input',
    inputType: props.node?.data?.config?.inputType || 'text',
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || 'LLM插件',
          model: newNode.data?.config?.model || 'hunyuan-standard',
          temperature: newNode.data?.config?.temperature ?? 0.5,
          maxTokens: newNode.data?.config?.maxTokens || 1000,
          topP: newNode.data?.config?.topP ?? 1,
          systemPrompt: newNode.data?.config?.systemPrompt || '',
          userPrompt: newNode.data?.config?.userPrompt || '',
          outputVariable: newNode.data?.config?.outputVariable || 'output',
          outputType: newNode.data?.config?.outputType || 'string',
          variableName: newNode.data?.config?.variableName || 'input',
          inputType: newNode.data?.config?.inputType || 'text',
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
        outputVariable: localConfig.value.outputVariable,
        outputType: localConfig.value.outputType,
        variableName: localConfig.value.variableName,
        inputType: localConfig.value.inputType,
      },
    });
  };
</script>

<style scoped>
  .compact-collapse :deep(.t-collapse-panel) {
    border-bottom: 1px solid #e7e7e7;
    padding: 8px;
  }

  .compact-collapse :deep(.t-collapse-panel__header) {
    padding: 2px 0px;
  }

  .compact-collapse :deep(.t-collapse-panel__content) {
    padding: 8px;
  }

  .compact-form-item {
    margin: 0px;
  }

  .compact-form-item :deep(.t-form__label) {
    color: #999;
    font-size: 12px;
  }
</style>
