import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate, HumanMessagePromptTemplate, SystemMessagePromptTemplate } from '@langchain/core/prompts';

export type Message = { role: 'system' | 'user' | 'assistant'; content: string };

export interface OpenAIParams {
  apiKey: string;
  baseUrl?: string;
  temperature?: number;
  topP?: number;
  maxTokens?: number;
}

export interface LLMResult {
  output: string;
  reasoning_content: string;
}

export class OpenAIClient {
  private readonly params: OpenAIParams;

  constructor(params: OpenAIParams) {
    this.params = params;
  }

  // Run an OpenAI-compatible chat completion and extract reasoning from <think> tags if present
  async chatWithReasoning(messages: Message[]): Promise<LLMResult> {
    const llm = new ChatOpenAI(
      {
        openAIApiKey: this.params.apiKey,
        temperature: this.params.temperature,
        topP: this.params.topP,
        maxTokens: this.params.maxTokens,
        streaming: true,
      },
      this.params.baseUrl ? { basePath: this.params.baseUrl } : undefined,
    );

    const prompt = ChatPromptTemplate.fromMessages(
      messages.map((m) => {
        if (m.role === 'system') return SystemMessagePromptTemplate.fromTemplate(m.content);
        if (m.role === 'user') return HumanMessagePromptTemplate.fromTemplate(m.content);
        // Assistant role is rarely used here; fallback to Human prompt
        return HumanMessagePromptTemplate.fromTemplate(m.content);
      }),
    );

    const chain = prompt.pipe(llm);

    let reasoning = '';
    let fullContent = '';
    let thinkTagComplete = false;

    for await (const chunk of await chain.stream({})) {
      const content =
        chunk && typeof chunk === 'object' && 'content' in (chunk as any) ? (chunk as any).content || '' : '';

      fullContent += content;

      // If we find <think>...</think>, extract reasoning once and remove it from visible content
      if (!thinkTagComplete) {
        const thinkMatch = fullContent.match(/<think>([\s\S]*?)<\/think>/);
        if (thinkMatch) {
          reasoning = thinkMatch[1].trim();
          thinkTagComplete = true;
          fullContent = fullContent.replace(/<think>[\s\S]*?<\/think>/g, '');
        }
      }
    }

    return {
      output: fullContent.trim(),
      reasoning_content: reasoning,
    };
  }
}
