import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { Redis } from '@upstash/redis'
import { auth } from '@clerk/nextjs'

import { nanoid } from '@/lib/utils'
import {
  System02PrepareNotes,
  System03Diagnosis,
  System04Clinical,
  System05Referrals
} from '@/prompts/system'
import { BOT_STEPS } from '@/lib/types'

export const runtime = 'edge'

const redis = new Redis({
  url: process.env.UPSTASH_URL as string,
  token: process.env.UPSTASH_TOKEN as string
})

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

interface Message {
  id: string
  role: string
  content: string
}

type PayloadType = {
  id: string
  title: string
  userId: string
  createdAt: number
  path: string
  step: string
  messages: Message[]
  notes?: string
}

const convertMessagesToTextBlock = (messages: Message[]): string => {
  return messages.reduce((acc, message) => {
    const prefix = message.role === 'user' ? 'PATIENT: ' : 'INTAKE: '
    return acc
      ? `${acc}\n\n${prefix}${message.content}`
      : `${prefix}${message.content}`
  }, '')
}

export async function POST(req: Request) {
  const json = await req.json()
  const {
    messages,
    id,
    step
  }: {
    messages: any
    id: string
    step: BOT_STEPS
  } = json
  const { userId } = auth()

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  if (!step) {
    return new Response('Missing step', {
      status: 400
    })
  }

  let systemPrompt
  let prompt
  switch (step) {
    case 'PREPARE_NOTES':
      systemPrompt = System02PrepareNotes
      const intakeChatMessage = convertMessagesToTextBlock(messages)
      const intakeChatLog = `<<BEGIN PATIENT INTAKE CHAT>>\n\n${intakeChatMessage}\n\n<<END PATIENT INTAKE CHAT>>`
      prompt = intakeChatLog
      break
    case 'DIAGNOSIS':
      systemPrompt = System03Diagnosis
      prompt = messages.filter(
        (message: Message) => message.id === 'PREPARE_NOTES'
      )[0].content
      break
    case 'CLINICAL':
      systemPrompt = System04Clinical
      prompt = messages.filter(
        (message: Message) => message.id === 'PREPARE_NOTES'
      )[0].content
      break
    case 'REFERRAL':
      systemPrompt = System05Referrals
      prompt = messages.filter(
        (message: Message) => message.id === 'PREPARE_NOTES'
      )[0].content
      break
    default:
      systemPrompt = System02PrepareNotes
      prompt = ''
  }

  // gpt-4-0613
  // gpt-3.5-turbo
  const res = await openai.createChatCompletion({
    model: 'gpt-4-0613',
    messages: [
      {
        content: systemPrompt,
        role: 'system'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0,
    stream: true
  })

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = json.messages[0].content.substring(0, 100)
      const id = json.id ?? nanoid()
      const createdAt = Date.now()
      const path = `/chat/${id}`
      let payload: PayloadType = {
        id,
        title,
        userId,
        createdAt,
        path,
        step,
        messages: [
          ...messages,
          {
            id: step,
            content: completion,
            role: 'assistant'
          }
        ]
      }
      await redis.hmset(`chat:${id}`, payload)
      await redis.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
    }
  })

  return new StreamingTextResponse(stream)
}
