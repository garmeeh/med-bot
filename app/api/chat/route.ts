import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { Redis } from '@upstash/redis'
import { auth } from '@clerk/nextjs'

import { nanoid } from '@/lib/utils'
import { System01Intake } from '@/prompts/system'

export const runtime = 'edge'

const redis = new Redis({
  url: process.env.UPSTASH_URL as string,
  token: process.env.UPSTASH_TOKEN as string
})

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const json = await req.json()
  const { messages } = json
  const { userId } = auth()

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const save = async (completion?: string) => {
    const title = json.messages[0].content.substring(0, 100)
    const id = json.id ?? nanoid()
    const createdAt = Date.now()
    const path = `/chat/${id}`
    const payload = {
      id,
      title,
      userId,
      createdAt,
      path,
      messages: [
        ...messages,
        ...(completion
          ? [
              {
                content: completion,
                role: 'assistant'
              }
            ]
          : [])
      ]
    }

    const pong = await redis.ping()
    console.log('pong', pong)
    try {
      await Promise.all([
        redis.hmset(`chat:${id}`, payload),
        redis.zadd(`user:chat:${userId}`, {
          score: createdAt,
          member: `chat:${id}`
        })
      ])
      console.log('all resolved')
    } catch (error) {
      console.error('error saving chat to redis', error)
    }
  }

  if (messages && messages.length === 13) {
    save()
    return new Response('', {
      status: 201
    })
  }

  const res = await openai.createChatCompletion({
    model: 'gpt-4-0613',
    messages: [
      {
        content: System01Intake,
        role: 'system'
      },
      ...messages
    ],
    temperature: 0,
    stream: true
  })

  if (!res.ok) {
    return new Response('Error', {
      status: 500
    })
  }

  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      save(completion)
    }
  })

  return new StreamingTextResponse(stream)
}
