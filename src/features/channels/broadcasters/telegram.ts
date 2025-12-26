import { TelegramChannelConfig, TelegramChannelCredentials } from '@/types/channels/telegram';
import TelegramBot from 'node-telegram-bot-api';


export class TelegramBroadcaster {
  private bot: TelegramBot;
  private chatId: string; 

  constructor(config: TelegramChannelConfig, credentials: TelegramChannelCredentials) {
    this.bot = new TelegramBot(credentials.botToken, { polling: false });
    this.chatId = config.chatId;
    // this.userMappingService = new UserMappingService(); // TODO: implement user mapping if needed later
  }


  /**
   * Test bot connection with retry mechanism
   */
  async testConnection(): Promise<boolean> {
    try {
        await this.bot.getMe();
      return true;
    } catch (error) {
      console.error("Telegram connection test failed:", error);
      return false;
    }
  }


  /**
   * Send message to Telegram chat
   * @param message The message to send
   * @return Promise<void>
   */
   
  async sendMessage(message: string): Promise<unknown> {
    try {
      const res = await this.bot.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });

      return res
      
    } catch (error) {
      console.error("Failed to send Telegram message:", error);
      throw error;
    }
  } 
  
}