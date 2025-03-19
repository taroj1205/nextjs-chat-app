export interface Channel {
  id: string;
  name: string;
  type: 'public' | 'private' | 'direct';
  description?: string;
  createdAt: string;
  lastMessageAt?: string;
  members?: string[]; // User IDs for direct or private channels
  unreadCount?: number; // For UI purposes
}
