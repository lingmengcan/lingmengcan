<template>
  <div>
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- API 配置 -->
      <t-collapse-panel value="api">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">API</span>
              <t-icon name="help-circle" class="text-gray-400" />
            </div>
          </div>
        </template>

        <div class="flex flex-col gap-2">
          <t-select v-model="localConfig.method" class="w-24" size="small" @change="updateConfig">
            <t-option value="GET" label="GET" />
            <t-option value="POST" label="POST" />
            <t-option value="PUT" label="PUT" />
            <t-option value="DELETE" label="DELETE" />
            <t-option value="PATCH" label="PATCH" />
          </t-select>
          <t-input v-model="localConfig.url" class="flex-1" size="small" @change="updateConfig" />
        </div>
      </t-collapse-panel>

      <!-- 请求参数 -->
      <t-collapse-panel value="params">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">请求参数</span>
              <t-icon name="help-circle" class="text-gray-400" />
            </div>
            <t-button variant="text" size="small" class="text-blue-500" @click.stop="addParam">
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div>
          <div
            v-for="(param, index) in localConfig.params"
            :key="index"
            class="grid grid-cols-2 gap-2 mb-2 items-center"
          >
            <t-input v-model="param.key" placeholder="输入参数名" size="small" @change="updateConfig" />
            <div class="flex items-center gap-2">
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">str</span>
              <t-input
                v-model="param.value"
                placeholder="输入或引用参数值"
                class="flex-1"
                size="small"
                @change="updateConfig"
              />
              <t-button variant="text" size="small" class="text-gray-400">
                <t-icon name="setting" />
              </t-button>
              <t-button variant="text" size="small" class="text-gray-400" @click="removeParam(index)">
                <t-icon name="remove" />
              </t-button>
            </div>
          </div>
        </div>
      </t-collapse-panel>

      <!-- 请求头 -->
      <t-collapse-panel value="headers">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">请求头</span>
              <t-icon name="help-circle" class="text-gray-400" />
            </div>
            <t-button variant="text" size="small" class="text-blue-500" @click.stop="addHeader">
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div>
          <div
            v-for="(header, index) in localConfig.headers"
            :key="index"
            class="grid grid-cols-2 gap-2 mb-2 items-center"
          >
            <t-input v-model="header.key" placeholder="输入参数名" size="small" @change="updateConfig" />
            <div class="flex items-center gap-2">
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">str</span>
              <t-input
                v-model="header.value"
                placeholder="输入或引用参数值"
                class="flex-1"
                size="small"
                @change="updateConfig"
              />
              <t-button variant="text" size="small" class="text-gray-400">
                <t-icon name="setting" />
              </t-button>
              <t-button variant="text" size="small" class="text-gray-400" @click="removeHeader(index)">
                <t-icon name="remove" />
              </t-button>
            </div>
          </div>
        </div>
      </t-collapse-panel>

      <!-- 鉴权 -->
      <t-collapse-panel value="auth">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">鉴权</span>
              <t-icon name="help-circle" class="text-gray-400" />
            </div>
            <t-switch v-model="localConfig.authEnabled" size="small" @change="updateConfig" @click.stop />
          </div>
        </template>

        <div v-if="localConfig.authEnabled">
          <div class="mb-4">
            <t-select v-model="localConfig.authType" size="small" @change="updateConfig">
              <t-option value="bearer" label="Bearer Token" />
              <t-option value="basic" label="Basic Auth" />
              <t-option value="api-key" label="API Key" />
            </t-select>
          </div>

          <div class="flex items-center gap-2">
            <t-input placeholder="token" class="w-20" size="small" readonly />
            <div class="flex items-center gap-2 flex-1">
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">str</span>
              <t-input
                v-model="localConfig.authToken"
                placeholder="输入或引用参数值"
                class="flex-1"
                size="small"
                @change="updateConfig"
              />
              <t-button variant="text" size="small" class="text-gray-400">
                <t-icon name="setting" />
              </t-button>
            </div>
          </div>
        </div>
      </t-collapse-panel>

      <!-- 请求体 -->
      <t-collapse-panel value="body" v-if="localConfig.method !== 'GET'">
        <template #header>
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-700">请求体</span>
            <t-icon name="help-circle" class="text-gray-400" />
          </div>
        </template>

        <div>
          <t-select v-model="localConfig.bodyType" class="mb-4" size="small" @change="updateConfig">
            <t-option value="none" label="none" />
            <t-option value="json" label="JSON" />
            <t-option value="form-data" label="form-data" />
            <t-option value="x-www-form-urlencoded" label="x-www-form-urlencoded" />
            <t-option value="raw" label="raw" />
          </t-select>

          <t-textarea
            v-if="localConfig.bodyType !== 'none'"
            v-model="localConfig.body"
            placeholder="请输入请求体内容"
            size="small"
            :autosize="{ minRows: 3, maxRows: 6 }"
            @change="updateConfig"
          />
        </div>
      </t-collapse-panel>

      <!-- 超时设置 -->
      <t-collapse-panel value="timeout" header="超时设置（秒）">
        <t-input-number
          v-model="localConfig.timeout"
          placeholder="120"
          theme="column"
          auto-width
          size="small"
          :min="1"
          :max="3000"
          @change="updateConfig"
        />
      </t-collapse-panel>

      <!-- 重试次数 -->
      <t-collapse-panel value="retry" header="重试次数">
        <t-input-number
          v-model="localConfig.retryCount"
          placeholder="3"
          theme="column"
          auto-width
          size="small"
          :min="0"
          :max="10"
          @change="updateConfig"
        />
      </t-collapse-panel>

      <!-- 输出 -->
      <t-collapse-panel value="output" header="输出">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">response</span>
          <span class="text-gray-500">String</span>
        </div>
      </t-collapse-panel>
    </t-collapse>
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

  // 折叠面板激活状态
  const activeNames = ref(['api', 'params', 'headers', 'output']);

  // 本地配置副本
  const localConfig = ref({
    label: props.node?.data?.label || 'HTTP节点',
    method: props.node?.data?.config?.method || 'GET',
    url: props.node?.data?.config?.url || '',
    body: props.node?.data?.config?.body || '',
    bodyType: props.node?.data?.config?.bodyType || 'none',
    timeout: props.node?.data?.config?.timeout || 120,
    retryCount: props.node?.data?.config?.retryCount || 3,
    authEnabled: props.node?.data?.config?.authEnabled || false,
    authType: props.node?.data?.config?.authType || 'bearer',
    authToken: props.node?.data?.config?.authToken || '',
    params: Object.entries(props.node?.data?.config?.params || {}).map(([key, value]) => ({ key, value })),
    headers: Object.entries(props.node?.data?.config?.headers || {}).map(([key, value]) => ({ key, value })),
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode) => {
      if (newNode) {
        localConfig.value = {
          label: newNode.data?.label || 'HTTP节点',
          method: newNode.data?.config?.method || 'GET',
          url: newNode.data?.config?.url || '',
          body: newNode.data?.config?.body || '',
          bodyType: newNode.data?.config?.bodyType || 'none',
          timeout: newNode.data?.config?.timeout || 120,
          retryCount: newNode.data?.config?.retryCount || 3,
          authEnabled: newNode.data?.config?.authEnabled || false,
          authType: newNode.data?.config?.authType || 'bearer',
          authToken: newNode.data?.config?.authToken || '',
          params: Object.entries(newNode.data?.config?.params || {}).map(([key, value]) => ({ key, value })),
          headers: Object.entries(newNode.data?.config?.headers || {}).map(([key, value]) => ({ key, value })),
        };
      }
    },
    { deep: true },
  );

  // 添加参数
  const addParam = () => {
    localConfig.value.params.push({ key: '', value: '' });
    updateConfig();
  };

  // 删除参数
  const removeParam = (index: number) => {
    localConfig.value.params.splice(index, 1);
    updateConfig();
  };

  // 添加Header
  const addHeader = () => {
    localConfig.value.headers.push({ key: '', value: '' });
    updateConfig();
  };

  // 删除Header
  const removeHeader = (index: number) => {
    localConfig.value.headers.splice(index, 1);
    updateConfig();
  };

  // 更新配置
  const updateConfig = () => {
    const headers = {};
    localConfig.value.headers.forEach((header) => {
      if (header.key && header.value) {
        headers[header.key] = header.value;
      }
    });

    const params = {};
    localConfig.value.params.forEach((param) => {
      if (param.key && param.value) {
        params[param.key] = param.value;
      }
    });

    emit('update-node', {
      label: localConfig.value.label,
      config: {
        method: localConfig.value.method,
        url: localConfig.value.url,
        headers,
        params,
        body: localConfig.value.body,
        bodyType: localConfig.value.bodyType,
        timeout: localConfig.value.timeout,
        retryCount: localConfig.value.retryCount,
        authEnabled: localConfig.value.authEnabled,
        authType: localConfig.value.authType,
        authToken: localConfig.value.authToken,
      },
    });
  };
</script>

<style scoped>
  .compact-collapse :deep(.t-collapse-panel__header) {
    padding: 8px 0px;
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
