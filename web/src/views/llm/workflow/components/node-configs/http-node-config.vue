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
        <label class="block text-sm font-medium text-gray-700 mb-2">请求方法</label>
        <t-select v-model="localConfig.method" placeholder="请选择请求方法" @change="updateConfig">
          <t-option value="GET" label="GET" />
          <t-option value="POST" label="POST" />
          <t-option value="PUT" label="PUT" />
          <t-option value="DELETE" label="DELETE" />
          <t-option value="PATCH" label="PATCH" />
        </t-select>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">请求URL</label>
        <t-input v-model="localConfig.url" placeholder="请输入请求URL" @change="updateConfig" />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">请求头</label>
        <div v-for="(header, key) in localConfig.headers" :key="key" class="flex items-center mb-2">
          <t-input v-model="header.key" placeholder="Header名称" class="mr-2" @change="updateConfig" />
          <t-input v-model="header.value" placeholder="Header值" class="mr-2" @change="updateConfig" />
          <t-button variant="outline" size="small" @click="removeHeader(key)">删除</t-button>
        </div>
        <t-button variant="outline" size="small" @click="addHeader">添加Header</t-button>
      </div>

      <div class="mb-4" v-if="localConfig.method !== 'GET'">
        <label class="block text-sm font-medium text-gray-700 mb-2">请求体</label>
        <t-textarea
          v-model="localConfig.body"
          placeholder="请输入请求体内容（JSON格式）"
          :rows="4"
          @change="updateConfig"
        />
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
    label: props.node?.data?.label || 'HTTP节点',
    method: props.node?.data?.config?.method || 'GET',
    url: props.node?.data?.config?.url || '',
    body: props.node?.data?.config?.body || '',
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
          headers: Object.entries(newNode.data?.config?.headers || {}).map(([key, value]) => ({ key, value })),
        };
      }
    },
    { deep: true },
  );

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
    localConfig.value.headers.forEach(header => {
      if (header.key && header.value) {
        headers[header.key] = header.value;
      }
    });

    emit('update-node', {
      label: localConfig.value.label,
      config: {
        method: localConfig.value.method,
        url: localConfig.value.url,
        headers,
        body: localConfig.value.body,
      },
    });
  };

</script>