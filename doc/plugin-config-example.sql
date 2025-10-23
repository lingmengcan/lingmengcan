-- 插件配置示例
-- 展示如何配置工作流节点的动态配置

-- Start 节点配置示例
INSERT INTO `plugin` (
  `plugin_id`,
  `plugin_name`,
  `plugin_type`,
  `plugin_type_name`,
  `description`,
  `icon`,
  `version`,
  `author`,
  `config`,
  `status`,
  `created_user`,
  `updated_user`
) VALUES (
  'start-node-plugin',
  '开始节点',
  'start',
  '开始',
  '工作流的开始节点，定义输入变量',
  'play-circle',
  '1.0.0',
  'system',
  '{
    "nodeType": "start",
    "componentPath": "components/nodes/start-node.vue",
    "nodeConfigSchema": [
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
          }
        ],
        "defaultItem": {
          "name": "input",
          "type": "text"
        }
      }
    ]
  }',
  0,
  'admin',
  'admin'
);

-- LLM 节点配置示例
INSERT INTO `plugin` (
  `plugin_id`,
  `plugin_name`,
  `plugin_type`,
  `plugin_type_name`,
  `description`,
  `icon`,
  `version`,
  `author`,
  `config`,
  `status`,
  `created_user`,
  `updated_user`
) VALUES (
  'llm-node-plugin',
  'LLM节点',
  'llm',
  'LLM',
  '调用大语言模型进行推理',
  'chat',
  '1.0.0',
  'system',
  '{
    "nodeType": "llm",
    "componentPath": "components/nodes/llm-node.vue",
    "nodeConfigSchema": [
      {
        "key": "model",
        "label": "模型",
        "type": "simple",
        "fieldType": "select",
        "dictType": "MODEL_TYPE"
      },
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
      },
      {
        "key": "systemPrompt",
        "label": "系统提示词",
        "type": "simple",
        "fieldType": "textarea",
        "placeholder": "系统提示词，可以使用{{变量名}}、{{变量名.子变量名}}、{{变量名[数组索引]}}的方式引用输入参数中的变量",
        "autosize": {
          "minRows": 4,
          "maxRows": 8
        }
      },
      {
        "key": "userPrompt",
        "label": "用户提示词",
        "type": "simple",
        "fieldType": "textarea",
        "placeholder": "用户提示词，可以使用{{变量名}}、{{变量名.子变量名}}、{{变量名[数组索引]}}的方式引用输入参数中的变量",
        "autosize": {
          "minRows": 4,
          "maxRows": 8
        }
      },
      {
        "key": "outputs",
        "label": "输出变量",
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
          }
        ],
        "defaultItem": {
          "name": "output",
          "type": "text"
        }
      }
    ]
  }',
  0,
  'admin',
  'admin'
);

-- End 节点配置示例
INSERT INTO `plugin` (
  `plugin_id`,
  `plugin_name`,
  `plugin_type`,
  `plugin_type_name`,
  `description`,
  `icon`,
  `version`,
  `author`,
  `config`,
  `status`,
  `created_user`,
  `updated_user`
) VALUES (
  'end-node-plugin',
  '结束节点',
  'end',
  '结束',
  '工作流的结束节点，定义输出变量',
  'check-circle',
  '1.0.0',
  'system',
  '{
    "nodeType": "end",
    "componentPath": "components/nodes/end-node.vue",
    "nodeConfigSchema": [
      {
        "key": "outputs",
        "label": "输出变量",
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
          "name": "output",
          "type": "json",
          "source": ""
        },
        "sourceType": "output"
      }
    ]
  }',
  0,
  'admin',
  'admin'
);

-- HTTP 节点配置示例
INSERT INTO `plugin` (
  `plugin_id`,
  `plugin_name`,
  `plugin_type`,
  `plugin_type_name`,
  `description`,
  `icon`,
  `version`,
  `author`,
  `config`,
  `status`,
  `created_user`,
  `updated_user`
) VALUES (
  'http-node-plugin',
  'HTTP请求',
  'http',
  'HTTP',
  '发送HTTP请求',
  'internet',
  '1.0.0',
  'system',
  '{
    "nodeType": "http",
    "componentPath": "components/nodes/http-node.vue",
    "nodeConfigSchema": [
      {
        "key": "method",
        "label": "请求方法",
        "type": "simple",
        "fieldType": "select",
        "dictType": "HTTP_METHOD"
      },
      {
        "key": "url",
        "label": "请求URL",
        "type": "simple",
        "fieldType": "input",
        "placeholder": "https://api.example.com/endpoint"
      },
      {
        "key": "headers",
        "label": "请求头",
        "type": "array",
        "fields": [
          {
            "key": "key",
            "label": "键",
            "type": "input",
            "placeholder": "Header名称",
            "style": "flex: 1"
          },
          {
            "key": "value",
            "label": "值",
            "type": "input",
            "placeholder": "Header值",
            "style": "flex: 1"
          }
        ],
        "defaultItem": {
          "key": "",
          "value": ""
        }
      },
      {
        "key": "body",
        "label": "请求体",
        "type": "simple",
        "fieldType": "textarea",
        "placeholder": "JSON格式的请求体",
        "autosize": {
          "minRows": 4,
          "maxRows": 8
        }
      },
      {
        "key": "outputs",
        "label": "输出变量",
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
          }
        ],
        "defaultItem": {
          "name": "response",
          "type": "json"
        }
      }
    ]
  }',
  0,
  'admin',
  'admin'
);
