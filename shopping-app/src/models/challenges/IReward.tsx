export default interface IReward {
  id: string;
  player_id: string;
  challenge_id: string;
  reward_amount: number;
  created_at: Date;
  updated_at: Date;
}
