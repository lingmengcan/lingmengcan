<template>
  <t-dropdown placement="bottom-right" trigger="click">
    <t-button
      variant="text"
      size="small"
      class="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
    >
      <t-icon name="ellipsis" size="16" />
    </t-button>
    <template #dropdown>
      <t-dropdown-menu>
        <t-dropdown-item @click="handleRename">
          <t-icon name="edit" class="mr-2" />
          重命名
        </t-dropdown-item>
        <t-dropdown-item @click="handleCopy">
          <t-icon name="copy" class="mr-2" />
          创建副本
        </t-dropdown-item>
        <t-dropdown-item @click="handleDelete" class="text-red-500">
          <t-icon name="delete" class="mr-2" />
          删除
        </t-dropdown-item>
      </t-dropdown-menu>
    </template>
  </t-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useWorkflowStore } from '@/store/modules/workflow';

const workflowStore = useWorkflowStore();

const emit = defineEmits<{
  'start-rename': [];
}>();

// 获取当前选中的节点信息
const selectedNode = computed(() => workflowStore.selectedNode);
const nodeLabel = computed(() => selectedNode.value?.data?.label || '节点');

// 处理重命名 - 触发编辑模式
const handleRename = () => {
  emit('start-rename');
};

// 处理复制
const handleCopy = () => {
  if (selectedNode.value) {
    workflowStore.copyNode(selectedNode.value.id);
    MessagePlugin.success('节点复制成功');
  }
};

// 处理删除
const handleDelete = () => {
  if (!selectedNode.value) return;
  
  const nodeName = nodeLabel.value;
  
  if (confirm(`确定要删除"${nodeName}"吗？此操作不可撤销。`)) {
    workflowStore.deleteNode(selectedNode.value.id);
    MessagePlugin.success('节点删除成功');
  }
};
</script>