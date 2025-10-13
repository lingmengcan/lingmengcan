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
    <div class="flex-1 overflow-hidden flex flex-col">
      <!-- 开始节点信息 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <!-- 输入参数区域 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            开始节点输入参数
            <span v-if="startNode" class="text-xs text-gray-500 ml-1">
              ({{ startNode.data?.config?.inputType || 'text' }})
            </span>
          </label>
          <t-textarea
            v-model="inputParams"
            :placeholder="getInputPlaceholder()"
            :autosize="{ minRows: 4, maxRows: 8 }"
            class="w-full"
          />
          <div v-if="startNode" class="mt-2 text-xs text-gray-500">
            <p>
              变量名:
              <span class="font-medium">{{ startNode.data?.config?.variableName || 'input' }}</span>
            </p>
            <p>
              类型:
              <span class="font-medium">{{ getInputTypeLabel() }}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- 调试控制区域 -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <t-button theme="primary" size="small" @click="startDebug" :loading="isRunning" :disabled="!startNode">
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
      <div class="flex-1 overflow-hidden flex flex-col">
        <div class="px-6 py-3 border-b border-gray-200 bg-gray-50">
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

        <div class="flex-1 overflow-y-auto p-6">
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
  import { ref, watch } from 'vue';
  import { MessagePlugin } from 'tdesign-vue-next';

  // Props
  const props = defineProps<{
    visible: boolean;
    startNode: any;
  }>();

  // Emits
  const emit = defineEmits<{
    close: [];
  }>();

  // 响应式状态
  const inputParams = ref('');
  const isRunning = ref(false);
  const logs = ref<
    Array<{
      timestamp: number;
      level: 'info' | 'success' | 'warning' | 'error';
      message: string;
      data?: any;
    }>
  >([]);

  // 开始调试
  const startDebug = async () => {
    try {
      isRunning.value = true;
      logs.value = [];

      // 添加开始日志
      addLog('info', '开始调试工作流...');

      // 解析输入参数
      let parsedInput;
      try {
        const inputType = props.startNode?.data?.config?.inputType || 'text';
        const variableName = props.startNode?.data?.config?.variableName || 'input';

        // 根据输入类型进行不同的解析
        switch (inputType) {
          case 'text':
            // 文本类型，直接使用输入值
            parsedInput = { [variableName]: inputParams.value.trim() };
            break;
          case 'json':
            // JSON类型，解析JSON
            parsedInput = JSON.parse(inputParams.value);
            break;
          case 'number':
            // 数字类型，转换为数字
            const numValue = parseFloat(inputParams.value.trim());
            if (isNaN(numValue)) {
              throw new Error('输入的不是有效的数字');
            }
            parsedInput = { [variableName]: numValue };
            break;
          case 'boolean':
            // 布尔类型，转换为布尔值
            const boolValue = inputParams.value.trim().toLowerCase();
            if (boolValue === 'true') {
              parsedInput = { [variableName]: true };
            } else if (boolValue === 'false') {
              parsedInput = { [variableName]: false };
            } else {
              throw new Error('请输入 true 或 false');
            }
            break;
          default:
            // 默认按JSON处理
            parsedInput = JSON.parse(inputParams.value);
        }

        addLog('info', '输入参数解析成功', parsedInput);
      } catch (error) {
        addLog('error', '输入参数格式错误: ' + (error as Error).message);
        return;
      }

      // 模拟工作流执行
      await simulateWorkflowExecution(parsedInput);

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

  // 模拟工作流执行
  const simulateWorkflowExecution = async (input: any) => {
    // 模拟开始节点
    addLog('info', '执行开始节点');
    addLog('info', '输入参数: ' + JSON.stringify(input));
    await delay(500);

    // 模拟LLM节点
    addLog('info', '执行LLM节点');
    addLog('info', '调用AI模型...');
    await delay(1000);
    addLog('success', 'AI模型响应完成');

    // 模拟条件节点
    addLog('info', '执行条件节点');
    addLog('info', '评估条件: input.message.length > 0');
    await delay(300);
    addLog('success', '条件评估结果: true');

    // 模拟输出节点
    addLog('info', '执行输出节点');
    addLog(
      'success',
      '输出结果: ' +
        JSON.stringify({
          response: 'Hello from AI!',
          input: input.message || 'No message provided',
          timestamp: new Date().toISOString(),
        }),
    );
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
    MessagePlugin.info('日志已清空');
  };

  // 延迟函数
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  // 获取输入提示文本
  const getInputPlaceholder = () => {
    if (!props.startNode) {
      return '请输入JSON格式的输入参数，例如：\n{\n  "message": "Hello World",\n  "temperature": 0.7\n}';
    }

    const inputType = props.startNode.data?.config?.inputType || 'text';

    switch (inputType) {
      case 'text':
        return `请输入文本内容，例如：\n"Hello World"`;
      case 'json':
        return `请输入JSON格式数据，例如：\n{\n  "message": "Hello World",\n  "data": {"key": "value"}\n}`;
      case 'number':
        return `请输入数字，例如：\n42\n或\n3.14`;
      case 'boolean':
        return `请输入布尔值，例如：\ntrue\n或\nfalse`;
      default:
        return `请输入${inputType}类型的数据`;
    }
  };

  // 获取输入类型标签
  const getInputTypeLabel = () => {
    if (!props.startNode) return 'Text';

    const inputType = props.startNode.data?.config?.inputType || 'text';
    const typeMap = {
      text: 'Text',
      json: 'JSON',
      number: 'Number',
      boolean: 'Boolean',
    };
    return typeMap[inputType as keyof typeof typeMap] || 'Text';
  };

  // 设置默认输入值
  const setDefaultInput = () => {
    if (!props.startNode) {
      inputParams.value = '{\n  "message": "Hello World",\n  "temperature": 0.7\n}';
      return;
    }

    const inputType = props.startNode.data?.config?.inputType || 'text';

    switch (inputType) {
      case 'text':
        inputParams.value = 'Hello World';
        break;
      case 'json':
        inputParams.value = '{\n  "message": "Hello World",\n  "data": {"key": "value"}\n}';
        break;
      case 'number':
        inputParams.value = '42';
        break;
      case 'boolean':
        inputParams.value = 'true';
        break;
      default:
        inputParams.value = '{\n  "message": "Hello World"\n}';
    }
  };

  // 监听开始节点变化，设置默认输入值
  watch(
    () => props.startNode,
    () => {
      setDefaultInput();
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
</style>
