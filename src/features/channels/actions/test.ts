'use server'

import { TelegramBroadcaster } from "../broadcasters/telegram";


export async function testTelegramChannel(botToken: string, chatId: string) {

  const config = { chatId };
  const credentials = { botToken };
  const telegramBroadcaster = new TelegramBroadcaster(config, credentials);
  const isConnected = await telegramBroadcaster.testConnection();
  return isConnected;
}