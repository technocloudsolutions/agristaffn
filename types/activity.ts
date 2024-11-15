export interface ActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  action: 'create' | 'update' | 'delete';
  resourceType: 'contact' | 'department' | 'institute' | 'unit' | 'user';
  resourceId: string;
  details: string;
  timestamp: Date;
} 