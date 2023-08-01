export type MessageRoleType = 'user' | 'system' | 'assistant';

/**
 * 聊天消息错误对象
 */
export interface ChatMessageError {
  /**
   * 错误信息
   */
  message: string;
  /**
   * 错误状态码
   */
  status: number;
  /**
   * 错误类型
   * @enum ["TechFlow", "openai"]
   * @enumNames ["聊天机器人", "开放AI"]
   */
  type: 'TechFlow' | 'openai';
}

/**
 * @title ChatGPTMessage 聊天消息
 * @category Model
 */
export interface ChatMessage {
  /**
   * @title 角色
   * @description 消息发送者的角色
   * @enum {MessageRoleType} ChatGPTAgent
   */
  role: MessageRoleType;
  /**
   * @title 内容
   * @description 消息内容
   */
  content: string;
  /**
   * 其余生成项
   */
  choices?: string[];

  /**
   * 如果存在错误消息
   */
  error?: ChatMessageError;
}

export interface ChatContext {
  id: string;
  /**
   * @title 会话标题
   */
  title?: string;
  /**
   * @title 会话描述
   * @description 用户设置的会话描述
   * @type {string}
   */
  description?: string;
  /**
   * @title 消息列表
   * @description 聊天室中的所有消息
   * @type {ChatMessage[]}
   */
  messages: ChatMessage[];
  /**
   * 系统角色所对应的 id
   */
  agentId?: string;
  // 创建时间戳
  createAt: number;
  // 更新时间
  updateAt: number;
}

export type ChatContextMap = Record<string, Omit<ChatContext, 'systemRole'>>;
