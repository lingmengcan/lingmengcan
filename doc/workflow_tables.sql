-- 工作流表
CREATE TABLE IF NOT EXISTS `workflow` (
  `workflow_id` varchar(36) NOT NULL COMMENT '工作流ID',
  `workflow_name` varchar(128) NOT NULL COMMENT '工作流名称',
  `description` varchar(512) DEFAULT '' COMMENT '工作流描述',
  `version` varchar(32) DEFAULT '1.0.0' COMMENT '版本号',
  `status` tinyint(1) DEFAULT 0 COMMENT '状态：0-草稿，1-已发布，2-已归档',
  `config` json DEFAULT NULL COMMENT '工作流配置',
  `created_user` varchar(32) NOT NULL COMMENT '创建用户',
  `updated_user` varchar(32) NOT NULL COMMENT '更新用户',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`workflow_id`),
  KEY `idx_workflow_name` (`workflow_name`),
  KEY `idx_workflow_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流表';

-- 工作流执行记录表
CREATE TABLE IF NOT EXISTS `workflow_execution` (
  `execution_id` varchar(36) NOT NULL COMMENT '执行ID',
  `workflow_id` varchar(36) NOT NULL COMMENT '工作流ID',
  `inputs` json DEFAULT NULL COMMENT '输入参数',
  `outputs` json DEFAULT NULL COMMENT '输出结果',
  `status` tinyint(1) DEFAULT 0 COMMENT '执行状态：0-运行中，1-成功，2-失败，3-已停止',
  `error_message` text DEFAULT NULL COMMENT '错误信息',
  `start_time` datetime NOT NULL COMMENT '开始时间',
  `end_time` datetime DEFAULT NULL COMMENT '结束时间',
  `duration` int DEFAULT NULL COMMENT '执行时长(秒)',
  `created_user` varchar(32) NOT NULL COMMENT '创建用户',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`execution_id`),
  KEY `idx_workflow_id` (`workflow_id`),
  KEY `idx_execution_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流执行记录表';

-- 工作流节点类型表
CREATE TABLE IF NOT EXISTS `workflow_node_type` (
  `node_type` varchar(32) NOT NULL COMMENT '节点类型',
  `node_name` varchar(64) NOT NULL COMMENT '节点名称',
  `category` varchar(32) NOT NULL COMMENT '分类',
  `icon` varchar(32) DEFAULT NULL COMMENT '图标',
  `description` varchar(255) DEFAULT NULL COMMENT '描述',
  `config_schema` json DEFAULT NULL COMMENT '配置模式',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`node_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='工作流节点类型表';

-- 初始化节点类型数据
INSERT INTO `workflow_node_type` (`node_type`, `node_name`, `category`, `icon`, `description`, `config_schema`) VALUES
('input', '输入节点', 'input-output', 'login', '接收外部输入数据', '{"type":"object","properties":{"inputType":{"type":"string","enum":["text","number","file"]},"required":{"type":"boolean"},"defaultValue":{"type":"string"}}}'),
('output', '输出节点', 'input-output', 'logout', '输出处理结果', '{"type":"object","properties":{"outputType":{"type":"string","enum":["text","json","file"]},"format":{"type":"string"}}}'),
('llm', 'LLM节点', 'ai-model', 'brain', '调用大语言模型进行文本处理', '{"type":"object","properties":{"model":{"type":"string"},"temperature":{"type":"number"},"maxTokens":{"type":"number"},"systemPrompt":{"type":"string"},"userPrompt":{"type":"string"}}}'),
('prompt', '提示词节点', 'ai-model', 'edit-1', '构建提示词模板', '{"type":"object","properties":{"template":{"type":"string"},"variables":{"type":"array","items":{"type":"object","properties":{"name":{"type":"string"},"type":{"type":"string"}}}}}}'),
('condition', '条件节点', 'logic-control', 'fork', '根据条件进行分支处理', '{"type":"object","properties":{"operator":{"type":"string","enum":["equals","notEquals","greaterThan","lessThan","contains"]},"value":{"type":"string"}}}'),
('http', 'HTTP请求', 'data-processing', 'internet', '发送HTTP请求获取数据', '{"type":"object","properties":{"method":{"type":"string","enum":["GET","POST","PUT","DELETE"]},"url":{"type":"string"},"headers":{"type":"object"},"body":{"type":"object"}}}');