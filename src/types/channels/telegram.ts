
export interface TelegramChannelCredentials extends Record<string, unknown> {
    botToken: string;
}


export interface TelegramChannelConfig extends Record<string, unknown> {
    chatId: string;
    threadId?: string;
}