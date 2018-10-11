
export class ChatMessage {
  constructor(
    readonly text: string
  ) {
  }
}

export class WhisperChatMessage extends ChatMessage {
  constructor(
    readonly receiver: string,
    readonly text: string
  ) {
    super(text);
  }
}
