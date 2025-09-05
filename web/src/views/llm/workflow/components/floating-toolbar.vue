<template>
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10">
    <div
      class="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-lg border border-gray-200 backdrop-blur-sm"
    >
      <!-- 交互模式切换 -->
      <t-tooltip :content="workflowStore.interactionMode === 'mouse' ? '切换到触控板模式' : '切换到鼠标模式'">
        <t-button variant="text" size="small" @click="workflowStore.toggleInteractionMode" class="rounded-full">
          <template #icon><t-icon :name="workflowStore.interactionMode === 'mouse' ? 'mouse' : 'laptop'" /></template>
        </t-button>
      </t-tooltip>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 撤销按钮 -->
      <t-tooltip content="撤销">
        <t-button 
          variant="text" 
          size="small" 
          @click="workflowStore.undo" 
          :disabled="!workflowStore.canUndo"
          class="rounded-full"
        >
          <template #icon><t-icon name="rollback" /></template>
        </t-button>
      </t-tooltip>

      <!-- 重做按钮 -->
      <t-tooltip content="重做">
        <t-button 
          variant="text" 
          size="small" 
          @click="workflowStore.redo" 
          :disabled="!workflowStore.canRedo"
          class="rounded-full"
        >
          <template #icon><t-icon name="rollfront" /></template>
        </t-button>
      </t-tooltip>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 缩放控制 -->
      <t-tooltip content="缩小">
        <t-button variant="text" size="small" @click="zoomOut" class="rounded-full">
          <template #icon><t-icon name="zoom-out" /></template>
        </t-button>
      </t-tooltip>

      <span class="text-sm text-gray-600">{{ Math.round(zoom * 100) }}%</span>

      <t-tooltip content="放大">
        <t-button variant="text" size="small" @click="zoomIn" class="rounded-full">
          <template #icon><t-icon name="zoom-in" /></template>
        </t-button>
      </t-tooltip>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 整理布局 -->
      <t-tooltip content="适应画布">
        <t-button variant="text" size="small" @click="fitView" class="rounded-full">
          <template #icon><t-icon name="fullscreen" /></template>
        </t-button>
      </t-tooltip>

      <t-tooltip content="自动布局">
        <t-button variant="text" size="small" @click="handleAutoLayout" class="rounded-full">
          <template #icon><t-icon name="component-layout" /></template>
        </t-button>
      </t-tooltip>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 添加节点 -->
      <t-button theme="primary" size="small" @click="workflowStore.showAddNodeDialog" class="rounded-full">
        <template #icon><t-icon name="add" /></template>
        添加节点
      </t-button>

      <!-- 分隔线 -->
      <div class="h-4 w-px bg-gray-200"></div>

      <!-- 运行按钮 -->
      <t-button theme="success" size="small" @click="$emit('test-workflow')" class="rounded-full">
        <template #icon><t-icon name="play-circle-stroke" /></template>
        试运行
      </t-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useVueFlow } from '@vue-flow/core';
  import { useWorkflowStore } from '@/store/modules/workflow';

  // Store
  const workflowStore = useWorkflowStore();

  // Emits (只保留需要传递给父组件的事件)
  defineEmits<{
    'test-workflow': [];
  }>();

  // Vue Flow 实例
  const { zoomTo, getViewport, fitView } = useVueFlow();

  // 响应式状态
  const zoom = ref(1);

  // 缩放控制
  const zoomIn = () => {
    const currentZoom = zoom.value;
    const newZoom = Math.min(currentZoom + 0.1, 2);
    zoomTo(newZoom);
    zoom.value = newZoom;
  };

  const zoomOut = () => {
    const currentZoom = zoom.value;
    const newZoom = Math.max(currentZoom - 0.1, 0.2);
    zoomTo(newZoom);
    zoom.value = newZoom;
  };

  // 自动布局
  const handleAutoLayout = () => {
    workflowStore.autoLayout();
    setTimeout(() => {
      fitView();
    }, 100);
  };

  onMounted(() => {
    // 监听缩放变化
    const updateZoom = () => {
      const viewport = getViewport();
      zoom.value = viewport.zoom;
      requestAnimationFrame(updateZoom);
    };
    updateZoom();
  });
</script>
