<template>
  <div class="variable-monitor">
    <t-card :bordered="false" class="h-full">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <t-icon name="code" class="text-green-600" />
            <span class="font-medium">变量监控</span>
            <t-tag v-if="isDebugging" theme="success" variant="light">调试中</t-tag>
          </div>
          <div class="flex items-center gap-2">
            <t-button size="small" theme="default" @click="refreshVariables" :loading="refreshing">
              <t-icon name="refresh" />
              刷新
            </t-button>
            <t-button size="small" theme="default" @click="exportVariables">
              <t-icon name="download" />
              导出
            </t-button>
          </div>
        </div>
      </template>

      <div class="variable-content">
        <!-- 全局变量 -->
        <div class="variable-section">
          <div class="section-header">
            <t-icon name="global" />
            <span>全局变量</span>
            <t-tag size="small" theme="default" variant="light">
              {{ Object.keys(globalVariables).length }}
            </t-tag>
          </div>
          <div class="variable-list">
            <div v-for="(value, key) in globalVariables" :key="key" class="variable-item">
              <div class="variable-header">
                <div class="variable-name">{{ key }}</div>
                <div class="variable-type">{{ getVariableType(value) }}</div>
              </div>
              <div class="variable-value">
                <pre>{{ formatVariableValue(value) }}</pre>
              </div>
              <div class="variable-actions">
                <t-button size="small" theme="default" variant="text" @click="editVariable(key)">
                  <t-icon name="edit" />
                </t-button>
                <t-button size="small" theme="default" variant="text" @click="copyVariable(key, value)">
                  <t-icon name="copy" />
                </t-button>
              </div>
            </div>
            <div v-if="Object.keys(globalVariables).length === 0" class="empty-state">
              <t-icon name="inbox" class="text-gray-400" />
              <span>暂无全局变量</span>
            </div>
          </div>
        </div>

        <!-- 节点变量 -->
        <div class="variable-section" v-if="Object.keys(nodeVariables).length > 0">
          <div class="section-header">
            <t-icon name="layers" />
            <span>节点变量</span>
            <t-tag size="small" theme="default" variant="light">
              {{ Object.keys(nodeVariables).length }}
            </t-tag>
          </div>
          <div class="variable-list">
            <div v-for="(nodeVars, nodeId) in nodeVariables" :key="nodeId" class="node-variable-group">
              <div class="node-header">
                <t-icon name="circle" class="text-blue-500" />
                <span class="node-name">{{ getNodeName(nodeId) }}</span>
                <t-tag size="small" theme="primary" variant="light">
                  {{ Object.keys(nodeVars).length }}
                </t-tag>
              </div>
              <div class="node-variables">
                <div v-for="(value, key) in nodeVars" :key="`${nodeId}-${key}`" class="variable-item nested">
                  <div class="variable-header">
                    <div class="variable-name">{{ key }}</div>
                    <div class="variable-type">{{ getVariableType(value) }}</div>
                  </div>
                  <div class="variable-value">
                    <pre>{{ formatVariableValue(value) }}</pre>
                  </div>
                  <div class="variable-actions">
                    <t-button size="small" theme="default" variant="text" @click="editVariable(key, nodeId)">
                      <t-icon name="edit" />
                    </t-button>
                    <t-button size="small" theme="default" variant="text" @click="copyVariable(key, value)">
                      <t-icon name="copy" />
                    </t-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 执行历史 -->
        <div class="variable-section" v-if="executionHistory.length > 0">
          <div class="section-header">
            <t-icon name="time" />
            <span>执行历史</span>
            <t-tag size="small" theme="default" variant="light">
              {{ executionHistory.length }}
            </t-tag>
          </div>
          <div class="history-list">
            <div v-for="(history, index) in executionHistory" :key="index" class="history-item">
              <div class="history-header">
                <div class="history-time">{{ formatTime(history.timestamp) }}</div>
                <div class="history-node">{{ getNodeName(history.nodeId) }}</div>
                <div class="history-action">{{ history.action }}</div>
              </div>
              <div class="history-variables" v-if="history.variables">
                <div v-for="(value, key) in history.variables" :key="key" class="history-variable">
                  <span class="variable-name">{{ key }}:</span>
                  <span class="variable-value">{{ formatVariableValue(value) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { MessagePlugin } from 'tdesign-vue-next';
  import type { WorkflowNode } from '@/models/workflow';

  // 变量接口
  interface VariableValue {
    value: any;
    type: string;
    timestamp: number;
    nodeId?: string;
  }

  // 执行历史接口
  interface ExecutionHistory {
    timestamp: number;
    nodeId: string;
    action: string;
    variables?: Record<string, any>;
  }

  // Props
  const props = defineProps<{
    nodes: WorkflowNode[];
    isDebugging: boolean;
    debugVariables: Record<string, any>;
    currentNodeId: string | null;
  }>();

  // 响应式状态
  const refreshing = ref(false);
  const globalVariables = ref<Record<string, any>>({});
  const nodeVariables = ref<Record<string, Record<string, any>>>({});
  const executionHistory = ref<ExecutionHistory[]>([]);

  // 计算属性
  const allVariables = computed(() => ({
    ...globalVariables.value,
    ...Object.values(nodeVariables.value).reduce((acc, nodeVars) => ({ ...acc, ...nodeVars }), {}),
  }));

  // 监听调试变量变化
  watch(
    () => props.debugVariables,
    (newVars) => {
      if (props.isDebugging) {
        // 更新全局变量
        globalVariables.value = { ...newVars };

        // 记录执行历史
        if (props.currentNodeId) {
          executionHistory.value.push({
            timestamp: Date.now(),
            nodeId: props.currentNodeId,
            action: '变量更新',
            variables: { ...newVars },
          });

          // 限制历史记录数量
          if (executionHistory.value.length > 100) {
            executionHistory.value = executionHistory.value.slice(-100);
          }
        }
      }
    },
    { deep: true, immediate: true },
  );

  // 获取节点名称
  const getNodeName = (nodeId: string) => {
    const node = props.nodes.find((n) => n.id === nodeId);
    return node?.data.label || '未知节点';
  };

  // 获取变量类型
  const getVariableType = (value: any) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  };

  // 格式化变量值
  const formatVariableValue = (value: any) => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // 格式化时间
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // 刷新变量
  const refreshVariables = async () => {
    try {
      refreshing.value = true;
      // 这里可以添加实际的刷新逻辑
      await new Promise((resolve) => setTimeout(resolve, 500));
      MessagePlugin.success('变量已刷新');
    } catch (error) {
      console.error('Failed to refresh variables:', error);
      MessagePlugin.error('刷新变量失败');
    } finally {
      refreshing.value = false;
    }
  };

  // 导出变量
  const exportVariables = () => {
    try {
      const data = {
        globalVariables: globalVariables.value,
        nodeVariables: nodeVariables.value,
        executionHistory: executionHistory.value,
        exportTime: new Date().toISOString(),
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `variables_${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
      MessagePlugin.success('变量已导出');
    } catch (error) {
      console.error('Failed to export variables:', error);
      MessagePlugin.error('导出变量失败');
    }
  };

  // 编辑变量
  const editVariable = (key: string, nodeId?: string) => {
    // 这里可以添加变量编辑逻辑
    MessagePlugin.info(`编辑变量: ${key}`);
  };

  // 复制变量
  const copyVariable = async (key: string, value: any) => {
    try {
      await navigator.clipboard.writeText(formatVariableValue(value));
      MessagePlugin.success(`变量 ${key} 已复制到剪贴板`);
    } catch (error) {
      console.error('Failed to copy variable:', error);
      MessagePlugin.error('复制变量失败');
    }
  };
</script>

<style scoped>
  .variable-monitor {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .variable-content {
    height: calc(100% - 60px);
    overflow-y: auto;
  }

  .variable-section {
    margin-bottom: 24px;
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    font-weight: 500;
    color: #374151;
  }

  .variable-list {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
  }

  .variable-item {
    padding: 12px;
    border-bottom: 1px solid #f3f4f6;
    position: relative;
  }

  .variable-item:last-child {
    border-bottom: none;
  }

  .variable-item.nested {
    margin-left: 16px;
    border-left: 2px solid #e5e7eb;
    padding-left: 12px;
  }

  .variable-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .variable-name {
    font-weight: 500;
    color: #111827;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  .variable-type {
    font-size: 12px;
    color: #6b7280;
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .variable-value {
    background: #f9fafb;
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .variable-value pre {
    margin: 0;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 12px;
    white-space: pre-wrap;
    word-break: break-all;
    color: #374151;
  }

  .variable-actions {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .variable-item:hover .variable-actions {
    opacity: 1;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    color: #6b7280;
  }

  .empty-state .t-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .node-variable-group {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    margin-bottom: 12px;
    overflow: hidden;
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    font-weight: 500;
    color: #374151;
  }

  .node-name {
    flex: 1;
  }

  .node-variables {
    background: white;
  }

  .history-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
  }

  .history-item {
    padding: 12px;
    border-bottom: 1px solid #f3f4f6;
  }

  .history-item:last-child {
    border-bottom: none;
  }

  .history-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .history-time {
    color: #6b7280;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  }

  .history-node {
    font-weight: 500;
    color: #111827;
  }

  .history-action {
    color: #059669;
    font-size: 12px;
  }

  .history-variables {
    background: #f9fafb;
    padding: 8px;
    border-radius: 4px;
    font-size: 12px;
  }

  .history-variable {
    display: flex;
    margin-bottom: 4px;
  }

  .history-variable:last-child {
    margin-bottom: 0;
  }

  .history-variable .variable-name {
    font-weight: 500;
    margin-right: 8px;
    min-width: 80px;
  }

  .history-variable .variable-value {
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    color: #6b7280;
  }
</style>
