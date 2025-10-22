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
            <t-input v-model="localConfig.inputVariable" placeholder="input" size="small" @change="updateConfig" />
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
            <t-input v-model="localConfig.outputVariable" placeholder="output" size="small" @change="updateConfig" />
          </t-form-item>

          <!-- 输出类型 -->
          <t-form-item label="变量类型" class="compact-form-item">
            <t-select v-model="localConfig.outputType" placeholder="text" size="small" @change="updateConfig">
              <t-option value="text" label="Text" />
              <t-option value="json" label="Json" />
            </t-select>
          </t-form-item>
        </t-space>
        <div class="flex items-center gap-2 text-xs pt-2">
          <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded">reasoning_content</span>
          <span class="text-gray-500">string</span>
        </div>
      </t-collapse-panel>
    </t-collapse>

    <!-- 运行测试面板 - 使用 t-drawer -->
    <t-drawer
      v-model:visible="testRunnerVisible"
      placement="bottom"
      :show-overlay="false"
      :close-btn="true"
      :footer="false"
      size="100%"
      show-in-attached-element
      class="test-runner-drawer"
    >
      <template #header>试运行</template>

      <!-- 试运行输入 -->
      <div class="p-3">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium">试运行输入</span>
        </div>

        <!-- 输入变量 -->
        <div class="mb-4">
          <div class="text-xs text-gray-500 mb-1">
            input
            <span class="text-gray-400">String</span>
          </div>
          <t-textarea v-model="testInput" placeholder="你好！" :autosize="{ minRows: 4, maxRows: 6 }" class="w-full" />
        </div>

        <!-- 运行按钮 -->
        <t-button theme="primary" size="medium" :loading="testStatus === 'running'" @click="runTest" block>
          <template #icon><t-icon name="play-circle" /></template>
          运行
        </t-button>

        <!-- 运行结果显示 -->
        <div v-if="testStatus === 'success' || testStatus === 'error'" class="mt-4">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-medium">运行结果</span>
            <div class="text-xs text-gray-500">耗时: {{ testDuration }}s | Tokens: {{ testTokens }}</div>
          </div>

          <!-- 输入 JSON -->
          <div class="mb-3">
            <div class="text-xs text-gray-500 mb-1">输入</div>
            <t-textarea
              :value="JSON.stringify(testInputJson, null, 2)"
              readonly
              :autosize="{ minRows: 3, maxRows: 6 }"
              class="w-full font-mono text-xs"
            />
          </div>

          <!-- 输出 JSON -->
          <div class="mb-3">
            <div class="text-xs text-gray-500 mb-1">输出</div>
            <t-textarea
              :value="JSON.stringify(testOutputJson, null, 2)"
              readonly
              :autosize="{ minRows: 3, maxRows: 8 }"
              class="w-full font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </t-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import selectModel from '@/components/select/select-model.vue';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { debugChat } from '@/api/chat/chat';

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

  // 运行测试相关状态
  const testRunnerVisible = ref(false);
  const testInput = ref('你好！');
  const testStatus = ref<'idle' | 'running' | 'success' | 'error'>('idle');
  const testDuration = ref(1);
  const testTokens = ref(0);
  const testInputJson = ref({});
  const testOutputJson = ref({});

  // 本地配置副本
  const localConfig = ref({
    label: props.node?.data?.label,
    model: props.node?.data?.config?.model,
    temperature: props.node?.data?.config?.temperature,
    maxTokens: props.node?.data?.config?.maxTokens,
    topP: props.node?.data?.config?.topP,
    systemPrompt: props.node?.data?.config?.systemPrompt,
    userPrompt: props.node?.data?.config?.userPrompt,
    outputVariable: props.node?.data?.config?.outputVariable,
    outputType: props.node?.data?.config?.outputType,
    inputVariable: props.node?.data?.config?.inputVariable,
    inputType: props.node?.data?.config?.inputType,
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label,
          model: newNode.data?.config?.model,
          temperature: newNode.data?.config?.temperature,
          maxTokens: newNode.data?.config?.maxTokens,
          topP: newNode.data?.config?.topP ?? 1,
          systemPrompt: newNode.data?.config?.systemPrompt,
          userPrompt: newNode.data?.config?.userPrompt,
          outputVariable: newNode.data?.config?.outputVariable,
          outputType: newNode.data?.config?.outputType,
          inputVariable: newNode.data?.config?.inputVariable,
          inputType: newNode.data?.config?.inputType,
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
        inputVariable: localConfig.value.inputVariable,
        inputType: localConfig.value.inputType,
      },
    });
  };

  // 流处理函数
  const fetchSSE = async (
    fetchFn: () => Promise<Response>,
    options: { success: (chunk: string) => void; fail?: () => void; complete?: (isOk: boolean, msg?: string) => void },
  ) => {
    const response = await fetchFn();
    const { success, fail, complete } = options;
    // 如果不 ok 说明有请求错误
    if (!response.ok) {
      complete?.(false, response.statusText);
      fail?.();
      return;
    }
    const reader = response?.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) return;

    reader.read().then(function processText({ done, value }) {
      if (done) {
        // 正常的返回
        complete?.(true);
        return;
      }
      const chunk = decoder.decode(value, { stream: true });
      success(chunk);
      reader.read().then(processText);
    });
  };

  // 运行测试
  const runTest = async () => {
    if (testStatus.value === 'running') return;

    testStatus.value = 'running';
    const startTime = Date.now();

    try {
      // 构建请求数据
      const messages: Array<{ role: string; content: string }> = [];

      // 添加系统提示词
      if (localConfig.value.systemPrompt) {
        messages.push({
          role: 'system',
          content: localConfig.value.systemPrompt,
        });
      }

      // 添加用户输入
      const userContent = localConfig.value.userPrompt
        ? localConfig.value.userPrompt.replace(/\{\{input\}\}/g, testInput.value)
        : testInput.value;

      messages.push({
        role: 'user',
        content: userContent,
      });

      // 构建请求数据
      const requestData = {
        model: localConfig.value.model,
        messages,
        temperature: localConfig.value.temperature,
        max_tokens: localConfig.value.maxTokens,
        top_p: localConfig.value.topP,
      };

      // 保存输入 JSON
      testInputJson.value = {
        [localConfig.value.inputVariable]: userContent,
      };

      // 调用调试 API 使用 fetchSSE
      let responseText = '';
      let reasoningContent = '';

      await fetchSSE(() => debugChat(requestData), {
        success: (chunk: string) => {
          // 尝试解析 JSON 格式的响应
          try {
            const lines = chunk.split('\n').filter((line) => line.trim());
            for (const line of lines) {
              const data = JSON.parse(line);
              if (data.content) {
                responseText += data.content;
              }
              if (data.reasoning_content) {
                reasoningContent = data.reasoning_content;
              }
            }
          } catch (e) {
            // 如果不是 JSON 格式，直接添加到响应文本
            responseText += chunk;
          }
        },
        complete: (isOk: boolean, msg?: string) => {
          testDuration.value = Math.round((Date.now() - startTime) / 1000);
          if (isOk) {
            testTokens.value = Math.floor(responseText.length / 4); // 简单估算 token 数
            testStatus.value = 'success';

            // 保存输出 JSON
            testOutputJson.value = {
              [localConfig.value.outputVariable]: responseText,
              reasoning_content: reasoningContent, // 使用从接口获取的推理内容
            };

            MessagePlugin.success(`测试运行成功，耗时 ${testDuration.value}s`);
          } else {
            testStatus.value = 'error';

            // 保存错误输出 JSON
            testOutputJson.value = {
              error: msg || '未知错误',
            };

            MessagePlugin.error(`测试运行失败: ${msg || '未知错误'}`);
          }
        },
        fail: () => {
          testDuration.value = Math.round((Date.now() - startTime) / 1000);
          testStatus.value = 'error';

          // 保存失败输出 JSON
          testOutputJson.value = {
            error: '网络请求失败',
          };

          MessagePlugin.error('测试运行失败');
        },
      });
    } catch (error: any) {
      testDuration.value = Math.round((Date.now() - startTime) / 1000);
      testStatus.value = 'error';

      // 保存异常错误的输出 JSON
      testOutputJson.value = {
        error: error.message,
      };

      MessagePlugin.error(`测试运行失败: ${error.message}`);
    }
  };

  // 监听来自 llm-node 的运行事件
  const handleNodeRun = (event: CustomEvent) => {
    const { nodeId } = event.detail;
    if (nodeId === props.node?.id) {
      testRunnerVisible.value = true;
    }
  };

  // 组件挂载时添加事件监听
  if (typeof window !== 'undefined') {
    window.addEventListener('llm-node-run', handleNodeRun as EventListener);
  }
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
