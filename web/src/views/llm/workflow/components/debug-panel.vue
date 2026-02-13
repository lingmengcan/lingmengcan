<template>
  <div
    class="fixed right-1 top-14 bottom-1 w-[450px] bg-white rounded-lg shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 overflow-hidden flex flex-col"
    :class="visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'"
    style="height: calc(100vh - 60px)"
  >
    <!-- 调试面板头部 -->
    <div class="flex items-center justify-between px-6 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
          <t-icon name="bug" class="text-green-600" size="16" />
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-900">工作流调试</h3>
        </div>
      </div>
      <t-button variant="text" size="small" @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
        <t-icon name="close" size="16" />
      </t-button>
    </div>

    <!-- 调试内容 -->
    <div class="flex-1 overflow-y-auto flex flex-col debug-panel-content">
      <!-- 输入参数区域 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <h4 class="text-sm font-medium text-gray-700 mb-4">输入参数 (parameters)</h4>

        <!-- 动态输入参数 -->
        <div class="space-y-3">
          <template v-for="input in startNodeInputs" :key="input.name">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">
                {{ input.name }}
                <span v-if="input.required" class="text-red-500">*</span>
                <span v-if="input.description" class="text-xs text-gray-400 ml-2">{{ input.description }}</span>
              </label>
              <!-- 文本类型 -->
              <t-textarea
                v-if="input.type === 'string' || input.type === 'text'"
                v-model="inputData.parameters[input.name]"
                :placeholder="`请输入${input.name}`"
                :autosize="{ minRows: 2, maxRows: 4 }"
                class="w-full"
              />
              <!-- 数字类型 -->
              <t-input-number
                v-else-if="input.type === 'number' || input.type === 'integer'"
                v-model="inputData.parameters[input.name]"
                :placeholder="`请输入${input.name}`"
                class="w-full"
              />
              <!-- 布尔类型 -->
              <t-switch
                v-else-if="input.type === 'boolean'"
                v-model="inputData.parameters[input.name]"
              />
              <!-- 默认文本输入 -->
              <t-textarea
                v-else
                v-model="inputData.parameters[input.name]"
                :placeholder="`请输入${input.name}`"
                :autosize="{ minRows: 2, maxRows: 4 }"
                class="w-full"
              />
            </div>
          </template>

          <!-- 如果没有配置输入参数，显示默认的 input 字段 -->
          <div v-if="startNodeInputs.length === 0">
            <label class="block text-sm font-medium text-gray-600 mb-2">
              input
              <span class="text-red-500">*</span>
            </label>
            <t-textarea
              v-model="inputData.parameters.input"
              placeholder="请输入文本内容"
              :autosize="{ minRows: 2, maxRows: 4 }"
              class="w-full"
            />
          </div>
        </div>

        <!-- stream 参数 -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-600 mb-2">stream</label>
          <div class="flex items-center gap-3">
            <t-checkbox v-model="inputData.stream">流式执行</t-checkbox>
            <span class="text-xs text-gray-500">是否流式返回结果，默认为false</span>
          </div>
        </div>
      </div>

      <!-- 返回结果显示区域 -->
      <div class="px-6 py-4 border-b border-gray-200 bg-green-50">
        <!-- 执行信息 -->
        <div class="space-y-3">
          <!-- 基本信息 -->
          <div class="bg-white rounded border p-3">
            <h6 class="text-xs font-medium text-gray-600 mb-2">基本信息</h6>
            <div class="space-y-1 text-xs">
              <div>
                <span class="text-gray-500">执行ID:</span>
                <span class="font-mono">{{ getExecutionId() }}</span>
              </div>
              <div>
                <span class="text-gray-500">工作流ID:</span>
                <span class="font-mono">{{ getWorkflowId() }}</span>
              </div>
            </div>
          </div>

          <!-- 输出结果 -->
          <div class="bg-white rounded border p-3">
            <h6 class="text-xs font-medium text-gray-600 mb-2">输出结果</h6>
            <pre class="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded">{{
              inputData.stream ? streamOutput : getOutput()
            }}</pre>
          </div>
        </div>
      </div>

      <!-- 调试控制区域 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <t-button theme="primary" size="small" @click="startDebug" :loading="isRunning">
            <t-icon name="play-circle" />
            开始调试
          </t-button>
          <t-button theme="default" size="small" @click="clearLogs">
            <t-icon name="delete" />
            清空日志
          </t-button>
        </div>
      </div>

      <!-- 执行日志区域 -->
      <div class="flex-1 flex flex-col">
        <div class="px-6 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium text-gray-700">执行日志</h4>
            <div class="flex items-center gap-2">
              <t-tag v-if="isRunning" theme="success" variant="light" size="small">运行中</t-tag>
              <t-tag v-else-if="logs.length > 0" theme="default" variant="light" size="small">
                {{ logs.length }} 条日志
              </t-tag>
            </div>
          </div>
        </div>

        <div class="flex-1 p-6">
          <div v-if="logs.length === 0" class="text-center text-gray-500 py-8">
            <t-icon name="inbox" size="32" class="text-gray-300 mb-2" />
            <p>暂无执行日志</p>
            <p class="text-xs text-gray-400 mt-1">点击"开始调试"查看执行过程</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(log, index) in logs"
              :key="index"
              class="flex items-start gap-3 p-3 rounded-lg border"
              :class="getLogItemClass(log.level)"
            >
              <div class="flex-shrink-0 mt-0.5">
                <t-icon :name="getLogIcon(log.level)" size="14" :class="getLogIconClass(log.level)" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-medium" :class="getLogTextClass(log.level)">
                    {{ log.level.toUpperCase() }}
                  </span>
                  <span class="text-xs text-gray-500">{{ formatTime(log.timestamp) }}</span>
                </div>
                <div class="text-sm text-gray-700 whitespace-pre-wrap">{{ log.message }}</div>
                <div v-if="log.data" class="mt-2">
                  <details class="text-xs">
                    <summary class="cursor-pointer text-gray-500 hover:text-gray-700">查看详情</summary>
                    <pre class="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">{{
                      JSON.stringify(log.data, null, 2)
                    }}</pre>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { MessagePlugin } from 'tdesign-vue-next';
  import { executeWorkflowStream, debugExecuteWorkflow } from '@/api/llm/workflow';

  // 输入参数类型
  interface InputParam {
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }

  // Props
  const props = defineProps<{
    visible: boolean;
    startNode: any;
    workflowId: string;
  }>();

  // Emits
  const emit = defineEmits<{
    close: [];
  }>();

  // 从 startNode 获取输入参数配置
  const startNodeInputs = computed<InputParam[]>(() => {
    const inputs = props.startNode?.data?.config?.inputs || [];
    return inputs.map((input: any) => ({
      name: input.name || '',
      type: input.type || 'string',
      required: input.required !== false,
      description: input.description || '',
    }));
  });

  // 响应式状态
  const inputData = ref({
    workflowId: props.workflowId,
    parameters: {} as Record<string, any>,
    stream: true,
  });
  const isRunning = ref(false);
  const responseData = ref<any>(null);
  const streamOutput = ref('');
  const executionId = ref('');
  const logs = ref<
    Array<{
      timestamp: number;
      level: 'info' | 'success' | 'warning' | 'error';
      message: string;
      data?: any;
    }>
  >([]);

  // 初始化输入参数
  const initInputParameters = () => {
    const params: Record<string, any> = {};
    startNodeInputs.value.forEach((input) => {
      if (input.type === 'number' || input.type === 'integer') {
        params[input.name] = 0;
      } else if (input.type === 'boolean') {
        params[input.name] = false;
      } else {
        params[input.name] = '';
      }
    });
    // 如果没有配置输入参数，添加默认的 input 字段
    if (startNodeInputs.value.length === 0) {
      params.input = '';
    }
    inputData.value.parameters = params;
  };

  // 监听 startNode 变化，重新初始化输入参数
  watch(
    () => props.startNode,
    () => {
      initInputParameters();
    },
    { immediate: true, deep: true },
  );

  // 开始调试
  const startDebug = async () => {
    try {
      isRunning.value = true;
      logs.value = [];
      responseData.value = null;
      streamOutput.value = '';

      // 验证必填参数
      if (!inputData.value.workflowId.trim()) {
        addLog('error', '请输入工作流ID');
        MessagePlugin.error('请输入工作流ID');
        return;
      }

      // 验证必填的输入参数
      const missingParams: string[] = [];
      startNodeInputs.value.forEach((input) => {
        if (input.required) {
          const value = inputData.value.parameters[input.name];
          if (value === undefined || value === null || value === '') {
            missingParams.push(input.name);
          }
        }
      });
      // 如果没有配置输入参数，检查默认的 input 字段
      if (startNodeInputs.value.length === 0 && !inputData.value.parameters.input?.trim()) {
        missingParams.push('input');
      }

      if (missingParams.length > 0) {
        const msg = `请填写必填参数: ${missingParams.join(', ')}`;
        addLog('error', msg);
        MessagePlugin.error(msg);
        return;
      }

      // 添加开始日志
      addLog('info', '开始调试工作流...');
      addLog('info', '工作流ID: ' + inputData.value.workflowId);
      addLog('info', '输入参数: ' + JSON.stringify(inputData.value.parameters, null, 2));
      addLog('info', '流式执行: ' + (inputData.value.stream ? '是' : '否'));

      // 执行工作流
      await executeWorkflow();

      addLog('success', '工作流执行完成');
      MessagePlugin.success('调试完成');
    } catch (error) {
      console.error('Debug failed:', error);
      addLog('error', '调试过程中发生错误: ' + (error as Error).message);
      MessagePlugin.error('调试失败');
    } finally {
      isRunning.value = false;
    }
  };

  // 执行工作流
  const executeWorkflow = async () => {
    try {
      // 构建API请求参数 - 直接使用 parameters 中的所有参数
      const inputs: Record<string, any> = { ...inputData.value.parameters };

      const apiParams = {
        workflowId: inputData.value.workflowId,
        inputs,
        stream: inputData.value.stream,
      };

      addLog('info', '调用API: /openapi/v1/workflow/execute');
      addLog('info', '请求参数: ' + JSON.stringify(apiParams, null, 2));

      if (apiParams.stream) {
        // 流式读取 SSE
        const res = await executeWorkflowStream(apiParams.workflowId, inputs);
        const reader = res.body?.getReader();
        if (!reader) throw new Error('浏览器不支持流式读取');

        let decoder = new TextDecoder('utf-8');
        let buffer = '';
        let visibleContent = '';
        let reasoning = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE 按 \n\n 分帧
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data:')) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            try {
              const json = JSON.parse(payload);
              // 首帧元信息：保存 executionId
              if (json.meta && json.meta.executionId) {
                executionId.value = json.meta.executionId;
                addLog('info', '执行ID: ' + json.meta.executionId);
                continue;
              }
              // 处理错误帧
              if (json.error) {
                addLog('error', '后端错误: ' + json.error);
                continue;
              }
              const piece = json.content || '';
              if (json.reasoning_content) reasoning = json.reasoning_content;
              if (piece) {
                visibleContent += piece;
                streamOutput.value += piece;
                addLog('info', piece);
              }
            } catch (e) {
              // 记录非JSON帧便于调试
              addLog('warning', '无法解析帧: ' + payload);
            }
          }
        }

        // 汇总结果以匹配页面展示结构
        responseData.value = {
          code: 0,
          message: 'success',
          data: {
            executionId: executionId.value,
            workflowId: apiParams.workflowId,
            output: visibleContent,
            executionLog: [],
            duration: '',
            timestamp: new Date().toISOString(),
            reasoning_content: reasoning,
          },
        };

        if (visibleContent) {
          addLog('success', '最终输出: ' + visibleContent);
        } else {
          addLog('warning', '未获得可见输出');
        }
      } else {
        // 非流式：使用调试接口，绕过"未发布无法执行"限制
        const response = await debugExecuteWorkflow(apiParams.workflowId, inputs);
        responseData.value = response;

        if (response.code === 0) {
          addLog('success', 'API调用成功');
          const execution = response.data as any;
          addLog('info', '执行ID: ' + execution.executionId);
          addLog('info', '工作流ID: ' + execution.workflowId);
          const executionLogs = execution.executionLog || [];
          if (executionLogs.length > 0) {
            executionLogs.forEach((log: any) => {
              const logLevel = log.error ? 'error' : 'info';
              const nodeLabel = log.nodeId ? `节点 ${log.nodeId}` : '';
              const message = `${nodeLabel} [${log.nodeType}] ${log.message}`;
              addLog(logLevel, message, log.result || log.error);
            });
          }
          const output = execution.output || '';
          if (output) {
            addLog('success', '最终输出: ' + output);
          } else {
            addLog('warning', '未找到输出结果');
          }
        } else {
          addLog('error', 'API调用失败: ' + (response.message || '未知错误'));
        }
      }
    } catch (error) {
      console.error('Workflow debug failed:', error);
      addLog('error', '工作流调试异常: ' + (error as Error).message);
    }
  };

  // 添加日志
  const addLog = (level: 'info' | 'success' | 'warning' | 'error', message: string, data?: any) => {
    logs.value.push({
      timestamp: Date.now(),
      level,
      message,
      data,
    });
  };

  // 清空日志
  const clearLogs = () => {
    logs.value = [];
    responseData.value = null;
    MessagePlugin.info('日志已清空');
  };

  // 格式化日期时间（当前未使用，保留以备扩展）
  // const formatDateTime = (timestamp: string) => {
  //   return new Date(timestamp).toLocaleString();
  // };

  // 获取执行ID
  const getExecutionId = () => {
    return responseData.value?.data?.executionId || '';
  };

  // 获取工作流ID
  const getWorkflowId = () => {
    return responseData.value?.data?.workflowId || '';
  };

  // const getDuration = () => {
  //   return responseData.value?.data?.duration || '';
  // };

  // const getTimestamp = () => {
  //   return responseData.value?.data?.timestamp || '';
  // };

  // 获取输出结果
  const getOutput = () => {
    const data = responseData.value?.data;
    return data?.output || '';
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // 获取日志项样式
  const getLogItemClass = (level: string) => {
    const classMap = {
      info: 'bg-blue-50 border-blue-200',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
    };
    return classMap[level as keyof typeof classMap] || 'bg-gray-50 border-gray-200';
  };

  // 获取日志图标
  const getLogIcon = (level: string) => {
    const iconMap = {
      info: 'info-circle',
      success: 'check-circle',
      warning: 'error-triangle',
      error: 'close-circle',
    };
    return iconMap[level as keyof typeof iconMap] || 'info-circle';
  };

  // 获取日志图标样式
  const getLogIconClass = (level: string) => {
    const classMap = {
      info: 'text-blue-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500',
    };
    return classMap[level as keyof typeof classMap] || 'text-gray-500';
  };

  // 获取日志文本样式
  const getLogTextClass = (level: string) => {
    const classMap = {
      info: 'text-blue-600',
      success: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
    };
    return classMap[level as keyof typeof classMap] || 'text-gray-600';
  };

  // 监听工作流ID变化，更新输入数据
  watch(
    () => props.workflowId,
    (newWorkflowId) => {
      if (newWorkflowId) {
        inputData.value.workflowId = newWorkflowId;
      }
    },
    { immediate: true },
  );
</script>

<style scoped>
  /* 自定义滚动条样式 */
  .overflow-y-auto::-webkit-scrollbar {
    width: 6px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* 确保调试面板内容可以滚动 */
  .debug-panel-content {
    max-height: calc(100vh - 120px);
    overflow-y: auto;
  }
</style>
