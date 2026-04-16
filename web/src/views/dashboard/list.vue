<template>
  <div class="dashboard-container">
    <h2 class="page-title">数据概览</h2>

    <div class="stats-cards">
      <t-card bordered class="stats-card">
        <div class="card-content">
          <div class="card-icon user-icon">
            <t-icon name="user" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ overviewData.totalUsers }}</div>
            <div class="card-label">总用户数</div>
          </div>
        </div>
      </t-card>

      <t-card bordered class="stats-card">
        <div class="card-content">
          <div class="card-icon active-user-icon">
            <t-icon name="chart-pie" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ overviewData.activeUsers }}</div>
            <div class="card-label">活跃用户</div>
          </div>
        </div>
      </t-card>

      <t-card bordered class="stats-card">
        <div class="card-content">
          <div class="card-icon chat-icon">
            <t-icon name="chat" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ overviewData.totalConversations }}</div>
            <div class="card-label">总对话数</div>
          </div>
        </div>
      </t-card>

      <t-card bordered class="stats-card">
        <div class="card-content">
          <div class="card-icon message-icon">
            <t-icon name="message" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ overviewData.totalMessages }}</div>
            <div class="card-label">总消息数</div>
          </div>
        </div>
      </t-card>

      <t-card bordered class="stats-card">
        <div class="card-content">
          <div class="card-icon model-icon">
            <t-icon name="app" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ overviewData.totalModels }}</div>
            <div class="card-label">总模型数</div>
          </div>
        </div>
      </t-card>

      <t-card bordered class="stats-card">
        <div class="card-content">
          <div class="card-icon knowledge-icon">
            <t-icon name="file" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ overviewData.totalKnowledges }}</div>
            <div class="card-label">总知识库</div>
          </div>
        </div>
      </t-card>

      <t-card bordered class="stats-card">
        <div class="card-content">
          <div class="card-icon workflow-icon">
            <t-icon name="flow" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ overviewData.totalWorkflows }}</div>
            <div class="card-label">总工作流</div>
          </div>
        </div>
      </t-card>

      <t-card bordered class="stats-card">
        <div class="card-content">
          <div class="card-icon success-icon">
            <t-icon name="check-circle" />
          </div>
          <div class="card-info">
            <div class="card-value">{{ overviewData.successRate }}%</div>
            <div class="card-label">执行成功率</div>
          </div>
        </div>
      </t-card>
    </div>

    <div class="charts-row">
      <t-card bordered class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">用户增长趋势</h3>
          <t-radio-group v-model="userDays" variant="filled" size="small">
            <t-radio-button value="7">最近7天</t-radio-button>
            <t-radio-button value="30">最近30天</t-radio-button>
          </t-radio-group>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div v-for="(item, index) in userGrowthData" :key="index" class="bar-item">
              <div class="bar-wrapper">
                <div class="bar" :style="{ height: getBarHeight(userGrowthData, item.count) + '%' }">
                  <span class="bar-value">{{ item.count }}</span>
                </div>
              </div>
              <div class="bar-label">{{ item.date }}</div>
            </div>
          </div>
        </div>
      </t-card>

      <t-card bordered class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">对话量趋势</h3>
          <t-radio-group v-model="conversationDays" variant="filled" size="small">
            <t-radio-button value="7">最近7天</t-radio-button>
            <t-radio-button value="30">最近30天</t-radio-button>
          </t-radio-group>
        </div>
        <div class="chart-container">
          <div class="bar-chart">
            <div v-for="(item, index) in conversationTrendData" :key="index" class="bar-item">
              <div class="bar-wrapper">
                <div class="bar bar-conversation" :style="{ height: getBarHeight(conversationTrendData, item.count) + '%' }">
                  <span class="bar-value">{{ item.count }}</span>
                </div>
              </div>
              <div class="bar-label">{{ item.date }}</div>
            </div>
          </div>
        </div>
      </t-card>
    </div>

    <div class="charts-row">
      <t-card bordered class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">工作流执行统计</h3>
        </div>
        <div class="stats-container">
          <div class="progress-item">
            <div class="progress-header">
              <span class="progress-label">成功</span>
              <span class="progress-count">{{ workflowStats.success }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.success, workflowStats.total)" theme="success" :showInfo="false" />
          </div>
          <div class="progress-item">
            <div class="progress-header">
              <span class="progress-label">失败</span>
              <span class="progress-count">{{ workflowStats.failed }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.failed, workflowStats.total)" theme="danger" :showInfo="false" />
          </div>
          <div class="progress-item">
            <div class="progress-header">
              <span class="progress-label">运行中</span>
              <span class="progress-count">{{ workflowStats.running }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.running, workflowStats.total)" theme="primary" :showInfo="false" />
          </div>
          <div class="progress-item">
            <div class="progress-header">
              <span class="progress-label">已停止</span>
              <span class="progress-count">{{ workflowStats.stopped }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.stopped, workflowStats.total)" theme="warning" :showInfo="false" />
          </div>
          <div class="progress-item">
            <div class="progress-header">
              <span class="progress-label">超时</span>
              <span class="progress-count">{{ workflowStats.timeout }}</span>
            </div>
            <t-progress :percentage="getPercentage(workflowStats.timeout, workflowStats.total)" theme="error" :showInfo="false" />
          </div>
        </div>
      </t-card>

      <t-card bordered class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">模型使用分布</h3>
        </div>
        <div class="pie-container">
          <div class="pie-chart">
            <div class="pie-circle" :style="{ background: getPieBackground(modelDistributionData) }"></div>
            <div class="pie-center">
              <div class="pie-total">{{ overviewData.totalModels }}</div>
              <div class="pie-label">总模型数</div>
            </div>
          </div>
          <div class="pie-legend">
            <div v-for="(item, index) in modelDistributionData" :key="index" class="legend-item">
              <span class="legend-color" :style="{ background: getColor(index) }"></span>
              <span class="legend-label">{{ item.type }}</span>
              <span class="legend-count">{{ item.count }}</span>
            </div>
          </div>
        </div>
      </t-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
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

const userDays = ref<number>(7);
const conversationDays = ref<number>(7);
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
    const res = await getOverview();
    if (res.code === 0) {
      overviewData.value = res.data;
    }
  } catch (error) {
    console.error('获取概览数据失败:', error);
  }
};

const fetchUserGrowth = async () => {
  try {
    const res = await getUserGrowth(userDays.value);
    if (res.code === 0) {
      userGrowthData.value = res.data;
    }
  } catch (error) {
    console.error('获取用户增长数据失败:', error);
  }
};

const fetchConversationTrend = async () => {
  try {
    const res = await getConversationTrend(conversationDays.value);
    if (res.code === 0) {
      conversationTrendData.value = res.data;
    }
  } catch (error) {
    console.error('获取对话量趋势数据失败:', error);
  }
};

const fetchWorkflowStats = async () => {
  try {
    const res = await getWorkflowStats();
    if (res.code === 0) {
      workflowStats.value = res.data;
    }
  } catch (error) {
    console.error('获取工作流统计数据失败:', error);
  }
};

const fetchModelDistribution = async () => {
  try {
    const res = await getModelDistribution();
    if (res.code === 0) {
      modelDistributionData.value = res.data;
    }
  } catch (error) {
    console.error('获取模型分布数据失败:', error);
  }
};

const getBarHeight = (data: TrendData[], count: number): number => {
  if (!data || data.length === 0) return 0;
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

watch(userDays, () => {
  fetchUserGrowth();
});

watch(conversationDays, () => {
  fetchConversationTrend();
});

onMounted(() => {
  fetchOverview();
  fetchUserGrowth();
  fetchConversationTrend();
  fetchWorkflowStats();
  fetchModelDistribution();
});
</script>

<style lang="less" scoped>
.dashboard-container {
  padding: 20px;
  min-height: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2329;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.stats-card {
  .card-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .card-icon {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;
  }

  .user-icon {
    background: linear-gradient(135deg, #0052d9, #0594fa);
  }

  .active-user-icon {
    background: linear-gradient(135deg, #00a870, #36c298);
  }

  .chat-icon {
    background: linear-gradient(135deg, #e37318, #faa41a);
  }

  .message-icon {
    background: linear-gradient(135deg, #d54941, #e88080);
  }

  .model-icon {
    background: linear-gradient(135deg, #722ed1, #b37feb);
  }

  .knowledge-icon {
    background: linear-gradient(135deg, #0052d9, #4080ff);
  }

  .workflow-icon {
    background: linear-gradient(135deg, #00a870, #63c995);
  }

  .success-icon {
    background: linear-gradient(135deg, #e37318, #ff9a2e);
  }

  .card-info {
    .card-value {
      font-size: 28px;
      font-weight: 600;
      color: #1f2329;
      line-height: 1.2;
    }

    .card-label {
      font-size: 14px;
      color: #666e7a;
      margin-top: 4px;
    }
  }
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
}

.chart-card {
  min-height: 320px;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  .chart-title {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: #1f2329;
  }

  .chart-container {
    height: 240px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 100%;
  width: 100%;
  padding: 0 8px;

  .bar-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    height: 100%;
    min-width: 0;
  }

  .bar-wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    flex: 1;
    width: 100%;
  }

  .bar {
    width: 20px;
    max-width: 100%;
    background: linear-gradient(180deg, #0052d9, #0594fa);
    border-radius: 4px 4px 0 0;
    position: relative;
    transition: height 0.3s ease;
    min-height: 4px;

    .bar-value {
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 12px;
      color: #666e7a;
      white-space: nowrap;
    }
  }

  .bar-conversation {
    background: linear-gradient(180deg, #00a870, #36c298);
  }

  .bar-label {
    font-size: 12px;
    color: #666e7a;
    margin-top: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 0;

  .progress-item {
    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .progress-label {
      font-size: 14px;
      color: #1f2329;
    }

    .progress-count {
      font-size: 14px;
      font-weight: 600;
      color: #1f2329;
    }
  }
}

.pie-container {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 24px;
  height: 240px;

  @media (max-width: 768px) {
    flex-direction: column;
    height: auto;
  }
}

.pie-chart {
  position: relative;
  width: 160px;
  height: 160px;

  .pie-circle {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transform: rotate(-90deg);
  }

  .pie-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    background: #fff;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .pie-total {
    font-size: 24px;
    font-weight: 600;
    color: #1f2329;
  }

  .pie-label {
    font-size: 12px;
    color: #666e7a;
    margin-top: 4px;
  }
}

.pie-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .legend-label {
    font-size: 14px;
    color: #1f2329;
  }

  .legend-count {
    font-size: 14px;
    font-weight: 600;
    color: #1f2329;
    margin-left: 8px;
  }
}
</style>
