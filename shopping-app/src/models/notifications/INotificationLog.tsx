export interface INotificationIntentionLog{
    id : string;
    id_notification_intention?: string;
    status: 'CREATED' | 'SEND' | 'READ' | 'ERROR';
}