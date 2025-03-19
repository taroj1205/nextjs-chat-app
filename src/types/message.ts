export interface Message {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  channelId: string; // This could be a channel ID or a user ID for direct messages
  timestamp: string;
  status?: 'sent' | 'delivered' | 'seen' | 'error';
  isLocal?: boolean; // For messages that are only stored locally
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: number;
  }[];
}
