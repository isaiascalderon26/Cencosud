export interface INotification {
  id: string,
  user_id: string,
  title: string,
  body: string,
  read: boolean,
  created_at: Date,
  updated_at: Date,
  metadata?: Record<string, string>
}
