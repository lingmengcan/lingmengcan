import { RouteRecordRaw } from 'vue-router';

const llmRoutes: RouteRecordRaw[] = [
  {
    path: '/llm',
    name: 'LLM',
    redirect: '/llm/workflow-designer',
    meta: {
      title: 'LLM管理',
      icon: 'brain',
      orderNo: 3,
    },
    children: [
      {
        path: '/llm/workflow-designer',
        name: 'WorkflowDesigner',
        component: () => import('@/views/llm/workflow/designer.vue'),
        meta: {
          title: '工作流设计器',
          icon: 'edit-1',
          hideInMenu: true,
        },
      },
      {
        path: '/llm/workflow-execution',
        name: 'WorkflowExecution',
        component: () => import('@/views/llm/workflow/components/workflow-execution.vue'),
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
        path: '/llm/plugin',
        name: 'LLMPlugin',
        component: () => import('@/views/llm/plugin/index.vue'),
        meta: {
          title: '插件市场',
          icon: 'app',
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