import componentsLocale from 'tdesign-vue-next/es/locale/zh_CN';
import layout from './layout';
import views from './views';

export default {
  lang: '简体中文',
  layout,
  views,
  common: {
    confirm: '确定',
    cancel: '取消',
    ok: '确定',
    submit: '提交',
    add: '添加',
    edit: '编辑',
    delete: '删除',
    open: '开',
    close: '关',
    reset: '重置',
    save: '保存',
    query: '查询',
    info: '提示',
    alert: '警告',
    success: '成功',
    status: '状态',
    select: '请选择',
    enable: '启用',
    disable: '停用',
    upload: '上传文件',
    description: '描述',
    validationFailed: '验证不通过',
    deleteConfirm: '删除后无法恢复，是否继续删除？',
    operationSuccess: '操作成功',
    table: {
      actions: '操作',
    },
  },
  componentsLocale,
};
