export interface OutcomeError {
  code: string;
  message: string;
  data?: Record<string, unknown>;
}

export default interface IPaymentIntentionStatus {
  id: string;
  status: 'IN_PROGRESS' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  error?: OutcomeError
  start_at: Date;
  end_at: Date;
  elapsed_time: string;
  outcome?: Record<string, unknown>;
}