/**
 * 工作流执行上下文
 * 管理工作流执行过程中的状态和数据
 */
export class WorkflowContext {
  private inputs: any;
  private variables: Record<string, any>;
  private nodeResults: Map<string, any>;
  private nodeOutputs: Map<string, Record<string, any>>; // nodeId -> { outputName: value }
  private executionLog: Array<{
    nodeId: string;
    nodeType: string;
    timestamp: string;
    message: string;
    result?: any;
    error?: string;
    [key: string]: any;
  }>;

  constructor(inputs: any, variables: Record<string, any> = {}) {
    this.inputs = inputs;
    this.variables = { ...variables };
    this.nodeResults = new Map();
    this.nodeOutputs = new Map();
    this.executionLog = [];
  }

  /**
   * 获取输入数据
   */
  getInputs(): any {
    return this.inputs;
  }

  /**
   * 获取变量值
   */
  getVariable(name: string): any {
    return this.variables[name];
  }

  /**
   * 设置变量值
   */
  setVariable(name: string, value: any): void {
    this.variables[name] = value;
  }

  /**
   * 获取所有变量
   */
  getVariables(): Record<string, any> {
    return { ...this.variables };
  }

  /**
   * 获取节点执行结果
   */
  getNodeResult(nodeId: string): any {
    return this.nodeResults.get(nodeId);
  }

  /**
   * 设置节点执行结果
   */
  setNodeResult(nodeId: string, result: any): void {
    this.nodeResults.set(nodeId, result);
  }

  /**
   * 获取所有节点结果
   */
  getNodeResults(): Map<string, any> {
    return new Map(this.nodeResults);
  }

  /**
   * 设置节点输出变量
   */
  setNodeOutput(nodeId: string, outputName: string, value: any): void {
    if (!this.nodeOutputs.has(nodeId)) {
      this.nodeOutputs.set(nodeId, {});
    }
    this.nodeOutputs.get(nodeId)![outputName] = value;
  }

  /**
   * 获取节点输出变量
   */
  getNodeOutput(nodeId: string, outputName: string): any {
    return this.nodeOutputs.get(nodeId)?.[outputName];
  }

  /**
   * 获取节点的所有输出
   */
  getNodeOutputs(nodeId: string): Record<string, any> | undefined {
    return this.nodeOutputs.get(nodeId);
  }

  /**
   * 记录执行日志
   */
  logExecution(
    nodeId: string,
    nodeType: string,
    message: string,
    result?: any,
    error?: string,
    additionalData?: Record<string, any>,
  ): void {
    this.executionLog.push({
      nodeId,
      nodeType,
      timestamp: new Date().toISOString(),
      message,
      result,
      error,
      ...additionalData,
    });
  }

  /**
   * 获取执行日志
   */
  getExecutionLog(): Array<any> {
    return [...this.executionLog];
  }

  /**
   * 获取变量值（支持多种来源）
   * 优先级: inputs > nodeOutputs > variables > nodeResults
   */
  getVariableValue(variable: string): any {
    // 支持 nodeId.variableName 格式
    if (variable.includes('.')) {
      const [nodeId, varName] = variable.split('.');
      const nodeOutput = this.getNodeOutput(nodeId, varName);
      if (nodeOutput !== undefined) {
        return nodeOutput;
      }
    }

    // 从输入中查找
    if (this.inputs && this.inputs[variable] !== undefined) {
      return this.inputs[variable];
    }
    
    // 从变量中查找
    if (this.variables[variable] !== undefined) {
      return this.variables[variable];
    }
    
    // 从节点结果中查找
    if (this.nodeResults.has(variable)) {
      return this.nodeResults.get(variable);
    }
    
    return undefined;
  }

  /**
   * 替换模板中的变量引用
   */
  replaceVariables(template: string): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, variablePath) => {
      const trimmedPath = variablePath.trim();

      // 处理嵌套属性访问
      if (trimmedPath.includes('.') || trimmedPath.includes('[')) {
        return this.getNestedVariableValue(trimmedPath);
      }

      // 处理简单变量
      const value = this.getVariableValue(trimmedPath);
      return value !== null && value !== undefined ? String(value) : match;
    });
  }

  /**
   * 获取嵌套变量值
   */
  private getNestedVariableValue(path: string): string {
    try {
      // 处理 nodeId.variableName.subProperty 格式
      const parts = path.split('.');
      
      // 首先尝试获取 nodeId.variableName 格式的值
      if (parts.length >= 2) {
        const nodeId = parts[0];
        const varName = parts[1];
        let current = this.getNodeOutput(nodeId, varName);
        
        if (current !== undefined) {
          // 继续处理剩余路径
          for (let i = 2; i < parts.length; i++) {
            const part = parts[i];
            // 处理数组索引 [n]
            const arrayMatch = part.match(/^([^\[]+)?\[(\d+)\]$/);
            if (arrayMatch) {
              const propName = arrayMatch[1];
              const index = parseInt(arrayMatch[2]);
              if (propName && current && typeof current === 'object') {
                current = current[propName];
              }
              if (Array.isArray(current)) {
                current = current[index];
              }
            } else if (current && typeof current === 'object') {
              current = current[part];
            } else {
              return '';
            }
          }
          return current !== null && current !== undefined ? String(current) : '';
        }
      }

      // 处理数组索引访问，如 variable[0]
      const arrayIndexMatch = path.match(/^([^[]+)\[(\d+)\]$/);
      if (arrayIndexMatch) {
        const [, variableName, index] = arrayIndexMatch;
        const arrayValue = this.getVariableValue(variableName);
        if (Array.isArray(arrayValue)) {
          return String(arrayValue[parseInt(index)] || '');
        }
        return '';
      }

      // 处理对象属性访问，如 variable.subProperty
      let current = this.getVariableValue(parts[0]);

      for (let i = 1; i < parts.length; i++) {
        if (current && typeof current === 'object') {
          current = current[parts[i]];
        } else {
          return '';
        }
      }

      return current !== null && current !== undefined ? String(current) : '';
    } catch (error) {
      return '';
    }
  }
}