
export default interface IChallenge {
  id: string;  // id que va en el qr
  name: string;
  description: string;
  reward: number;
  start: Date;
  end: Date;
  max_qty_day: number;
  period: 'UNIQUE' | 'DAILY' ;
  flow: 'AUTOSCAN' | 'AUTOPASS' | 'AUTOPASS-RESOLUTION' | 'SKY-COSTANERA' | 'SKY-COSTANERA-REFUND' | 'AUTOBAGS' | 'QR'
  created_at: Date;
  updated_at: Date;
}
