'use client'

import { useChat, type Message, useCompletion } from 'ai/react'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { EmptyScreen } from '@/components/empty-screen'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { useLocalStorage } from '@/lib/hooks/use-local-storage'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { usePathname, useRouter } from 'next/navigation'
import { BOT_STEPS } from '@/lib/types'
import { DisclaimerText } from './disclaimer-text'
import { Button } from './ui/button'
import Image from 'next/image'
import { useAuth } from '@clerk/nextjs'

const BOT_STEP_ORDER: BOT_STEPS[] = [
  'INTAKE',
  'PREPARE_NOTES',
  'DIAGNOSIS',
  'CLINICAL',
  'REFERRAL'
]

export interface ChatProps extends React.ComponentProps<'div'> {
  initialMessages?: Message[]
  id?: string
  step?: BOT_STEPS
}

export function Chat({
  id,
  initialMessages,
  step = 'INTAKE',
  className
}: ChatProps) {
  const { userId } = useAuth()
  const [currentStep, setCurrentStep] = useState<BOT_STEPS>(step)
  const [medicalResponses, setMedicalResponses] = useState<Message[]>([])
  const [loadDialog, setLoadDialog] = useState(false)
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useLocalStorage<boolean>(
    'has-seen-disclaimer',
    false
  )

  const router = useRouter()
  const path = usePathname()
  const { messages, append, isLoading, input, setInput } = useChat({
    initialMessages,
    id,
    body: {
      id
    },
    onResponse(response) {
      if (response.status === 401) {
        toast.error('Please login to continue')
      }
      if (response.status === 201) {
        goToNextStep()
      }
    },
    onError() {
      if (!userId) {
        return null
      }
      toast.error('An error occurred. Please try again later.')
    },
    onFinish() {
      if (!path.includes('chat')) {
        router.push(`/chat/${id}`, { shallow: true })
        router.refresh()
      }
    }
  })

  const { complete, completion } = useCompletion({
    api: '/api/med-bot',
    onResponse: res => {
      // trigger something when the response starts streaming in
      // e.g. if the user is rate limited, you can show a toast
      if (res.status === 429) {
        toast.error('You are being rate limited. Please try again later.')
      }
    },
    onFinish: () => {
      goToNextStep()
    }
  })

  const goToNextStep = () => {
    const currentIndex = BOT_STEP_ORDER.indexOf(currentStep)
    if (currentIndex >= 0 && currentIndex < BOT_STEP_ORDER.length - 1) {
      const nextStep = BOT_STEP_ORDER[currentIndex + 1]
      setCurrentStep(nextStep)
    }
  }

  useEffect(() => {
    if (currentStep === step || currentStep === 'INTAKE') {
      return
    }

    complete('', {
      body: {
        step: currentStep,
        id,
        messages: [...messages, ...medicalResponses]
      }
    })
  }, [currentStep])

  useEffect(() => {
    if (currentStep === 'INTAKE') {
      return
    }

    if (!completion) {
      return
    }

    const newMedicalResponse: Message = {
      id: currentStep,
      role: 'assistant',
      content: completion
    }

    // Search for an existing medical response with the same ID (step)
    const existingIndex = medicalResponses.findIndex(m => m.id === currentStep)

    if (existingIndex !== -1) {
      // Update existing medical response
      setMedicalResponses(prev => {
        const updated = [...prev]
        updated[existingIndex] = newMedicalResponse
        return updated
      })
    } else {
      // Add new medical response
      setMedicalResponses(prev => [...prev, newMedicalResponse])
    }
  }, [completion, currentStep])

  useEffect(() => {
    setLoadDialog(true)
  }, [])

  return (
    <>
      <div className={cn('pb-[200px] pt-4 md:pt-10', className)}>
        {messages.length ? (
          <div>
            <ChatList messages={[...messages, ...medicalResponses]} />
            <ChatScrollAnchor trackVisibility={isLoading} />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <EmptyScreen setInput={setInput} />
            </div>
            <Image
              src="/med-bot.png"
              alt="Medi Bot"
              width={293}
              height={357}
              className="mx-auto"
            />
          </>
        )}
      </div>
      <ChatPanel
        id={id}
        isLoading={isLoading}
        append={append}
        messages={messages}
        input={input}
        setInput={setInput}
        doneWithIntake={() => {
          goToNextStep()
        }}
        hidden={currentStep !== 'INTAKE'}
      />

      {loadDialog ? (
        <Dialog
          open={!hasSeenDisclaimer}
          onOpenChange={() => {
            setHasSeenDisclaimer(true)
          }}
        >
          <DialogContent className="max-h-screen overflow-auto pb-32 md:pb-0">
            <DialogHeader>
              <DialogTitle>Medical Device Disclaimer</DialogTitle>
              <DialogDescription>
                <DisclaimerText />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="items-center">
              <Button
                onClick={() => {
                  setHasSeenDisclaimer(true)
                }}
              >
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  )
}
