<template>
  <div>
    <t-card :bordered="false" class="mb-4!">
      <h2 class="text-xl font-semibold mb-4">数据概览</h2>
      
      <div class="grid grid-cols-4 gap-4 mb-6">
        <t-card bordered class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                 style="background: linear-gradient(135deg, #0052d9, #0594fa)">
              <t-icon name="user" />
            </div>
            <div>
              <div class="text-2xl font-semibold text-gray-800">{{ overviewData.totalUsers }}</div>
              <div class="text-sm text-gray-500 mt-1">总用户数</div>
            </div>
          </div>
        </t-card>

        <t-card bordered class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                 style="background: linear-gradient(135deg, #00a870, #36c298)">
              <t-icon name="chart-pie" />
            </div>
            <div>
              <div class="text-2xl font-semibold text-gray-800">{{ overviewData.activeUsers }}</div>
              <div class="text-sm text-gray-500 mt-1">活跃用户</div>
            </div>
          </div>
        </t-card>

        <t-card bordered class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                 style="background: linear-gradient(135deg, #e37318, #faa41a)">
              <t-icon name="chat" />
            </div>
            <div>
              <div class="text-2xl font-semibold text-gray-800">{{ overviewData.totalConversations }}</div>
              <div class="text-sm text-gray-500 mt-1">总对话数</div>
            </div>
          </div>
        </t-card>

        <t-card bordered class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                 style="background: linear-gradient(135deg, #d54941, #e88080)">
              <t-icon name="message" />
            </div>
            <div>
              <div class="text-2xl font-semibold text-gray-800">{{ overviewData.totalMessages }}</div>
              <div class="text-sm text-gray-500 mt-1">总消息数</div>
            </div>
          </div>
        </t-card>
      </div>

      <div class="grid grid-cols-4 gap-4 mb-6">
        <t-card bordered class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                 style="background: linear-gradient(135deg, #722ed1, #b37feb)">
              <t-icon name="app" />
            </div>
            <div>
              <div class="text-2xl font-semibold text-gray-800">{{ overviewData.totalModels }}</div>
              <div class="text-sm text-gray-500 mt-1">总模型数</div>
            </div>
          </div>
        </t-card>

        <t-card bordered class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                 style="background: linear-gradient(135deg, #0052d9, #4080ff)">
              <t-icon name="file" />
            </div>
            <div>
              <div class="text-2xl font-semibold text-gray-800">{{ overviewData.totalKnowledges }}</div>
              <div class="text-sm text-gray-500 mt-1">总知识库</div>
            </div>
          </div>
        </t-card>

        <t-card bordered class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                 style="background: linear-gradient(135deg, #00a870, #63c995)">
              <t-icon name="flow" />
            </div>
            <div>
              <div class="text-2xl font-semibold text-gray-800">{{ overviewData.totalWorkflows }}</div>
              <div class="text-sm text-gray-500 mt-1">总工作流</div>
            </div>
          </div>
        </t-card>

        <t-card bordered class="h-full">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl"
                 style="background: linear-gradient(135deg, #e37318, #ff9a2e)">
              <t-icon name="check-circle" />
            </div>
            <div>
              <div class="text-2xl font-semibold text-gray-800">{{ overviewData.successRate }}%</div>
              <div class="text-sm text-gray-500 mt-1">执行成功率</div>
            </div>
          </div>
        </t-card>
      </div>
    </t-card>

    <div class="grid grid-cols-2 gap-4 mb-4">
      <t-card :bordered="false">
        <template #title>用户增长趋势</template>
        <div class="pt-4">
          <div v-if="userGrowthData.length > 0" class="flex items-end gap-2 h-48">
            <div v-for="(item, index) in userGrowthData" :key="index" class="flex flex-col items-center flex-1">
              <div class="w-full flex justify-center mb-1">
                <span class="text-xs text-gray-500">{{ item.count }}</span>
              </div>
              <div class="w-5 rounded-t flex-1 max-h-full"
                   :style="{ background: 'linear-gradient(180deg, #0052d9, #0594fa)', minHeight: '4px', height: getBarHeight(userGrowthData, item.count) + '%' }">
              </div>
              <div class="text-xs text-gray-500 mt-2">{{ item.date }}</div>
            </div>
          </div>
          <div v-else class="h-48 flex items-center justify-center text-gray-400">
            暂无数据
          </div>
        </div>
      </t-card>

      <t-card :bordered="false">
        <template #title>对话量趋势</template>
        <div class="pt-4">
          <div v-if="conversationTrendData.length > 0" class="flex items-end gap-2 h-48">
            <div v-for="(item, index) in conversationTrendData" :key="index" class="flex flex-col items-center flex-1">
              <div class="w-full flex justify-center mb-1">
                <span class="text-xs text-gray-500">{{ item.count }}</span>
              </div>
              <div class="w-5 rounded-t flex-1 max-h-full"
                   :style="{ background: 'linear-gradient(180deg, #00a870, #36c298)', minHeight: '4px', height: getBarHeight(conversationTrendData, item.count) + '%' }">
              </div>
              <div class="text-xs text-gray-500 mt-2">{{ item.date }}</div>
            </div>
          </div>
          <div v-else class="h-48 flex items-center justify-center text-gray-400">
            暂无数据
          </div>
        </div>
      </t-card>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <t-card :bordered="false">
        <template #title>工作流执行统计</template>
        <div class="pt-4 space-y-4">
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-700">成功</span>
              <span class="text-sm font-semibold text-gray-800">{{ workflowStats.success }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.success, workflowStats.total)"
                       theme="success" :showInfo="false" />
          </div>
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-700">失败</span>
              <span class="text-sm font-semibold text-gray-800">{{ workflowStats.failed }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.failed, workflowStats.total)"
                       theme="danger" :showInfo="false" />
          </div>
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-700">运行中</span>
              <span class="text-sm font-semibold text-gray-800">{{ workflowStats.running }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.running, workflowStats.total)"
                       theme="primary" :showInfo="false" />
          </div>
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-700">已停止</span>
              <span class="text-sm font-semibold text-gray-800">{{ workflowStats.stopped }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.stopped, workflowStats.total)"
                       theme="warning" :showInfo="false" />
          </div>
          <div>
            <div class="flex justify-between mb-2">
              <span class="text-sm text-gray-700">超时</span>
              <span class="text-sm font-semibold text-gray-800">{{ workflowStats.timeout }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.timeout, workflowStats.total)"
                       theme="error" :showInfo="false" />
          </div>
        </div>
      </t-card>

      <t-card :bordered="false">
        <template #title>模型使用分布</template>
        <div class="pt-4">
          <div class="flex items-center justify-around">
            <div class="relative w-40 h-40">
              <div class="w-full h-full rounded-full"
                   :style="{ background: getPieBackground(modelDistributionData) }">
              </div>
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-24 h-24 rounded-full flex flex-col items-center justify-center">
                <div class="text-2xl font-semibold text-gray-800">{{ overviewData.totalModels }}</div>
                <div class="text-xs text-gray-500">总模型数</div>
              </div>
            </div>
            <div class="space-y-3">
              <div v-for="(item, index) in modelDistributionData" :key="index" class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full"
                     :style="{ background: getColor(index) }">
                </div>
                <span class="text-sm text-gray-700">{{ item.type }}</span>
                <span class="text-sm font-semibold text-gray-800 ml-2">{{ item.count }}</span>
              </div>
              <div v-if="modelDistributionData.length === 0" class="text-sm text-gray-400">
                暂无数据
              </div>
            </div>
          </div>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  getOverview,
  getUserGrowth,
  getConversationTrend,
  getWorkflowStats,
  getModelDistribution,
  type OverviewData,
  type TrendData,
  type WorkflowStats,
  type ModelDistribution,
} from '@/api/dashboard';

const overviewData = ref<OverviewData>({
  totalUsers: 0,
  activeUsers: 0,
  totalConversations: 0,
  totalMessages: 0,
  totalModels: 0,
  totalKnowledges: 0,
  totalWorkflows: 0,
  successRate: 0,
});

const userGrowthData = ref<TrendData[]>([]);
const conversationTrendData = ref<TrendData[]>([]);
const workflowStats = ref<WorkflowStats>({
  total: 0,
  success: 0,
  failed: 0,
  running: 0,
  stopped: 0,
  timeout: 0,
});
const modelDistributionData = ref<ModelDistribution[]>([]);

const colors = ['#0052D9', '#0594FA', '#00A870', '#E37318', '#D54941', '#722ED1'];

const fetchOverview = async () => {
  try {
    console.log('开始获取概览数据...');
    const res = await getOverview();
    console.log('概览数据响应:', res);
    if (res && res.code === 0) {
      overviewData.value = res.data;
      console.log('概览数据已更新:', overviewData.value);
    } else {
      console.warn('获取概览数据失败，code:', res?.code);
    }
  } catch (error) {
    console.error('获取概览数据异常:', error);
  }
};

const fetchUserGrowth = async () => {
  try {
    console.log('开始获取用户增长数据...');
    const res = await getUserGrowth(7);
    console.log('用户增长数据响应:', res);
    if (res && res.code === 0) {
      userGrowthData.value = res.data;
      console.log('用户增长数据已更新:', userGrowthData.value);
    }
  } catch (error) {
    console.error('获取用户增长数据异常:', error);
  }
};

const fetchConversationTrend = async () => {
  try {
    console.log('开始获取对话量趋势数据...');
    const res = await getConversationTrend(7);
    console.log('对话量趋势数据响应:', res);
    if (res && res.code === 0) {
      conversationTrendData.value = res.data;
      console.log('对话量趋势数据已更新:', conversationTrendData.value);
    }
  } catch (error) {
    console.error('获取对话量趋势数据异常:', error);
  }
};

const fetchWorkflowStats = async () => {
  try {
    console.log('开始获取工作流统计数据...');
    const res = await getWorkflowStats();
    console.log('工作流统计数据响应:', res);
    if (res && res.code === 0) {
      workflowStats.value = res.data;
      console.log('工作流统计数据已更新:', workflowStats.value);
    }
  } catch (error) {
    console.error('获取工作流统计数据异常:', error);
  }
};

const fetchModelDistribution = async () => {
  try {
    console.log('开始获取模型分布数据...');
    const res = await getModelDistribution();
    console.log('模型分布数据响应:', res);
    if (res && res.code === 0) {
      modelDistributionData.value = res.data;
      console.log('模型分布数据已更新:', modelDistributionData.value);
    }
  } catch (error) {
    console.error('获取模型分布数据异常:', error);
  }
};

const getBarHeight = (data: TrendData[], count: number): number => {
  if (!data || data.length === 0) return 5;
  const maxCount = Math.max(...data.map((item) => item.count), 1);
  return (count / maxCount) * 80 + 5;
};

const getPercentage = (part: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
};

const getColor = (index: number): string => {
  return colors[index % colors.length];
};

const getPieBackground = (data: ModelDistribution[]): string => {
  if (!data || data.length === 0) return '#e8e8e8';
  const total = data.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) return '#e8e8e8';

  let currentDeg = 0;
  const stops: string[] = [];

  data.forEach((item, index) => {
    const percent = item.count / total;
    const endDeg = currentDeg + percent * 360;
    stops.push(`${getColor(index)} ${currentDeg}deg ${endDeg}deg`);
    currentDeg = endDeg;
  });

  if (currentDeg < 360) {
    stops.push(`#e8e8e8 ${currentDeg}deg 360deg`);
  }

  return `conic-gradient(${stops.join(', ')})`;
};

onMounted(() => {
  console.log('仪表盘页面已挂载，开始获取数据...');
  fetchOverview();
  fetchUserGrowth();
  fetchConversationTrend();
  fetchWorkflowStats();
  fetchModelDistribution();
});
</script>

<style lang="less" scoped>
</style>
