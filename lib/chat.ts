export type ChatMessageRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatMessageRole;
  content: string;
};

export const stockReply = "Bienvenido, ¿En qué te puedo ayudar?";
