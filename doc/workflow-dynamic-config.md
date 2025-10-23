# 工作流动态节点配置系统

## 概述

工作流节点配置系统支持从插件表的 `config` 字段读取配置，动态渲染节点配置界面，无需为每个节点类型编写独立的配置组件。

## 架构设计

### 1. 核心组件

- **DynamicNodeConfig.vue**: 通用的动态配置组件，根据 schema 渲染配置界面
- **插件表 (plugin)**: 存储节点类型的配置 schema
- **节点配置组件**: 使用 DynamicNodeConfig 组件，传入 schema

### 2. 配置流程

```
插件表 (config 字段) 
  ↓
Store 加载插件配置
  ↓
节点配置组件读取 schema
  ↓
DynamicNodeConfig 动态渲染
```

## 配置 Schema 格式

### 基本结构

```typescript
interface ConfigSection {
  key: string;                    // 配置项的键名
  label: string;                  // 显示标签
  type: 'array' | 'object' | 'simple';  // 配置类型
  
  // 数组类型专用
  fields?: Array<{
    key: string;
    label: string;
    type: string;                 // input, select, source, textarea
    placeholder?: string;
    style?: string;               // CSS 样式
    dictType?: string;            // 字典类型（用于下拉选择）
    autosize?: { minRows: number; maxRows: number };
  }>;
  defaultItem?: Record<string, any>;  // 数组项的默认值
  sourceType?: 'input' | 'output';    // 数据源类型
  
  // 简单类型专用
  fieldType?: string;             // input, textarea, select
  placeholder?: string;
  dictType?: string;
  autosize?: { minRows: number; maxRows: number };
}
```

### 配置类型说明

#### 1. Array 类型

用于配置数组形式的数据，如输入变量、输出变量、请求头等。

```json
{
  "key": "inputs",
  "label": "输入变量",
  "type": "array",
  "fields": [
    {
      "key": "name",
      "label": "变量名",
      "type": "input",
      "placeholder": "变量名",
      "style": "width: 120px"
    },
    {
      "key": "type",
      "label": "类型",
      "type": "select",
      "dictType": "INPUT_TYPE",
      "style": "width: 80px"
    },
    {
      "key": "source",
      "label": "来源",
      "type": "source",
      "placeholder": "选择来源",
      "style": "flex: 1"
    }
  ],
  "defaultItem": {
    "name": "input",
    "type": "text",
    "source": ""
  },
  "sourceType": "input"
}
```

**渲染效果**：
- 显示折叠面板，标题为 "输入变量"
- 右上角有添加按钮
- 每一行显示一个数组项，包含多个字段
- 每行右侧有删除按钮

#### 2. Object 类型

用于配置对象形式的数据。

```json
{
  "key": "settings",
  "label": "设置",
  "type": "object",
  "fields": [
    {
      "key": "timeout",
      "label": "超时时间",
      "type": "input",
      "placeholder": "毫秒"
    },
    {
      "key": "retry",
      "label": "重试次数",
      "type": "input",
      "placeholder": "次数"
    }
  ]
}
```

#### 3. Simple 类型

用于配置简单的单个字段。

```json
{
  "key": "systemPrompt",
  "label": "系统提示词",
  "type": "simple",
  "fieldType": "textarea",
  "placeholder": "系统提示词",
  "autosize": {
    "minRows": 4,
    "maxRows": 8
  }
}
```

### 字段类型说明

#### input
普通文本输入框

```json
{
  "key": "name",
  "type": "input",
  "placeholder": "请输入名称",
  "style": "width: 200px"
}
```

#### textarea
多行文本输入框

```json
{
  "key": "prompt",
  "type": "textarea",
  "placeholder": "请输入提示词",
  "autosize": { "minRows": 3, "maxRows": 8 }
}
```

#### select
下拉选择框（使用字典）

```json
{
  "key": "type",
  "type": "select",
  "dictType": "INPUT_TYPE",
  "style": "width: 100px"
}
```

#### source
数据源选择器（自动获取上游节点的输出）

```json
{
  "key": "source",
  "type": "source",
  "placeholder": "选择来源",
  "style": "flex: 1"
}
```

## 使用示例

### 1. 在插件表中配置

```sql
INSERT INTO `plugin` (
  `plugin_id`,
  `plugin_name`,
  `plugin_type`,
  `config`
) VALUES (
  'start-node-plugin',
  '开始节点',
  'start',
  '{
    "nodeType": "start",
    "nodeConfigSchema": [
      {
        "key": "inputs",
        "label": "输入变量",
        "type": "array",
        "fields": [
          {
            "key": "name",
            "type": "input",
            "placeholder": "变量名",
            "style": "width: 120px"
          },
          {
            "key": "type",
            "type": "select",
            "dictType": "INPUT_TYPE",
            "style": "width: 80px"
          }
        ],
        "defaultItem": {
          "name": "input",
          "type": "text"
        }
      }
    ]
  }'
);
```

### 2. 在节点配置组件中使用

```vue
<template>
  <div>
    <DynamicNodeConfig
      :node="node"
      :config-schema="configSchema"
      @update-node="handleUpdateNode"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DynamicNodeConfig from './dynamic-node-config.vue';
import { useWorkflowStore } from '@/store/modules/workflow';

const props = defineProps<{
  node: any;
}>();

const emit = defineEmits<{
  'update-node': [data: NodeData];
}>();

const workflowStore = useWorkflowStore();

// 从插件配置中获取 schema
const configSchema = computed(() => {
  const nodeTypeInfo = workflowStore.availableNodeTypes.find(
    (t) => t.type === props.node?.type
  );
  
  if (nodeTypeInfo?.config?.nodeConfigSchema) {
    return nodeTypeInfo.config.nodeConfigSchema;
  }

  // 如果没有配置，返回默认 schema
  return [];
});

const handleUpdateNode = (data: NodeData) => {
  emit('update-node', data);
};
</script>
```

## 数据源选择功能

### 自动获取上游节点输出

当字段类型为 `source` 时，组件会自动：

1. 获取当前节点的所有入边
2. 找到连接的上游节点
3. 读取上游节点的输出变量
4. 对于 start 节点，使用其 inputs 作为输出
5. 生成下拉选项：`节点ID.变量名`

### 示例

假设工作流结构：
```
Start节点 (inputs: [input1, input2])
  ↓
LLM节点 (需要选择数据源)
```

LLM节点的数据源下拉框会显示：
- `start-xxx.input1` - 开始节点 - input1
- `start-xxx.input2` - 开始节点 - input2

## 迁移现有节点

### 步骤

1. **准备配置 Schema**
   - 分析现有节点配置组件
   - 编写对应的 JSON Schema
   - 插入到插件表

2. **修改节点配置组件**
   - 引入 DynamicNodeConfig
   - 从 store 读取 schema
   - 传递给 DynamicNodeConfig

3. **测试验证**
   - 测试配置界面渲染
   - 测试数据保存和读取
   - 测试数据源选择功能

### 示例：迁移 Start 节点

**原始代码**（185行）：
```vue
<template>
  <div>
    <t-collapse>
      <t-collapse-panel value="input">
        <!-- 大量模板代码 -->
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  // 大量逻辑代码
</script>
```

**迁移后**（60行）：
```vue
<template>
  <div>
    <DynamicNodeConfig
      :node="node"
      :config-schema="configSchema"
      @update-node="handleUpdateNode"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DynamicNodeConfig from './dynamic-node-config.vue';
import { useWorkflowStore } from '@/store/modules/workflow';

// 简洁的逻辑代码
</script>
```

## 优势

1. **代码复用**：所有节点共享同一个配置组件
2. **易于维护**：配置存储在数据库，无需修改代码
3. **灵活扩展**：新增节点类型只需添加配置，无需编写组件
4. **统一体验**：所有节点配置界面风格一致
5. **动态更新**：修改配置后立即生效，无需重新部署

## 注意事项

1. **Schema 验证**：确保 JSON Schema 格式正确
2. **字典类型**：使用的 dictType 必须在系统中已定义
3. **默认值**：为数组类型提供合理的 defaultItem
4. **样式适配**：使用 style 属性控制字段宽度
5. **数据源**：source 类型字段会自动处理上游节点关系

## 后续优化

1. **Schema 编辑器**：提供可视化的 Schema 编辑界面
2. **配置验证**：添加 Schema 格式验证
3. **更多字段类型**：支持日期、颜色、文件上传等
4. **条件显示**：根据其他字段值动态显示/隐藏字段
5. **自定义组件**：支持注册自定义字段组件
