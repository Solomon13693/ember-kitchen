declare module '@paystack/inline-js' {
  export type PaystackTransaction = {
    reference: string
    trans: string
    status: string
  }

  export type PaystackTransactionOptions = {
    key: string
    email: string
    amount?: number
    access_code?: string
    reference?: string
    onSuccess?: (transaction: PaystackTransaction) => void
    onCancel?: () => void
  }

  export default class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void
  }
}
