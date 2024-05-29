export default interface ILocalContact {
  type: 'EMAIL' | 'PHONE' | 'WHATSAPP';
  value: string;
}