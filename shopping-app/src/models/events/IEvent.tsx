export default interface IEvent {
  // used to persist in pouchdb
  _id?: string;

  id?: string;
  type: string;
  details: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
} 