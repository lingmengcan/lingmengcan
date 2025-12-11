import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Plugin } from './plugin.entity';
import { PluginDto, PluginQueryDto } from './plugin.dto';

@Injectable()
export class PluginService {
  constructor(
    @InjectRepository(Plugin)
    private pluginRepository: Repository<Plugin>,
  ) {}

  /**
   * 获取插件列表
   */
  async findAll(query: PluginQueryDto) {
    const { pluginName, pluginType, page = 1, pageSize = 10 } = query;

    const queryBuilder = this.pluginRepository.createQueryBuilder('plugin');

    if (pluginName) {
      queryBuilder.andWhere('plugin.pluginName LIKE :pluginName', { pluginName: `%${pluginName}%` });
    }

    if (pluginType) {
      if (Array.isArray(pluginType)) {
        if (pluginType.length > 0) {
          queryBuilder.andWhere('plugin.pluginType IN (:...pluginType)', { pluginType });
        }
      } else {
        queryBuilder.andWhere('plugin.pluginType = :pluginType', { pluginType });
      }
    }

    const [list, total] = await queryBuilder
      .orderBy('plugin.pluginName', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  /**
   * 获取插件详情
   */
  async findOne(pluginId: string) {
    const plugin = await this.pluginRepository.findOne({ where: { pluginId } });

    if (!plugin) {
      throw new Error('插件不存在');
    }

    return plugin;
  }

  /**
   * 创建插件
   */
  async create(pluginDto: PluginDto, userName: string): Promise<Plugin> {
    const plugin = new Plugin();
    plugin.pluginId = pluginDto.pluginId || uuidv4();
    plugin.pluginName = pluginDto.pluginName;
    plugin.pluginType = pluginDto.pluginType;
    plugin.pluginTypeName = pluginDto.pluginTypeName;
    plugin.description = pluginDto.description || '';
    plugin.icon = pluginDto.icon || '';
    plugin.version = pluginDto.version || '1.0.0';
    plugin.author = pluginDto.author || '';
    plugin.config = pluginDto.config || '';
    plugin.status = pluginDto.status || 0;
    plugin.createdUser = userName || '';
    plugin.updatedUser = userName || '';

    return await this.pluginRepository.save(plugin);
  }

  /**
   * 更新插件
   */
  async update(pluginDto: PluginDto, userName: string): Promise<Plugin> {
    const { pluginId } = pluginDto;

    if (!pluginId) {
      throw new Error('插件ID不能为空');
    }

    const existPlugin = await this.pluginRepository.findOne({ where: { pluginId } });

    if (!existPlugin) {
      throw new Error('插件不存在');
    }

    // 确保状态是数字类型
    if (typeof pluginDto.status === 'string') {
      pluginDto.status = parseInt(pluginDto.status, 10);
    }

    pluginDto.updatedUser = userName || '';
    // 更新插件属性
    Object.assign(existPlugin, pluginDto);

    return await this.pluginRepository.save(existPlugin);
  }

  /**
   * 删除插件
   */
  async remove(pluginId: string) {
    const existPlugin = await this.pluginRepository.findOne({ where: { pluginId } });

    if (!existPlugin) {
      throw new Error('插件不存在');
    }

    const result = await this.pluginRepository.delete(pluginId);
    return result.affected > 0;
  }

  /**
   * 更新插件状态
   */
  async updateStatus(pluginId: string, status: string) {
    const existPlugin = await this.pluginRepository.findOne({ where: { pluginId } });

    if (!existPlugin) {
      throw new Error('插件不存在');
    }

    // 将字符串状态转换为数字
    const statusNumber = parseInt(status, 10);
    existPlugin.status = statusNumber;

    await this.pluginRepository.save(existPlugin);
    return true;
  }

  /**
   * 获取插件分类列表
   */
  async getCategories() {
    // 这里可以从数据库中查询，也可以直接返回固定的分类
    const categories = [
      { code: 'ai', name: 'AI 插件' },
      { code: 'rule', name: '规则插件' },
      { code: 'logic', name: '逻辑插件' },
      { code: 'common', name: '公共插件' },
      { code: 'http', name: 'HTTP 插件' },
      { code: 'custom', name: '自定义插件' },
    ];

    return categories;
  }
}
