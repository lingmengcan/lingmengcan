<script lang="ts" setup>
import { ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { WorkflowVariable } from '@/models/workflow';

interface Props {
  modelValue: WorkflowVariable[];
}

// 移除未使用的接口定义

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [variables: WorkflowVariable[]];
}>();

const showAddDialog = ref(false);
const editingVariable = ref<WorkflowVariable | null>(null);

const variableForm = ref<{
  id: string;
  name: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  value: any;
  description?: string;
}>({
  id: '',
  name: '',
  type: 'string',
  value: '',
  description: '',
});

const variableTypes = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔值' },
  { value: 'json', label: 'JSON' },
];

const columns = [
  {
    colKey: 'name',
    title: '变量名',
    width: 150,
  },
  {
    colKey: 'type',
    title: '类型',
    width: 100,
    cell: (h: any, { row }: any) => {
      const type = variableTypes.find(t => t.value === row.type);
      return h('t-tag', { size: 'small' }, type?.label || row.type);
    },
  },
  {
    colKey: 'value',
    title: '默认值',
    width: 200,
    ellipsis: true,
    cell: (h: any, { row }: any) => {
      let displayValue = row.value;
      if (typeof row.value === 'object') {
        displayValue = JSON.stringify(row.value);
      }
      return h('span', displayValue);
    },
  },
  {
    colKey: 'description',
    title: '描述',
    ellipsis: true,
  },
  {
    colKey: 'operation',
    title: '操作',
    width: 120,
    align: 'center',
  },
];

// 添加变量
const addVariable = () => {
  variableForm.value = {
    id: '',
    name: '',
    type: 'string',
    value: '',
    description: '',
  };
  editingVariable.value = null;
  showAddDialog.value = true;
};

// 编辑变量
const editVariable = (variable: WorkflowVariable) => {
  variableForm.value = { ...variable };
  editingVariable.value = variable;
  showAddDialog.value = true;
};

// 删除变量
const deleteVariable = (variable: WorkflowVariable) => {
  const newVariables = props.modelValue.filter(v => v.id !== variable.id);
  emit('update:modelValue', newVariables);
  MessagePlugin.success('变量删除成功');
};

// 保存变量
const saveVariable = () => {
  if (!variableForm.value.name.trim()) {
    MessagePlugin.error('请输入变量名');
    return;
  }

  // 检查变量名是否重复
  const existingVariable = props.modelValue.find(
    v => v.name === variableForm.value.name && v.id !== variableForm.value.id
  );
  if (existingVariable) {
    MessagePlugin.error('变量名已存在');
    return;
  }

  let value = variableForm.value.value;
  
  // 根据类型转换值
  try {
    switch (variableForm.value.type) {
      case 'number':
        const numValue = Number(value);
        if (isNaN(numValue)) {
          MessagePlugin.error('数字类型的值格式不正确');
          return;
        }
        value = numValue;
        break;
      case 'boolean':
        value = String(value) === 'true';
        break;
      case 'json':
        if (typeof value === 'string') {
          value = JSON.parse(value);
        }
        break;
    }
  } catch (error) {
    MessagePlugin.error('值格式不正确');
    return;
  }

  const newVariable: WorkflowVariable = {
    ...variableForm.value,
    id: variableForm.value.id || `var_${Date.now()}`,
    value,
    description: variableForm.value.description || '',
  };

  let newVariables;
  if (editingVariable.value) {
    // 编辑模式
    newVariables = props.modelValue.map(v => 
      v.id === editingVariable.value!.id ? newVariable : v
    );
  } else {
    // 新增模式
    newVariables = [...props.modelValue, newVariable];
  }

  emit('update:modelValue', newVariables);
  showAddDialog.value = false;
  MessagePlugin.success(editingVariable.value ? '变量更新成功' : '变量添加成功');
};

// 获取值的显示格式
const getValueDisplay = (variable: WorkflowVariable) => {
  if (variable.type === 'json') {
    return JSON.stringify(variable.value, null, 2);
  }
  return String(variable.value);
};

// 设置值
const setVariableValue = (value: string) => {
  variableForm.value.value = value;
};
</script>

<template>
  <div class="workflow-variables p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">{{ $t('views.llm.app.workflow.variables') }}</h3>
      <t-button theme="primary" @click="addVariable">
        <template #icon>
          <t-icon name="add" />
        </template>
        添加变量
      </t-button>
    </div>

    <t-table
      :columns="columns"
      :data="modelValue"
      row-key="id"
      bordered
      hover
    >
      <template #operation="{ row }">
        <t-space size="small">
          <t-button
            size="small"
            theme="primary"
            @click="editVariable(row)"
          >
            编辑
          </t-button>
          <t-button
            size="small"
            theme="danger"
            @click="deleteVariable(row)"
          >
            删除
          </t-button>
        </t-space>
      </template>
    </t-table>

    <div v-if="modelValue.length === 0" class="text-center text-gray-500 py-8">
      <t-icon name="variable" size="48" class="mx-auto mb-4 opacity-50" />
      <p>暂无变量，点击上方按钮添加变量</p>
    </div>

    <!-- 添加/编辑变量对话框 -->
    <t-dialog
      v-model:visible="showAddDialog"
      :header="editingVariable ? '编辑变量' : '添加变量'"
      width="500px"
      :footer="false"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">变量名</label>
          <t-input
            v-model:value="variableForm.name"
            placeholder="请输入变量名（如：userName, maxRetries）"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">变量类型</label>
          <t-select
            v-model:value="variableForm.type"
            placeholder="请选择变量类型"
          >
            <t-option
              v-for="type in variableTypes"
              :key="type.value"
              :value="type.value"
              :label="type.label"
            />
          </t-select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">默认值</label>
          
          <!-- 字符串类型 -->
          <t-input
            v-if="variableForm.type === 'string'"
            :model-value="variableForm.value"
            @update:model-value="setVariableValue"
            placeholder="请输入字符串值"
          />
          
          <!-- 数字类型 -->
          <t-input-number
            v-else-if="variableForm.type === 'number'"
            :model-value="Number(variableForm.value) || 0"
            @update:model-value="setVariableValue"
            placeholder="请输入数字值"
          />
          
          <!-- 布尔类型 -->
          <t-select
            v-else-if="variableForm.type === 'boolean'"
            :model-value="String(variableForm.value)"
            @update:model-value="setVariableValue"
            placeholder="请选择布尔值"
          >
            <t-option value="true" label="true" />
            <t-option value="false" label="false" />
          </t-select>
          
          <!-- JSON类型 -->
          <t-textarea
            v-else
            :model-value="getValueDisplay({ ...variableForm, value: variableForm.value })"
            @update:model-value="setVariableValue"
            placeholder="请输入JSON格式数据，如：{key: value} 或 [1, 2, 3]"
            :autosize="{ minRows: 3, maxRows: 8 }"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">描述</label>
          <t-textarea
            v-model:value="variableForm.description"
            placeholder="请输入变量描述（可选）"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <t-button @click="showAddDialog = false">取消</t-button>
          <t-button theme="primary" @click="saveVariable">
            {{ editingVariable ? '更新' : '添加' }}
          </t-button>
        </div>
      </div>
    </t-dialog>
  </div>
</template>

<style scoped>
.workflow-variables .t-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>