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

      <!-- 输入变量 -->
      <t-collapse-panel value="input">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">输入变量</span>
            </div>
            <t-button variant="text" size="small" class="text-blue-500" @click.stop="addInput">
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div>
          <t-empty v-if="localConfig.inputs.length === 0" description="暂无输入变量" />
          <div v-for="(input, index) in localConfig.inputs" :key="index" class="mb-2">
            <div class="flex items-center gap-2">
              <!-- 变量名 -->
              <t-input
                :model-value="input.name"
                @update:model-value="(value) => updateInputName(index, value)"
                placeholder="变量名"
                size="small"
                style="width: 120px"
              />
              <!-- 类型 -->
              <selectDict
                :model-value="input.type"
                @update:model-value="(value) => updateInputType(index, value)"
                dict-type="INPUT_TYPE"
                size="small"
                style="width: 80px"
              />
              <!-- 数据源选择 -->
              <t-select
                :model-value="input.source"
                @update:model-value="(value) => updateInputSource(index, value)"
                placeholder="选择来源"
                size="small"
                clearable
                class="flex-1"
              >
                <t-option
                  v-for="option in availableSourceOptions"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </t-select>
              <!-- 删除按钮 -->
              <t-button variant="text" size="small" class="text-gray-400" @click="removeInput(index)">
                <t-icon name="remove" />
              </t-button>
            </div>
          </div>
        </div>
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
      <t-collapse-panel value="output">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">输出变量</span>
            </div>
            <t-button variant="text" size="small" class="text-blue-500" @click.stop="addOutput">
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div>
          <t-empty v-if="localConfig.outputs.length === 0" description="暂无输出变量" />
          <div v-for="(output, index) in localConfig.outputs" :key="index" class="mb-2">
            <div class="flex items-center gap-2">
              <!-- 变量名 -->
              <t-input
                :model-value="output.name"
                @update:model-value="(value) => updateOutputName(index, value)"
                placeholder="变量名"
                size="small"
              />
              <!-- 类型 -->
              <selectDict
                :model-value="output.type"
                @update:model-value="(value) => updateOutputType(index, value)"
                dict-type="INPUT_TYPE"
                size="small"
              />
              <!-- 删除按钮 -->
              <t-button variant="text" size="small" class="text-gray-400" @click="removeOutput(index)">
                <t-icon name="remove" />
              </t-button>
            </div>
          </div>
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

        <!-- 动态输入变量 -->
        <div v-for="(input, index) in localConfig.inputs" :key="`test-input-${index}`" class="mb-4">
          <div class="text-xs text-gray-500 mb-1">
            {{ input.name }}
            <span class="text-gray-400">{{ input.type }}</span>
          </div>
          <t-textarea
            v-model="testInputs[input.name]"
            :placeholder="`请输入 ${input.name}`"
            :autosize="{ minRows: 3, maxRows: 6 }"
            class="w-full"
          />
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
  import { ref, watch, reactive, nextTick, computed } from 'vue';
  import selectModel from '@/components/select/select-model.vue';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { debugChat } from '@/api/chat/chat';
  import { useVueFlow } from '@vue-flow/core';

  interface InputVariable {
    name: string;
    type: string;
    source?: string;
  }

  interface OutputVariable {
    name: string;
    type: string;
  }

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

  // 获取 VueFlow 实例
  const { nodes, edges } = useVueFlow();

  // 折叠面板激活状态
  const activeNames = ref(['model', 'input', 'systemPrompt', 'userPrompt', 'output']);

  // 运行测试相关状态
  const testRunnerVisible = ref(false);
  const testInputs = ref<Record<string, string>>({});
  const testStatus = ref<'idle' | 'running' | 'success' | 'error'>('idle');
  const testDuration = ref(1);
  const testTokens = ref(0);
  const testInputJson = ref({});
  const testOutputJson = ref({});

  // 标记是否正在更新配置，避免循环更新
  const isUpdating = ref(false);

  // 初始化输入变量
  const initInputs = (): InputVariable[] => {
    const configInputs = props.node?.data?.config?.inputs;
    if (Array.isArray(configInputs) && configInputs.length > 0) {
      return configInputs.map((input: any) => ({
        name: input.name || 'input',
        type: input.type || 'text',
        source: input.source || '',
      }));
    }
    // 默认一个输入变量
    return [{ name: 'input', type: 'text', source: '' }];
  };

  // 初始化输出变量
  const initOutputs = (): OutputVariable[] => {
    const configOutputs = props.node?.data?.config?.outputs;
    if (Array.isArray(configOutputs) && configOutputs.length > 0) {
      return configOutputs.map((output: any) => ({
        name: output.name || 'output',
        type: output.type || 'text',
      }));
    }
    // 默认两个输出变量
    return [
      { name: 'output', type: 'text' },
      { name: 'reasoning_content', type: 'text' },
    ];
  };

  // 本地配置副本 - 使用 reactive
  const localConfig = reactive({
    label: props.node?.data?.label,
    model: props.node?.data?.config?.model,
    temperature: props.node?.data?.config?.temperature,
    maxTokens: props.node?.data?.config?.maxTokens,
    topP: props.node?.data?.config?.topP,
    systemPrompt: props.node?.data?.config?.systemPrompt,
    userPrompt: props.node?.data?.config?.userPrompt,
    inputs: initInputs(),
    outputs: initOutputs(),
  });

  // 初始化测试输入的默认值
  const initTestInputs = () => {
    const inputs: Record<string, string> = {};
    localConfig.inputs.forEach((input) => {
      inputs[input.name] = input.name === 'input' ? '你好！' : '';
    });
    testInputs.value = inputs;
  };

  // 初始化测试输入
  initTestInputs();

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode, oldNode) => {
      // 如果正在更新配置，跳过外部数据同步
      if (isUpdating.value) {
        return;
      }

      if (newNode && newNode.id !== oldNode?.id) {
        // 只有当节点ID变化时才重新初始化（切换到不同节点）
        Object.assign(localConfig, {
          label: newNode.data?.label,
          model: newNode.data?.config?.model,
          temperature: newNode.data?.config?.temperature,
          maxTokens: newNode.data?.config?.maxTokens,
          topP: newNode.data?.config?.topP ?? 1,
          systemPrompt: newNode.data?.config?.systemPrompt,
          userPrompt: newNode.data?.config?.userPrompt,
          inputs: initInputs(),
          outputs: initOutputs(),
        });
        // 重新初始化测试输入
        initTestInputs();
      }
    },
    { deep: true },
  );

  // 获取可用的数据源选项（上游节点的输出）- 使用 computed 确保响应式
  const availableSourceOptions = computed(() => {
    const options: Array<{ value: string; label: string }> = [];
    const currentNodeId = props.node?.id;

    if (!currentNodeId) {
      return options;
    }

    try {
      // 获取所有边和节点 - 使用 .value 访问 ref
      const allEdges = edges.value || [];
      const allNodes = nodes.value || [];

      // 找到连接到当前节点的边（入边）
      const incomingEdges = allEdges.filter((edge: any) => edge.target === currentNodeId);

      // 遍历入边，获取源节点的输出变量
      incomingEdges.forEach((edge: any) => {
        const sourceNode = allNodes.find((node: any) => node.id === edge.source);
        if (sourceNode) {
          // 对于 start 节点，使用 inputs 作为输出；其他节点使用 outputs
          let sourceOutputs = sourceNode.data?.config?.outputs || [];
          if (sourceNode.type === 'start') {
            sourceOutputs = sourceNode.data?.config?.inputs || [];
          }
          sourceOutputs.forEach((output: any) => {
            options.push({
              value: `${sourceNode.id}.${output.name}`,
              label: `${sourceNode.data?.label || sourceNode.id} - ${output.name}`,
            });
          });
        }
      });
    } catch (error) {
      console.error('Error getting source options:', error);
    }

    return options;
  });

  // 添加输入变量
  const addInput = () => {
    localConfig.inputs.push({
      name: `input${localConfig.inputs.length + 1}`,
      type: 'text',
      source: '',
    });
    updateConfig();
  };

  // 删除输入变量
  const removeInput = (index: number) => {
    localConfig.inputs.splice(index, 1);
    updateConfig();
  };

  // 更新输入变量名
  const updateInputName = (index: number, value: string) => {
    localConfig.inputs[index].name = value;
    nextTick(() => updateConfig());
  };

  // 更新输入变量类型
  const updateInputType = (index: number, value: string) => {
    localConfig.inputs[index].type = value;
    nextTick(() => updateConfig());
  };

  // 更新输入变量数据源
  const updateInputSource = (index: number, value: string) => {
    localConfig.inputs[index].source = value;
    nextTick(() => updateConfig());
  };

  // 添加输出变量
  const addOutput = () => {
    localConfig.outputs.push({
      name: `output${localConfig.outputs.length + 1}`,
      type: 'text',
    });
    updateConfig();
  };

  // 删除输出变量
  const removeOutput = (index: number) => {
    localConfig.outputs.splice(index, 1);
    updateConfig();
  };

  // 更新输出变量名
  const updateOutputName = (index: number, value: string) => {
    localConfig.outputs[index].name = value;
    nextTick(() => updateConfig());
  };

  // 更新输出变量类型
  const updateOutputType = (index: number, value: string) => {
    localConfig.outputs[index].type = value;
    nextTick(() => updateConfig());
  };

  // 更新配置
  const updateConfig = () => {
    isUpdating.value = true;

    emit('update-node', {
      label: localConfig.label,
      config: {
        model: localConfig.model,
        temperature: localConfig.temperature,
        maxTokens: localConfig.maxTokens,
        topP: localConfig.topP,
        systemPrompt: localConfig.systemPrompt,
        userPrompt: localConfig.userPrompt,
        inputs: localConfig.inputs,
        outputs: localConfig.outputs,
      },
    });

    // 延迟重置标志位，确保 props 更新完成
    nextTick(() => {
      setTimeout(() => {
        isUpdating.value = false;
      }, 100);
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

  // 替换提示词中的变量引用
  const replaceVariables = (template: string) => {
    let result = template;
    // 替换所有输入变量
    localConfig.inputs.forEach((input) => {
      const regex = new RegExp(`\\\\{\\\\{${input.name}\\\\}\\\\}`, 'g');
      result = result.replace(regex, testInputs.value[input.name] || '');
    });
    return result;
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
      if (localConfig.systemPrompt) {
        messages.push({
          role: 'system',
          content: replaceVariables(localConfig.systemPrompt),
        });
      }

      // 添加用户输入
      const userContent = localConfig.userPrompt
        ? replaceVariables(localConfig.userPrompt)
        : testInputs.value[localConfig.inputs[0]?.name] || '';

      messages.push({
        role: 'user',
        content: userContent,
      });

      // 构建请求数据
      const requestData = {
        model: localConfig.model,
        messages,
        temperature: localConfig.temperature,
        max_tokens: localConfig.maxTokens,
        top_p: localConfig.topP,
      };

      // 保存输入 JSON - 包含所有输入变量
      const inputJson: Record<string, any> = {};
      localConfig.inputs.forEach((input) => {
        inputJson[input.name] = testInputs.value[input.name] || '';
      });
      testInputJson.value = inputJson;

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

            // 动态构建输出 JSON，基于配置的输出变量
            const outputJson: Record<string, any> = {};
            localConfig.outputs.forEach((output) => {
              if (output.name === 'reasoning_content') {
                outputJson[output.name] = reasoningContent;
              } else if (output.name === 'output' || localConfig.outputs.length === 1) {
                outputJson[output.name] = responseText;
              } else {
                // 其他输出变量默认为空
                outputJson[output.name] = '';
              }
            });
            testOutputJson.value = outputJson;

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
