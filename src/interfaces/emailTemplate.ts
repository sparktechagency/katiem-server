export type ICreateAccount = {
  name: string
  email: string
  otp: string
}

export type IResetPassword = {
  name: string
  email: string
  otp: string
}

export type IEmailOrPhoneVerification = {
  name: string
  email?: string
  phone?: string
  type: 'createAccount' | 'resetPassword'
}

export type IPaymentFailed = {
  name: string
  email: string
  amount: string | number
  packageType: string
}