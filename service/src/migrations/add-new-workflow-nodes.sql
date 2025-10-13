-- 添加新的工作流节点类型到插件表

-- 添加循环控制节点
INSERT INTO `plugin` (
  `plugin_id`, `plugin_name`, `plugin_type`, `plugin_type_name`, `description`, `icon`, `version`, `author`, `config`, `status`, `created_user`, `updated_user`
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '循环控制节点',
  'loop',
  '循环控制',
  '支持for、while、foreach等循环控制逻辑',
  'refresh',
  '1.0.0',
  'system',
  JSON_OBJECT(
    'nodeType', 'loop',
    'componentPath', './nodes/loop-node.vue',
    'nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'loopType', JSON_OBJECT('type', 'string', 'default', 'for'),
        'maxIterations', JSON_OBJECT('type', 'number', 'default', 10),
        'condition', JSON_OBJECT('type', 'string', 'default', ''),
        'breakCondition', JSON_OBJECT('type', 'string', 'default', ''),
        'outputVariable', JSON_OBJECT('type', 'string', 'default', 'output'),
        'outputType', JSON_OBJECT('type', 'string', 'default', 'array'),
        'aggregation', JSON_OBJECT('type', 'string', 'default', 'collect')
      )
    )
  ),
  0,
  'system',
  'system'
);

-- 添加并行处理节点
INSERT INTO `plugin` (
  `plugin_id`, `plugin_name`, `plugin_type`, `plugin_type_name`, `description`, `icon`, `version`, `author`, `config`, `status`, `created_user`, `updated_user`
) VALUES (
  '7c8e9f12-3456-7890-abcd-ef1234567890',
  '并行处理节点',
  'parallel',
  '并行处理',
  '支持多分支并行执行和结果合并',
  'layers',
  '1.0.0',
  'system',
  JSON_OBJECT(
    'nodeType', 'parallel',
    'componentPath', './nodes/parallel-node.vue',
    'nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'branchCount', JSON_OBJECT('type', 'number', 'default', 2),
        'strategy', JSON_OBJECT('type', 'string', 'default', 'all'),
        'branches', JSON_OBJECT('type', 'array', 'default', JSON_ARRAY()),
        'mergeStrategy', JSON_OBJECT('type', 'string', 'default', 'collect'),
        'outputVariable', JSON_OBJECT('type', 'string', 'default', 'output'),
        'errorHandling', JSON_OBJECT('type', 'string', 'default', 'fail-fast'),
        'timeout', JSON_OBJECT('type', 'number', 'default', 60)
      )
    )
  ),
  0,
  'system',
  'system'
);

-- 添加数据转换节点
INSERT INTO `plugin` (
  `plugin_id`, `plugin_name`, `plugin_type`, `plugin_type_name`, `description`, `icon`, `version`, `author`, `config`, `status`, `created_user`, `updated_user`
) VALUES (
  '9a8b7c6d-5e4f-3210-9876-543210fedcba',
  '数据转换节点',
  'transform',
  '数据转换',
  '支持字段映射、数据过滤、格式转换等数据转换操作',
  'swap',
  '1.0.0',
  'system',
  JSON_OBJECT(
    'nodeType', 'transform',
    'componentPath', './nodes/transform-node.vue',
    'nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'transformType', JSON_OBJECT('type', 'string', 'default', 'mapping'),
        'inputFormat', JSON_OBJECT('type', 'string', 'default', 'json'),
        'outputFormat', JSON_OBJECT('type', 'string', 'default', 'json'),
        'rules', JSON_OBJECT('type', 'array', 'default', JSON_ARRAY()),
        'outputVariable', JSON_OBJECT('type', 'string', 'default', 'output'),
        'errorHandling', JSON_OBJECT('type', 'string', 'default', 'skip'),
        'defaultValue', JSON_OBJECT('type', 'string', 'default', ''),
        'customScript', JSON_OBJECT('type', 'string', 'default', '')
      )
    )
  ),
  0,
  'system',
  'system'
);

-- 添加数据库操作节点
INSERT INTO `plugin` (
  `plugin_id`, `plugin_name`, `plugin_type`, `plugin_type_name`, `description`, `icon`, `version`, `author`, `config`, `status`, `created_user`, `updated_user`
) VALUES (
  '1f2e3d4c-5b6a-7988-9c0d-1e2f3a4b5c6d',
  '数据库操作节点',
  'database',
  '数据库操作',
  '支持数据库的增删改查操作和SQL执行',
  'database',
  '1.0.0',
  'system',
  JSON_OBJECT(
    'nodeType', 'database',
    'componentPath', './nodes/database-node.vue',
    'nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'operationType', JSON_OBJECT('type', 'string', 'default', 'select'),
        'dataSource', JSON_OBJECT('type', 'string', 'default', 'default'),
        'tableName', JSON_OBJECT('type', 'string', 'default', ''),
        'fields', JSON_OBJECT('type', 'array', 'default', JSON_ARRAY()),
        'conditions', JSON_OBJECT('type', 'array', 'default', JSON_ARRAY()),
        'sql', JSON_OBJECT('type', 'string', 'default', ''),
        'outputVariable', JSON_OBJECT('type', 'string', 'default', 'output'),
        'limit', JSON_OBJECT('type', 'number', 'default', 100),
        'orderBy', JSON_OBJECT('type', 'string', 'default', ''),
        'errorHandling', JSON_OBJECT('type', 'string', 'default', 'fail')
      )
    )
  ),
  0,
  'system',
  'system'
);

