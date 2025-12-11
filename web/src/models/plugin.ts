/**
 * 插件对象
 */
export interface Plugin {
  /**
   * 插件ID
   */
  pluginId?: string;

  /**
   * 插件名称
   */
  pluginName: string;

  /**
   * 插件类型
   */
  pluginType?: string;

  /**
   * 插件类型名称
   */
  pluginTypeName?: string;

  /**
   * 插件描述
   */
  description?: string;

  /**
   * 图标
   */
  icon?: string;

  /**
   * 版本
   */
  version?: string;

  /**
   * 作者
   */
  author?: string;

  /**
   * 配置
   */
  config?: string;

  /**
   * 状态（-1 deleted, 0 normal, 1 deactivated）
   */
  status?: number;

  /**
   * 创建人
   */
  createdUser?: string;

  /**
   * 更新人
   */
  updatedUser?: string;

  /**
   * 创建时间
   */
  createdAt?: string;

  /**
   * 更新时间
   */
  updatedAt?: string;
}
