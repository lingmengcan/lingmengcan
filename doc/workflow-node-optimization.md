# 工作流节点类型优化

## 概述

本次优化将工作流节点类型定义统一管理到 `plugin` 表中，实现了更灵活和可扩展的节点管理机制。

## 优化内容

### 1. 数据库配置优化

利用现有的 `config` 字段存储工作流节点相关配置，包含以下信息：

- `isWorkflowNode`: 是否为工作流节点标识 (boolean)
- `nodeType`: 工作流节点类型 (start, end, llm, prompt, condition, http, custom)
- `componentPath`: Vue组件文件路径
- `nodeConfigSchema`: 节点配置的JSON Schema

### 2. 前端代码优化

#### 修改文件
- `web/src/views/llm/workflow/components/workflow-designer.vue`
- `service/src/entities/plugin.entity.ts`

#### 主要改进
1. **动态节点类型加载**: 从数据库动态加载工作流节点类型，替代硬编码方式
2. **节点过滤**: 通过 `is_workflow_node` 字段过滤出工作流相关的插件
3. **配置模式支持**: 支持通过 `node_config_schema` 定义节点配置结构
4. **组件路径管理**: 通过 `component_path` 字段管理节点组件文件路径

### 3. 数据迁移

创建了数据库迁移脚本 `service/src/migrations/update-plugin-config-for-workflow-nodes.sql`，包含：

- 更新现有插件的config字段
- 添加工作流节点标识和配置
- 初始化节点配置模式

## 使用方式

### 添加新的工作流节点类型

1. 在 `plugin` 表中插入新记录：
```sql
INSERT INTO plugin (
  plugin_id, plugin_name, plugin_type, description, icon, config
) VALUES (
  'custom-node-001', 
  '自定义节点', 
  'custom',
  '这是一个自定义的工作流节点',
  'component',
  JSON_OBJECT(
    'isWorkflowNode', true,
    'nodeType', 'custom',
    'componentPath', './nodes/custom-node.vue',
    'nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'customField', JSON_OBJECT('type', 'string', 'default', '自定义值')
      )
    )
  )
);
```

2. 创建对应的Vue组件文件

3. 在 `workflow-designer.vue` 中注册组件（如果需要）

### 节点配置模式

每个节点类型都可以定义自己的配置模式，例如：

```json
{
  "type": "object",
  "properties": {
    "model": {
      "type": "string",
      "default": "gpt-3.5-turbo",
      "description": "LLM模型名称"
    },
    "temperature": {
      "type": "number",
      "default": 0.7,
      "minimum": 0,
      "maximum": 2
    }
  }
}
```

## 优势

1. **统一管理**: 所有节点类型在数据库中统一管理
2. **动态扩展**: 可以通过数据库配置动态添加新节点类型
3. **配置验证**: 通过JSON Schema验证节点配置
4. **组件解耦**: 节点组件路径可配置，便于组件管理
5. **类型安全**: 前端代码中增加了完整的类型定义

## 注意事项

1. 执行数据库迁移前请备份数据
2. 新增节点类型需要对应的Vue组件支持
3. 配置模式需要遵循JSON Schema规范
4. 建议在测试环境先验证功能正常性