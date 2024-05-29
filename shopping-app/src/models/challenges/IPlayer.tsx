export default interface IPlayer {
  id: string;
  email: string;
  birth_date: string;
  document_number: string;
  stats: {
    total_rewards: number;
  }
  created_at: Date;
  updated_at: Date;
}
