export interface User {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'away';
  avatar?: string;
  lastSeen: string;
  isCurrentUser?: boolean; // To identify the current user
}
