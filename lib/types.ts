import { type Message } from 'ai'

export interface Chat extends Record<string, any> {
  id: string
  title: string
  createdAt: Date
  userId: string
  path: string
  messages: Message[]
  sharePath?: string
  step: BOT_STEPS
}

export type ServerActionResult<Result> = Promise<
  | Result
  | {
      error: string
    }
>

export type BOT_STEPS =
  | 'INTAKE'
  | 'PREPARE_NOTES'
  | 'DIAGNOSIS'
  | 'CLINICAL'
  | 'REFERRAL'
