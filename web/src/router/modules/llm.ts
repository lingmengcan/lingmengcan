import { RouteRecordRaw } from 'vue-router';

const llmRoutes: RouteRecordRaw[] = [
  {
    path: '/llm',
    name: 'LLM',
    redirect: '/llm/model',
    meta: {
      title: 'LLM管理',
      icon: 'brain',
      orderNo: 3,
    },
    children: [
      {
        path: '/llm/model',
        name: 'LLMModel',
        component: () => import('@/views/llm/model/index.vue'),
        meta: {
          title: '模型管理',
          icon: 'server',
        },
      },
      {
        path: '/llm/app',
        name: 'LLMApp',
        component: () => import('@/views/llm/app/index.vue'),
        meta: {
          title: 'AI工作流应用',
          icon: 'flow',
        },
      },
      {
        path: '/llm/workflow-designer',
        name: 'WorkflowDesigner',
        component: () => import('@/views/llm/workflow-designer.vue'),
        meta: {
          title: '工作流设计器',
          icon: 'edit-1',
          hideInMenu: true,
        },
      },
      {
        path: '/llm/workflow-execution',
        name: 'WorkflowExecution',
        component: () => import('@/views/llm/app/components/workflow-execution.vue'),
        meta: {
          title: '执行历史',
          icon: 'time',
          hideInMenu: true,
        },
      },
      {
        path: '/llm/knowledge',
        name: 'LLMKnowledge',
        component: () => import('@/views/llm/knowledge/index.vue'),
        meta: {
          title: '知识库管理',
          icon: 'book',
        },
      },
      {
        path: '/llm/mcp',
        name: 'LLMMCP',
        component: () => import('@/views/llm/mcp/index.vue'),
        meta: {
          title: 'MCP管理',
          icon: 'plugin',
        },
      },
    ],
  },
];

export default llmRoutes;