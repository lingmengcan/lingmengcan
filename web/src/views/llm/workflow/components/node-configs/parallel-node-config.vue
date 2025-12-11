<template>
  <div>
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- 基本配置 -->
      <t-collapse-panel value="basic">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">基本配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <t-form-item label="分支数量" class="compact-form-item">
            <t-input-number
              v-model="localConfig.branchCount"
              :min="2"
              :max="10"
              size="small"
              @change="updateBranchCount"
            />
          </t-form-item>

          <t-form-item label="执行策略" class="compact-form-item">
            <t-select v-model="localConfig.strategy" size="small" @change="updateConfig">
              <t-option value="all" label="等待全部完成" />
              <t-option value="any" label="任一完成即结束" />
              <t-option value="race" label="竞速模式（最快获胜）" />
            </t-select>
          </t-form-item>
        </div>
      </t-collapse-panel>

      <!-- 分支配置 -->
      <t-collapse-panel value="branches">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">分支配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="(branch, index) in localConfig.branches"
            :key="`branch-${index}`"
            class="border border-gray-200 rounded p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">分支 {{ index + 1 }}</span>
              <t-switch v-model="branch.enabled" size="small" @change="updateConfig" />
            </div>

            <t-form-item label="分支名称" class="compact-form-item">
              <t-input v-model="branch.name" :placeholder="`分支${index + 1}`" size="small" @change="updateConfig" />
            </t-form-item>

            <t-form-item label="超时时间(秒)" class="compact-form-item">
              <t-input-number v-model="branch.timeout" :min="1" :max="300" size="small" @change="updateConfig" />
            </t-form-item>

            <t-form-item label="重试次数" class="compact-form-item">
              <t-input-number v-model="branch.retryCount" :min="0" :max="5" size="small" @change="updateConfig" />
            </t-form-item>
          </div>
        </div>
      </t-collapse-panel>

      <!-- 合并配置 -->
      <t-collapse-panel value="merge">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">合并配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <t-form-item label="合并策略" class="compact-form-item">
            <t-select v-model="localConfig.mergeStrategy" size="small" @change="updateConfig">
              <t-option value="collect" label="收集所有结果" />
              <t-option value="first" label="第一个结果" />
              <t-option value="last" label="最后一个结果" />
              <t-option value="merge" label="合并为对象" />
            </t-select>
          </t-form-item>

          <t-form-item label="输出变量名" class="compact-form-item">
            <t-input v-model="localConfig.outputVariable" placeholder="output" size="small" @change="updateConfig" />
          </t-form-item>

          <t-form-item label="错误处理" class="compact-form-item">
            <t-select v-model="localConfig.errorHandling" size="small" @change="updateConfig">
              <t-option value="fail-fast" label="快速失败" />
              <t-option value="continue" label="继续执行" />
              <t-option value="retry" label="重试失败分支" />
            </t-select>
          </t-form-item>

          <t-form-item label="全局超时(秒)" class="compact-form-item">
            <t-input-number v-model="localConfig.timeout" :min="1" :max="600" size="small" @change="updateConfig" />
          </t-form-item>
        </div>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, nextTick } from 'vue';

  interface Branch {
    name: string;
    enabled: boolean;
    timeout?: number;
    retryCount?: number;
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

  // 折叠面板激活状态
  const activeNames = ref(['basic', 'branches', 'merge']);

  // 标记是否正在更新配置，避免循环更新
  const isUpdating = ref(false);

  // 本地配置副本
  const localConfig = reactive({
    label: props.node?.data?.label || '并行节点',
    branchCount: props.node?.data?.config?.branchCount || 2,
    strategy: props.node?.data?.config?.strategy || 'all',
    branches: props.node?.data?.config?.branches || [
      { name: '分支1', enabled: true, timeout: 30, retryCount: 0 },
      { name: '分支2', enabled: true, timeout: 30, retryCount: 0 },
    ],
    mergeStrategy: props.node?.data?.config?.mergeStrategy || 'collect',
    outputVariable: props.node?.data?.config?.outputVariable || 'output',
    errorHandling: props.node?.data?.config?.errorHandling || 'fail-fast',
    timeout: props.node?.data?.config?.timeout || 60,
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode, oldNode) => {
      if (isUpdating.value) {
        return;
      }

      if (newNode && newNode.id !== oldNode?.id) {
        Object.assign(localConfig, {
          label: newNode.data?.label || '并行节点',
          branchCount: newNode.data?.config?.branchCount || 2,
          strategy: newNode.data?.config?.strategy || 'all',
          branches: newNode.data?.config?.branches || [
            { name: '分支1', enabled: true, timeout: 30, retryCount: 0 },
            { name: '分支2', enabled: true, timeout: 30, retryCount: 0 },
          ],
          mergeStrategy: newNode.data?.config?.mergeStrategy || 'collect',
          outputVariable: newNode.data?.config?.outputVariable || 'output',
          errorHandling: newNode.data?.config?.errorHandling || 'fail-fast',
          timeout: newNode.data?.config?.timeout || 60,
        });
      }
    },
    { deep: true },
  );

  // 更新分支数量
  const updateBranchCount = () => {
    const currentCount = localConfig.branches.length;
    const newCount = localConfig.branchCount;

    if (newCount > currentCount) {
      // 添加新分支
      for (let i = currentCount; i < newCount; i++) {
        localConfig.branches.push({
          name: `分支${i + 1}`,
          enabled: true,
          timeout: 30,
          retryCount: 0,
        });
      }
    } else if (newCount < currentCount) {
      // 删除多余分支
      localConfig.branches.splice(newCount);
    }

    updateConfig();
  };

  // 更新配置
  const updateConfig = () => {
    isUpdating.value = true;

    emit('update-node', {
      label: localConfig.label,
      config: {
        branchCount: localConfig.branchCount,
        strategy: localConfig.strategy,
        branches: localConfig.branches,
        mergeStrategy: localConfig.mergeStrategy,
        outputVariable: localConfig.outputVariable,
        errorHandling: localConfig.errorHandling,
        timeout: localConfig.timeout,
      },
    });

    nextTick(() => {
      setTimeout(() => {
        isUpdating.value = false;
      }, 100);
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
