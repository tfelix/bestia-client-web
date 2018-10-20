
export type ChatMode = 'PUBLIC' | 'PARTY' | 'GUILD' | 'WHISPER' | 'SYSTEM';

export interface ChatMessage {
  time: number;
  text: string;
  mode: ChatMode;
  sender?: string;
}
