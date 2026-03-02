import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseNodeExecutor } from './base-node-executor';
import { WorkflowContext } from '../workflow-context';
import { WorkflowNode, NodeExecutionResult, DatabaseNodeConfig } from '../workflow.types';
import { DatasourceService } from '@/modules/datasource/datasource.service';

/**
 * 数据库节点执行器
 * 支持项目默认数据库和外部数据源
 */
@Injectable()
export class DatabaseNodeExecutor extends BaseNodeExecutor {
  private readonly logger = new Logger(DatabaseNodeExecutor.name);

  constructor(
    private readonly datasourceService: DatasourceService,
  ) {
    super();
  }

  /**
   * 执行数据库节点
   */
  async execute(node: WorkflowNode, context: WorkflowContext): Promise<NodeExecutionResult> {
    const config = this.getNodeConfig<DatabaseNodeConfig>(node);
    const {
      operationType = 'select',
      tableName,
      fields = [],
      conditions = [],
      sql,
      orderBy,
      limit = 100,
      errorHandling = 'fail',
      outputs,
      dataSource: datasourceId = 'default',
    } = config;

    // 解析输入变量
    const resolvedInputs = this.resolveInputs(node, context);

    this.logNodeConfig(node, context, `操作=${operationType}, 表=${tableName || 'N/A'}, 数据源=${datasourceId}`);

    // 获取数据库连接
    const connection = await this.datasourceService.getConnection(datasourceId);

    return this.safeExecute(node, context, async () => {
      let queryResult: any;
      let affectedRows = 0;

      try {
        if (operationType === 'raw' && sql) {
          // 原生SQL模式
          const { resolvedSql, params } = this.resolveRawSql(sql, context, resolvedInputs);

          this.logger.log(`执行原生SQL: ${resolvedSql.substring(0, 200)}`);

          const result = await connection.query(resolvedSql, params);

          // 判断是查询还是修改操作
          if (Array.isArray(result)) {
            queryResult = result;
            affectedRows = result.length;
          } else {
            queryResult = result;
            affectedRows = result?.affectedRows ?? result?.changedRows ?? 0;
          }

          context.logExecution(
            node.id,
            node.type,
            `执行原生SQL完成: ${resolvedSql.substring(0, 100)}... | 影响行数: ${affectedRows}`,
            undefined,
            undefined,
            { sql: resolvedSql },
          );
        } else {
          // 构建操作
          const resolvedConditions = conditions.map((c) => ({
            ...c,
            value: context.replaceVariables(c.value || ''),
          }));

          const resolvedFields = fields.map((f) => ({
            ...f,
            value: f.value ? context.replaceVariables(f.value) : undefined,
          }));

          switch (operationType) {
            case 'select':
              ({ queryResult, affectedRows } = await this.executeSelect(
                connection,
                tableName,
                resolvedFields,
                resolvedConditions,
                orderBy,
                limit,
              ));
              break;

            case 'insert':
              ({ queryResult, affectedRows } = await this.executeInsert(
                connection,
                tableName,
                resolvedFields,
              ));
              break;

            case 'update':
              ({ queryResult, affectedRows } = await this.executeUpdate(
                connection,
                tableName,
                resolvedFields,
                resolvedConditions,
              ));
              break;

            case 'delete':
              ({ queryResult, affectedRows } = await this.executeDelete(
                connection,
                tableName,
                resolvedConditions,
              ));
              break;

            default:
              throw new Error(`不支持的操作类型: ${operationType}`);
          }

          context.logExecution(
            node.id,
            node.type,
            `数据库${operationType}操作完成: ${tableName} | 影响行数: ${affectedRows}`,
            undefined,
            undefined,
            {
              operationType,
              tableName,
              conditions: resolvedConditions,
              fields: resolvedFields,
            },
          );
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        this.logger.error(`数据库操作失败: ${errorMsg}`);

        if (errorHandling === 'continue') {
          context.logExecution(
            node.id,
            node.type,
            `数据库操作失败(已忽略): ${errorMsg}`,
            undefined,
            errorMsg,
          );

          const outputValues: Record<string, any> = {
            result: [],
            affectedRows: 0,
            error: errorMsg,
          };
          const nodeOutputs = this.buildOutputs(outputs, outputValues);
          return this.createResult('database', {
            operationType,
            tableName,
            result: [],
            affectedRows: 0,
            error: errorMsg,
            timestamp: new Date().toISOString(),
          }, nodeOutputs);
        }

        throw error;
      }

      // 构建输出
      const outputValues: Record<string, any> = {
        result: queryResult || [],
        affectedRows,
      };

      const nodeOutputs = this.buildOutputs(outputs, outputValues);

      return this.createResult('database', {
        operationType,
        tableName,
        result: queryResult,
        affectedRows,
        timestamp: new Date().toISOString(),
      }, nodeOutputs);
    });
  }

  /**
   * 执行 SELECT 查询
   */
  private async executeSelect(
    connection: DataSource,
    tableName: string,
    fields: Array<{ name: string; alias?: string; value?: string }>,
    conditions: Array<{ field: string; operator: string; value: string; logicalOperator?: string }>,
    orderBy?: string,
    limit?: number,
  ): Promise<{ queryResult: any[]; affectedRows: number }> {
    // 构建 SELECT 字段
    const selectFields = fields.length > 0
      ? fields.map((f) => f.alias ? `\`${f.name}\` AS \`${f.alias}\`` : `\`${f.name}\``).join(', ')
      : '*';

    let sql = `SELECT ${selectFields} FROM \`${tableName}\``;
    const params: any[] = [];

    // WHERE 子句
    const whereClause = this.buildWhereClause(conditions, params);
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    }

    // ORDER BY
    if (orderBy) {
      const orderByClean = orderBy.replace(/[^a-zA-Z0-9_,\s.`]/gi, '');
      sql += ` ORDER BY ${orderByClean}`;
    }

    // LIMIT
    if (limit && limit > 0) {
      sql += ` LIMIT ?`;
      params.push(limit);
    }

    this.logger.log(`执行 SELECT: ${sql}`);
    const queryResult = await connection.query(sql, params);

    return { queryResult, affectedRows: queryResult.length };
  }

  /**
   * 执行 INSERT 操作
   */
  private async executeInsert(
    connection: DataSource,
    tableName: string,
    fields: Array<{ name: string; alias?: string; value?: string }>,
  ): Promise<{ queryResult: any; affectedRows: number }> {
    if (fields.length === 0) {
      throw new Error('INSERT 操作至少需要一个字段');
    }

    const columns = fields.map((f) => `\`${f.name}\``).join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((f) => f.value ?? null);

    const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`;

    this.logger.log(`执行 INSERT: ${sql}`);
    const result = await connection.query(sql, values);

    return {
      queryResult: { insertId: result.insertId },
      affectedRows: result.affectedRows ?? 1,
    };
  }

  /**
   * 执行 UPDATE 操作
   */
  private async executeUpdate(
    connection: DataSource,
    tableName: string,
    fields: Array<{ name: string; alias?: string; value?: string }>,
    conditions: Array<{ field: string; operator: string; value: string; logicalOperator?: string }>,
  ): Promise<{ queryResult: any; affectedRows: number }> {
    if (fields.length === 0) {
      throw new Error('UPDATE 操作至少需要一个字段');
    }

    const params: any[] = [];
    const setClause = fields.map((f) => {
      params.push(f.value ?? null);
      return `\`${f.name}\` = ?`;
    }).join(', ');

    let sql = `UPDATE \`${tableName}\` SET ${setClause}`;

    const whereClause = this.buildWhereClause(conditions, params);
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    } else {
      throw new Error('UPDATE 操作必须包含 WHERE 条件，防止误更新全表');
    }

    this.logger.log(`执行 UPDATE: ${sql}`);
    const result = await connection.query(sql, params);

    return {
      queryResult: { changedRows: result.changedRows },
      affectedRows: result.affectedRows ?? 0,
    };
  }

  /**
   * 执行 DELETE 操作
   */
  private async executeDelete(
    connection: DataSource,
    tableName: string,
    conditions: Array<{ field: string; operator: string; value: string; logicalOperator?: string }>,
  ): Promise<{ queryResult: any; affectedRows: number }> {
    const params: any[] = [];

    let sql = `DELETE FROM \`${tableName}\``;

    const whereClause = this.buildWhereClause(conditions, params);
    if (whereClause) {
      sql += ` WHERE ${whereClause}`;
    } else {
      throw new Error('DELETE 操作必须包含 WHERE 条件，防止误删全表');
    }

    this.logger.log(`执行 DELETE: ${sql}`);
    const result = await connection.query(sql, params);

    return {
      queryResult: { affectedRows: result.affectedRows },
      affectedRows: result.affectedRows ?? 0,
    };
  }

  /**
   * 构建 WHERE 子句（使用参数化查询防止 SQL 注入）
   */
  private buildWhereClause(
    conditions: Array<{ field: string; operator: string; value: string; logicalOperator?: string }>,
    params: any[],
  ): string {
    if (!conditions || conditions.length === 0) {
      return '';
    }

    const clauses: string[] = [];

    for (let i = 0; i < conditions.length; i++) {
      const c = conditions[i];
      const field = `\`${c.field}\``;
      let clause = '';

      switch (c.operator) {
        case '=':
        case '==':
          clause = `${field} = ?`;
          params.push(c.value);
          break;
        case '!=':
        case '<>':
          clause = `${field} != ?`;
          params.push(c.value);
          break;
        case '>':
          clause = `${field} > ?`;
          params.push(c.value);
          break;
        case '>=':
          clause = `${field} >= ?`;
          params.push(c.value);
          break;
        case '<':
          clause = `${field} < ?`;
          params.push(c.value);
          break;
        case '<=':
          clause = `${field} <= ?`;
          params.push(c.value);
          break;
        case 'like':
        case 'LIKE':
          clause = `${field} LIKE ?`;
          params.push(`%${c.value}%`);
          break;
        case 'not like':
        case 'NOT LIKE':
          clause = `${field} NOT LIKE ?`;
          params.push(`%${c.value}%`);
          break;
        case 'in':
        case 'IN':
          const inValues = c.value.split(',').map((v) => v.trim());
          const placeholders = inValues.map(() => '?').join(', ');
          clause = `${field} IN (${placeholders})`;
          params.push(...inValues);
          break;
        case 'not in':
        case 'NOT IN':
          const notInValues = c.value.split(',').map((v) => v.trim());
          const notInPlaceholders = notInValues.map(() => '?').join(', ');
          clause = `${field} NOT IN (${notInPlaceholders})`;
          params.push(...notInValues);
          break;
        case 'is null':
        case 'IS NULL':
          clause = `${field} IS NULL`;
          break;
        case 'is not null':
        case 'IS NOT NULL':
          clause = `${field} IS NOT NULL`;
          break;
        case 'between':
        case 'BETWEEN':
          const [start, end] = c.value.split(',').map((v) => v.trim());
          clause = `${field} BETWEEN ? AND ?`;
          params.push(start, end);
          break;
        default:
          clause = `${field} = ?`;
          params.push(c.value);
      }

      if (i > 0) {
        const logOp = (c.logicalOperator || 'AND').toUpperCase();
        clauses.push(`${logOp} ${clause}`);
      } else {
        clauses.push(clause);
      }
    }

    return clauses.join(' ');
  }

  /**
   * 解析原生 SQL 中的变量引用
   * 支持 {{变量}} 语法替换为参数化查询的 ?
   */
  private resolveRawSql(
    sql: string,
    context: WorkflowContext,
    resolvedInputs: Record<string, any>,
  ): { resolvedSql: string; params: any[] } {
    const params: any[] = [];

    // 使用参数化查询替换 {{变量}} 为 ?
    const resolvedSql = sql.replace(/\{\{([^}]+)\}\}/g, (_match, variablePath) => {
      const trimmedPath = variablePath.trim();

      // 先从 resolvedInputs 中查找
      if (resolvedInputs[trimmedPath] !== undefined) {
        params.push(resolvedInputs[trimmedPath]);
        return '?';
      }

      // 再从 context 中查找
      const value = context.getVariableValue(trimmedPath);
      if (value !== undefined && value !== null) {
        params.push(value);
        return '?';
      }

      // 找不到变量，保持原样（会导致 SQL 错误，但不会注入）
      this.logger.warn(`SQL 中变量未找到: ${trimmedPath}`);
      params.push(null);
      return '?';
    });

    return { resolvedSql, params };
  }
}