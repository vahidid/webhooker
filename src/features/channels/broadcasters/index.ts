import { ChannelType } from "@/generated/prisma/enums";
import { TelegramBroadcaster } from "./telegram";
import { TelegramChannelConfig, TelegramChannelCredentials } from "@/types/channels/telegram";



export interface Broadcaster{
    testConnection: () => Promise<boolean>;
    sendMessage: (message: string) => Promise<unknown>;
}

export function getBroadcasterInstance(channelType: string, config: Record<string, unknown>, credentials?: Record<string, unknown>): Broadcaster | null {
    switch(channelType){
        case ChannelType.TELEGRAM:
            return new TelegramBroadcaster(config as TelegramChannelConfig, credentials as TelegramChannelCredentials);
        // Add other broadcasters here
        default:
            console.error(`Unsupported channel type: ${channelType}`);
            return null;
    }
}