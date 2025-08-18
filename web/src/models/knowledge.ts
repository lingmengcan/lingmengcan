// 知识库
export interface Knowledge {
  knowledgeId: string;
  knowledgeName: string;
  knowledgeType?: string;
  knowledgeTypeName: string;
  llm?: string;
  embeddingModel?: string;
  params: TextSplitterParams;
  status: string | number;
  description?: string;
  createdUser?: string;
  updatedUser?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Knowledge 文档分割参数
export interface TextSplitterParams {
  separators: string[];
  chunkSize: number;
  chunkOverlap: number;
  keepSeparator?: boolean;
}

// Knowledge列表对象
export interface KnowledgeList {
  list: Knowledge[];
  page: number;
  pageSize: number;
  count: number;
}

/**
 * 查询Knowledge对象
 */
export interface KnowledgeParams {
  knowledgeName: string;
  knowledgeType: string;
  page: number;
  pageSize: number;
}