<template>
  <div>
    <t-collapse v-model="activeNames" borderless class="compact-collapse">
      <!-- 基本配置 -->
      <t-collapse-panel value="basic">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">基本配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <t-form-item label="操作类型" class="compact-form-item">
            <t-select v-model="localConfig.operationType" size="small" @change="updateConfig">
              <t-option value="select" label="查询 (SELECT)" />
              <t-option value="insert" label="插入 (INSERT)" />
              <t-option value="update" label="更新 (UPDATE)" />
              <t-option value="delete" label="删除 (DELETE)" />
              <t-option value="execute" label="执行SQL" />
            </t-select>
          </t-form-item>

          <t-form-item label="数据源" class="compact-form-item">
            <t-select v-model="localConfig.dataSource" size="small" @change="updateConfig">
              <t-option value="default" label="默认数据源" />
              <t-option value="mysql" label="MySQL" />
              <t-option value="postgresql" label="PostgreSQL" />
              <t-option value="sqlite" label="SQLite" />
            </t-select>
          </t-form-item>

          <t-form-item label="表名" class="compact-form-item">
            <t-input v-model="localConfig.tableName" placeholder="例如: users" size="small" @change="updateConfig" />
          </t-form-item>
        </div>
      </t-collapse-panel>

      <!-- 字段配置 -->
      <t-collapse-panel v-if="localConfig.operationType !== 'execute'" value="fields">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">字段配置</span>
            </div>
            <t-button size="small" variant="outline" @click="addField">
              <t-icon name="add" class="mr-1" />
              添加字段
            </t-button>
          </div>
        </template>

        <div class="space-y-3">
          <div v-for="(field, index) in localConfig.fields" :key="`field-${index}`" class="flex items-center gap-2">
            <t-input v-model="field.name" :placeholder="`字段${index + 1}`" size="small" @change="updateConfig" />
            <t-input
              v-if="localConfig.operationType === 'select'"
              v-model="field.alias"
              placeholder="别名"
              size="small"
              @change="updateConfig"
            />
            <t-input
              v-if="['insert', 'update'].includes(localConfig.operationType)"
              v-model="field.value"
              placeholder="值"
              size="small"
              @change="updateConfig"
            />
            <t-button size="small" variant="text" @click="removeField(index)">
              <t-icon name="close" />
            </t-button>
          </div>

          <div v-if="localConfig.fields.length === 0" class="text-center text-gray-500 py-4">
            暂无字段，点击"添加字段"开始配置
          </div>
        </div>
      </t-collapse-panel>

      <!-- 条件配置 -->
      <t-collapse-panel v-if="['select', 'update', 'delete'].includes(localConfig.operationType)" value="conditions">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">条件配置</span>
            </div>
            <t-button size="small" variant="outline" @click="addCondition">
              <t-icon name="add" class="mr-1" />
              添加条件
            </t-button>
          </div>
        </template>

        <div class="space-y-3">
          <div
            v-for="(condition, index) in localConfig.conditions"
            :key="`condition-${index}`"
            class="border border-gray-200 rounded p-3"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">条件 {{ index + 1 }}</span>
              <div class="flex items-center gap-2">
                <t-switch v-model="condition.enabled" size="small" @change="updateConfig" />
                <t-button size="small" variant="text" @click="removeCondition(index)">
                  <t-icon name="close" />
                </t-button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <t-form-item label="字段名" class="compact-form-item">
                <t-input v-model="condition.field" placeholder="例如: id" size="small" @change="updateConfig" />
              </t-form-item>

              <t-form-item label="操作符" class="compact-form-item">
                <t-select v-model="condition.operator" size="small" @change="updateConfig">
                  <t-option value="=" label="等于" />
                  <t-option value="!=" label="不等于" />
                  <t-option value=">" label="大于" />
                  <t-option value="<" label="小于" />
                  <t-option value=">=" label="大于等于" />
                  <t-option value="<=" label="小于等于" />
                  <t-option value="LIKE" label="模糊匹配" />
                  <t-option value="IN" label="包含" />
                  <t-option value="NOT IN" label="不包含" />
                </t-select>
              </t-form-item>

              <t-form-item label="值" class="compact-form-item">
                <t-input
                  v-model="condition.value"
                  placeholder="例如: {{input.id}}"
                  size="small"
                  @change="updateConfig"
                />
              </t-form-item>

              <t-form-item label="逻辑" class="compact-form-item">
                <t-select v-model="condition.logic" size="small" @change="updateConfig">
                  <t-option value="AND" label="AND" />
                  <t-option value="OR" label="OR" />
                </t-select>
              </t-form-item>
            </div>
          </div>

          <div v-if="localConfig.conditions.length === 0" class="text-center text-gray-500 py-4">
            暂无条件，点击"添加条件"开始配置
          </div>
        </div>
      </t-collapse-panel>

      <!-- SQL配置 -->
      <t-collapse-panel v-if="localConfig.operationType === 'execute'" value="sql">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">SQL配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <t-form-item label="SQL语句" class="compact-form-item">
            <t-textarea
              v-model="localConfig.sql"
              placeholder="SELECT * FROM users WHERE id = {{input.id}}"
              size="small"
              :autosize="{ minRows: 4, maxRows: 8 }"
              @change="updateConfig"
            />
            <div class="text-xs text-gray-500 mt-1">支持变量插值，使用 {{ input.变量名 }} 格式</div>
          </t-form-item>
        </div>
      </t-collapse-panel>

      <!-- 输出配置 -->
      <t-collapse-panel value="output">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex items-center gap-2">
              <span class="font-medium text-gray-700">输出配置</span>
            </div>
          </div>
        </template>

        <div class="space-y-3">
          <t-form-item label="输出变量名" class="compact-form-item">
            <t-input v-model="localConfig.outputVariable" placeholder="output" size="small" @change="updateConfig" />
          </t-form-item>

          <t-form-item label="限制条数" class="compact-form-item">
            <t-input-number v-model="localConfig.limit" :min="1" :max="10000" size="small" @change="updateConfig" />
          </t-form-item>

          <t-form-item label="排序字段" class="compact-form-item">
            <t-input v-model="localConfig.orderBy" placeholder="例如: id DESC" size="small" @change="updateConfig" />
          </t-form-item>

          <t-form-item label="错误处理" class="compact-form-item">
            <t-select v-model="localConfig.errorHandling" size="small" @change="updateConfig">
              <t-option value="fail" label="失败停止" />
              <t-option value="skip" label="跳过错误" />
              <t-option value="default" label="返回默认值" />
            </t-select>
          </t-form-item>
        </div>
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, reactive, nextTick } from 'vue';

  interface Field {
    name: string;
    alias?: string;
    value?: string;
  }

  interface Condition {
    field: string;
    operator: string;
    value: string;
    logic: 'AND' | 'OR';
    enabled: boolean;
  }

  interface NodeData {
    label: string;
    config: Record<string, any>;
  }

  const props = defineProps<{
    node: any;
  }>();

  const emit = defineEmits<{
    'update-node': [data: NodeData];
  }>();

  // 折叠面板激活状态
  const activeNames = ref(['basic', 'fields', 'conditions', 'output']);

  // 标记是否正在更新配置，避免循环更新
  const isUpdating = ref(false);

  // 本地配置副本
  const localConfig = reactive({
    label: props.node?.data?.label || '数据库节点',
    operationType: props.node?.data?.config?.operationType || 'select',
    dataSource: props.node?.data?.config?.dataSource || 'default',
    tableName: props.node?.data?.config?.tableName || '',
    fields: props.node?.data?.config?.fields || [],
    conditions: props.node?.data?.config?.conditions || [],
    sql: props.node?.data?.config?.sql || '',
    outputVariable: props.node?.data?.config?.outputVariable || 'output',
    limit: props.node?.data?.config?.limit || 100,
    orderBy: props.node?.data?.config?.orderBy || '',
    errorHandling: props.node?.data?.config?.errorHandling || 'fail',
  });

  // 监听外部数据变化
  watch(
    () => props.node,
    (newNode, oldNode) => {
      if (isUpdating.value) {
        return;
      }

      if (newNode && newNode.id !== oldNode?.id) {
        Object.assign(localConfig, {
          label: newNode.data?.label || '数据库节点',
          operationType: newNode.data?.config?.operationType || 'select',
          dataSource: newNode.data?.config?.dataSource || 'default',
          tableName: newNode.data?.config?.tableName || '',
          fields: newNode.data?.config?.fields || [],
          conditions: newNode.data?.config?.conditions || [],
          sql: newNode.data?.config?.sql || '',
          outputVariable: newNode.data?.config?.outputVariable || 'output',
          limit: newNode.data?.config?.limit || 100,
          orderBy: newNode.data?.config?.orderBy || '',
          errorHandling: newNode.data?.config?.errorHandling || 'fail',
        });
      }
    },
    { deep: true },
  );

  // 添加字段
  const addField = () => {
    const field: Field = { name: '' };
    if (localConfig.operationType === 'select') {
      field.alias = '';
    } else if (['insert', 'update'].includes(localConfig.operationType)) {
      field.value = '';
    }
    localConfig.fields.push(field);
    updateConfig();
  };

  // 删除字段
  const removeField = (index: number) => {
    localConfig.fields.splice(index, 1);
    updateConfig();
  };

  // 添加条件
  const addCondition = () => {
    localConfig.conditions.push({
      field: '',
      operator: '=',
      value: '',
      logic: 'AND',
      enabled: true,
    });
    updateConfig();
  };

  // 删除条件
  const removeCondition = (index: number) => {
    localConfig.conditions.splice(index, 1);
    updateConfig();
  };

  // 更新配置
  const updateConfig = () => {
    isUpdating.value = true;

    emit('update-node', {
      label: localConfig.label,
      config: {
        operationType: localConfig.operationType,
        dataSource: localConfig.dataSource,
        tableName: localConfig.tableName,
        fields: localConfig.fields,
        conditions: localConfig.conditions,
        sql: localConfig.sql,
        outputVariable: localConfig.outputVariable,
        limit: localConfig.limit,
        orderBy: localConfig.orderBy,
        errorHandling: localConfig.errorHandling,
      },
    });

    nextTick(() => {
      setTimeout(() => {
        isUpdating.value = false;
      }, 100);
    });
  };
</script>

<style scoped>
  .compact-collapse :deep(.t-collapse-panel) {
    border-bottom: 1px solid #e7e7e7;
    padding: 8px;
  }

  .compact-collapse :deep(.t-collapse-panel__header) {
    padding: 2px 0px;
  }

  .compact-collapse :deep(.t-collapse-panel__content) {
    padding: 8px;
  }

  .compact-form-item {
    margin: 0px;
  }

  .compact-form-item :deep(.t-form__label) {
    color: #999;
    font-size: 12px;
  }
</style>
