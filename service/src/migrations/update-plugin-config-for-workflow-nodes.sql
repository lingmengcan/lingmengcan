-- 更新plugin表的config字段，添加工作流节点相关配置

-- 更新start节点
UPDATE `plugin` SET 
  `config` = JSON_SET(
    COALESCE(`config`, '{}'),
    '$.nodeType', 'start',
    '$.componentPath', './nodes/start-node.vue',
    '$.nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'inputType', JSON_OBJECT('type', 'string', 'default', 'text'),
        'required', JSON_OBJECT('type', 'boolean', 'default', true),
        'defaultValue', JSON_OBJECT('type', 'string', 'default', '')
      )
    )
  )
WHERE `plugin_type` = 'start';

-- 更新end节点
UPDATE `plugin` SET 
  `config` = JSON_SET(
    COALESCE(`config`, '{}'),
    '$.nodeType', 'end',
    '$.componentPath', './nodes/end-node.vue',
    '$.nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'outputType', JSON_OBJECT('type', 'string', 'default', 'text'),
        'format', JSON_OBJECT('type', 'string', 'default', 'json')
      )
    )
  )
WHERE `plugin_type` = 'end';

-- 更新llm节点
UPDATE `plugin` SET 
  `config` = JSON_SET(
    COALESCE(`config`, '{}'),
    '$.nodeType', 'llm',
    '$.componentPath', './nodes/llm-node.vue',
    '$.nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'model', JSON_OBJECT('type', 'string', 'default', ''),
        'temperature', JSON_OBJECT('type', 'number', 'default', 0.7),
        'maxTokens', JSON_OBJECT('type', 'number', 'default', 1000)
      )
    )
  )
WHERE `plugin_type` = 'llm';


-- 更新condition节点
UPDATE `plugin` SET 
  `config` = JSON_SET(
    COALESCE(`config`, '{}'),
    '$.nodeType', 'condition',
    '$.componentPath', './nodes/condition-node.vue',
    '$.nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'operator', JSON_OBJECT('type', 'string', 'default', 'equals'),
        'value', JSON_OBJECT('type', 'string', 'default', '')
      )
    )
  )
WHERE `plugin_type` = 'condition';

-- 更新http节点
UPDATE `plugin` SET 
  `config` = JSON_SET(
    COALESCE(`config`, '{}'),
    '$.nodeType', 'http',
    '$.componentPath', './nodes/http-node.vue',
    '$.nodeConfigSchema', JSON_OBJECT(
      'type', 'object',
      'properties', JSON_OBJECT(
        'method', JSON_OBJECT('type', 'string', 'default', 'GET'),
        'url', JSON_OBJECT('type', 'string', 'default', ''),
        'headers', JSON_OBJECT('type', 'object', 'default', JSON_OBJECT())
      )
    )
  )
WHERE `plugin_type` = 'http';

-- 示例：插入一个新的自定义工作流节点
-- INSERT INTO `plugin` (
--   `plugin_id`, `plugin_name`, `plugin_type`, `description`, `icon`, `config`
-- ) VALUES (
--   'custom-workflow-node-001',
--   '自定义工作流节点',
--   'custom',
--   '这是一个自定义的工作流节点示例',
--   'component',
--   JSON_OBJECT(
--     'nodeType', 'custom',
--     'componentPath', './nodes/custom-node.vue',
--     'nodeConfigSchema', JSON_OBJECT(
--       'type', 'object',
--       'properties', JSON_OBJECT(
--         'customField', JSON_OBJECT('type', 'string', 'default', '自定义值')
--       )
--     )
--   )
-- );
