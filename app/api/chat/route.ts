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
    console.log('start save')
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

    console.log('save payload to redis', payload)
    try {
      const hmsetResult = await redis.hmset(`chat:${id}`, payload)
      console.log('hmset result:', hmsetResult)
    } catch (error) {
      console.error('Error with hmset:', error)
    }

    try {
      const zaddResult = await redis.zadd(`user:chat:${userId}`, {
        score: createdAt,
        member: `chat:${id}`
      })
      console.log('zadd result:', zaddResult)
    } catch (error) {
      console.error('Error with zadd:', error)
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
      console.log('onCompletion')
      save(completion)
    }
  })

  return new StreamingTextResponse(stream)
}
