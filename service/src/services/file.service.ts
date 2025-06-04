import { TextLoader } from 'langchain/document_loaders/fs/text';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Chroma } from '@langchain/community/vectorstores/chroma';
import { OpenAIEmbeddings } from '@langchain/openai';

import { v4 as uuidv4 } from 'uuid';
import { File } from '@/entities/file.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MessageService } from './message.service';
import { extname } from 'path';
import { ChatService } from './chat.service';
import { FileDto } from '@/dtos/file.dto';
import { LlmService } from './llm.service';
import { DocumentLoader } from '@langchain/core/document_loaders/base';

export class FileService {
  constructor(
    @InjectRepository(File)
    private repository: Repository<File>,
    private dataSource: DataSource,
    private configService: ConfigService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly llmService: LlmService,
  ) {}

  /**
   * 该函数用于重构向量存储。
   *
   * @param {string} fileId - 文件ID
   * @param {string} fileType - 文件类型
   * @param {string} filePath - 文件路径
   * @param {string} basePath - 基础路径
   * @param {string} openAIApiKey - OpenAI API密钥
   * @param {string} modelName - 模型名称
   * @returns {Promise<void>}
   */
  async refactorVectorStore(
    fileId: string,
    fileType: string,
    filePath: string,
    basePath: string,
    openAIApiKey: string,
    modelName: string,
  ) {
    let loader: DocumentLoader;

    // 根据文件类型选择合适的加载器
    switch (fileType) {
      case '.pdf':
        loader = new PDFLoader(filePath);
        break;
      case '.txt':
        loader = new TextLoader(filePath);
        break;
      case '.docx':
        loader = new DocxLoader(filePath);
        break;
      default:
        throw new Error(`Unknown file type: ${fileType}`);
    }

    // 文本切割,将文档拆分为块，这里要优化，不能只用中文符号切割
    const textSplitter = new RecursiveCharacterTextSplitter({
      // separators: ['\n\n', '\n', '。', '！', '？'],
      chunkSize: 400,
      chunkOverlap: 100,
    });

    // 加载文档并拆分
    const docs = await loader.load();

    const splitDocs = await textSplitter.splitDocuments(docs);

    const embeddings = modelName
      ? new OpenAIEmbeddings({ openAIApiKey, modelName }, { basePath })
      : new OpenAIEmbeddings({ openAIApiKey }, { basePath });

    // 加载向量存储库
    await Chroma.fromDocuments(splitDocs, embeddings, {
      collectionName: fileId,
      url: this.configService.get<string>('chromadb.db'),
    });
  }

  // 读取文档
  async chatfile(userName: string, dto: FileDto, file: Express.Multer.File) {
    // 获取模型信息
    const model = await this.llmService.findByModelName(dto.llm);

    const fileType = extname(file.filename);

    // 上传文件
    const fileId = await this.addFile(dto.conversationId, file.originalname, file.size, fileType, file.path, userName);

    await this.refactorVectorStore(
      fileId,
      fileType,
      file.path,
      model.baseUrl,
      model.apiKey,
      model.defaultEmbeddingModel,
    );

    return fileId;
  }

  /**
   * 新增文件
   *
   * @param conversationId 对话ID
   * @param fileName 文件名
   * @param fileSize 文件大小
   * @param fileType 文件类型
   * @param path 文件路径
   * @param username 用户名
   * @return 文件ID
   */
  async addFile(
    conversationId: string,
    fileName: string,
    fileSize: number,
    fileType: string,
    path: string,
    username: string,
  ) {
    const fileId = uuidv4();
    const entity = new File();
    entity.fileId = fileId;
    entity.conversationId = conversationId;
    entity.fileName = fileName;
    entity.fileSize = fileSize;
    entity.fileType = fileType;
    entity.path = path;
    entity.status = 0;
    entity.createdUser = username;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    this.repository.save(entity);
    return fileId;
  }
}
