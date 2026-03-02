<template>
  <div>
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- API 配置 -->
      <t-collapse-panel value="api">
        <template #header>
          <span class="font-medium text-gray-700">API</span>
        </template>

        <div class="flex flex-col gap-2">
          <t-select v-model="localConfig.method" class="w-24" size="small" @change="updateConfig">
            <t-option value="GET" label="GET" />
            <t-option value="POST" label="POST" />
            <t-option value="PUT" label="PUT" />
            <t-option value="DELETE" label="DELETE" />
            <t-option value="PATCH" label="PATCH" />
          </t-select>
          <t-input v-model="localConfig.url" placeholder="请输入请求 URL" class="flex-1" size="small" @change="updateConfig" />
        </div>
      </t-collapse-panel>

      <!-- 请求参数 -->
      <t-collapse-panel value="params">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <span class="font-medium text-gray-700">请求参数</span>
            <t-button variant="text" size="small" class="text-blue-500" @click.stop.prevent="addParam">
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div>
          <t-empty v-if="localConfig.params.length === 0" description="暂无参数" />
          <div
            v-for="(param, index) in localConfig.params"
            :key="`param-${index}`"
            class="grid grid-cols-2 gap-2 mb-2 items-center"
          >
            <t-input v-model="param.key" placeholder="参数名" size="small" @change="updateConfig" />
            <div class="flex items-center gap-1">
              <t-input v-model="param.value" placeholder="参数值" class="flex-1" size="small" @change="updateConfig" />
              <t-button variant="text" size="small" class="text-gray-400 hover:text-red-500" @click="removeParam(index)">
                <t-icon name="close" />
              </t-button>
            </div>
          </div>
        </div>
      </t-collapse-panel>

      <!-- 请求头 -->
      <t-collapse-panel value="headers">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <span class="font-medium text-gray-700">请求头</span>
            <t-button variant="text" size="small" class="text-blue-500" @click.stop.prevent="addHeader">
              <t-icon name="add" />
            </t-button>
          </div>
        </template>

        <div>
          <t-empty v-if="localConfig.headers.length === 0" description="暂无请求头" />
          <div
            v-for="(header, index) in localConfig.headers"
            :key="`header-${index}`"
            class="grid grid-cols-2 gap-2 mb-2 items-center"
          >
            <t-input v-model="header.key" placeholder="Header名" size="small" @change="updateConfig" />
            <div class="flex items-center gap-1">
              <t-input v-model="header.value" placeholder="Header值" class="flex-1" size="small" @change="updateConfig" />
              <t-button variant="text" size="small" class="text-gray-400 hover:text-red-500" @click="removeHeader(index)">
                <t-icon name="close" />
              </t-button>
            </div>
          </div>
        </div>
      </t-collapse-panel>

      <!-- 鉴权 -->
      <t-collapse-panel value="auth">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <span class="font-medium text-gray-700">鉴权</span>
            <t-switch v-model="localConfig.authEnabled" size="small" @change="updateConfig" @click.stop />
          </div>
        </template>

        <div v-if="localConfig.authEnabled" class="flex flex-col gap-2">
          <t-select v-model="localConfig.authType" size="small" @change="updateConfig">
            <t-option value="bearer" label="Bearer Token" />
          </t-select>
          <t-input v-model="localConfig.authToken" placeholder="请输入 Token" class="flex-1" size="small" @change="updateConfig" />
        </div>
      </t-collapse-panel>

      <!-- 请求体 -->
      <t-collapse-panel value="body">
        <template #header>
          <span class="font-medium text-gray-700">请求体</span>
        </template>

        <div>
          <div v-if="localConfig.method === 'GET'" class="text-xs text-gray-400 mb-2">
            GET 请求通常不包含请求体
          </div>
          <t-select v-model="localConfig.bodyType" class="mb-3" size="small" @change="updateConfig">
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
            :autosize="{ minRows: 3, maxRows: 10 }"
            @change="updateConfig"
          />
        </div>
      </t-collapse-panel>

      <!-- 超时与重试 -->
      <t-collapse-panel value="timeout">
        <template #header>
          <span class="font-medium text-gray-700">超时与重试</span>
        </template>

        <div class="space-y-3">
          <t-form-item label="超时时间（秒）" class="compact-form-item">
            <t-input-number
              v-model="localConfig.timeout"
              theme="column"
              size="small"
              :min="1"
              :max="3000"
              @change="updateConfig"
            />
          </t-form-item>
          <t-form-item label="重试次数" class="compact-form-item">
            <t-input-number
              v-model="localConfig.retryCount"
              theme="column"
              size="small"
              :min="0"
              :max="10"
              @change="updateConfig"
            />
          </t-form-item>
        </div>
      </t-collapse-panel>

      <!-- 输出 -->
      <t-collapse-panel value="output">
        <template #header>
          <span class="font-medium text-gray-700">输出</span>
        </template>

        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">statusCode</span>
            <span class="text-gray-400">Number</span>
            <span class="text-xs text-gray-400">HTTP 状态码</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">headers</span>
            <span class="text-gray-400">Object</span>
            <span class="text-xs text-gray-400">响应头</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span class="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">body</span>
            <span class="text-gray-400">String</span>
            <span class="text-xs text-gray-400">响应体</span>
          </div>
        </div>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, nextTick } from 'vue';

  interface KeyValue {
    key: string;
    value: string;
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

  const activeNames = ref(['api', 'params', 'headers', 'body', 'output']);
  const isUpdating = ref(false);

  // 将对象格式的 params/headers 转为数组格式
  const toKeyValueArray = (obj: any): KeyValue[] => {
    if (Array.isArray(obj)) return obj;
    if (obj && typeof obj === 'object') {
      return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }));
    }
    return [];
  };

  const localConfig = reactive({
    label: props.node?.data?.label || 'HTTP节点',
    method: props.node?.data?.config?.method || 'GET',
    url: props.node?.data?.config?.url || '',
    body: props.node?.data?.config?.body || '',
    bodyType: props.node?.data?.config?.bodyType || 'none',
    timeout: props.node?.data?.config?.timeout || 120,
    retryCount: props.node?.data?.config?.retryCount ?? 3,
    authEnabled: props.node?.data?.config?.authEnabled || false,
    authType: props.node?.data?.config?.authType || 'bearer',
    authToken: props.node?.data?.config?.authToken || '',
    params: toKeyValueArray(props.node?.data?.config?.params),
    headers: toKeyValueArray(props.node?.data?.config?.headers),
  });

  watch(
    () => props.node,
    (newNode, oldNode) => {
      if (isUpdating.value) return;
      if (newNode && newNode.id !== oldNode?.id) {
        Object.assign(localConfig, {
          label: newNode.data?.label || 'HTTP节点',
          method: newNode.data?.config?.method || 'GET',
          url: newNode.data?.config?.url || '',
          body: newNode.data?.config?.body || '',
          bodyType: newNode.data?.config?.bodyType || 'none',
          timeout: newNode.data?.config?.timeout || 120,
          retryCount: newNode.data?.config?.retryCount ?? 3,
          authEnabled: newNode.data?.config?.authEnabled || false,
          authType: newNode.data?.config?.authType || 'bearer',
          authToken: newNode.data?.config?.authToken || '',
          params: toKeyValueArray(newNode.data?.config?.params),
          headers: toKeyValueArray(newNode.data?.config?.headers),
        });
      }
    },
    { deep: true },
  );

  const addParam = () => {
    localConfig.params.push({ key: '', value: '' });
  };

  const removeParam = (index: number) => {
    localConfig.params.splice(index, 1);
    updateConfig();
  };

  const addHeader = () => {
    localConfig.headers.push({ key: '', value: '' });
  };

  const removeHeader = (index: number) => {
    localConfig.headers.splice(index, 1);
    updateConfig();
  };

  const updateConfig = () => {
    isUpdating.value = true;

    // 转回对象格式给后端
    const headers: Record<string, string> = {};
    localConfig.headers.forEach((h) => {
      if (h.key) headers[h.key] = h.value;
    });

    const params: Record<string, string> = {};
    localConfig.params.forEach((p) => {
      if (p.key) params[p.key] = p.value;
    });

    emit('update-node', {
      label: localConfig.label,
      config: {
        method: localConfig.method,
        url: localConfig.url,
        headers,
        params,
        body: localConfig.body,
        bodyType: localConfig.bodyType,
        timeout: localConfig.timeout,
        retryCount: localConfig.retryCount,
        authEnabled: localConfig.authEnabled,
        authType: localConfig.authType,
        authToken: localConfig.authToken,
        outputs: props.node?.data?.config?.outputs || [
          { name: 'statusCode', type: 'number' },
          { name: 'headers', type: 'json' },
          { name: 'body', type: 'text' },
        ],
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
    text-align: left;
  }
</style>
