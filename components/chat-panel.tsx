import { type UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import { PromptForm } from '@/components/prompt-form'
import { ButtonScrollToBottom } from '@/components/button-scroll-to-bottom'
import { ListChecks } from '@phosphor-icons/react'
import { FooterText } from '@/components/footer'
import { cn } from '@/lib/utils'

export interface ChatPanelProps
  extends Pick<
    UseChatHelpers,
    'append' | 'isLoading' | 'messages' | 'input' | 'setInput'
  > {
  id?: string
  doneWithIntake: () => void
  hidden?: boolean
}

export function ChatPanel({
  id,
  isLoading,
  append,
  input,
  setInput,
  messages,
  doneWithIntake,
  hidden
}: ChatPanelProps) {
  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 bg-gradient-to-b from-muted/10 from-10% to-muted/30 to-50% transition delay-100 duration-500',
        hidden ? 'translate-y-full' : ''
      )}
    >
      <ButtonScrollToBottom />
      <div className="mx-auto sm:max-w-2xl sm:px-4">
        <div className="flex h-10 items-center justify-center">
          {messages?.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={() => doneWithIntake()}
                className="bg-background"
              >
                <ListChecks className="mr-2" />
                Complete Intake
              </Button>
            </>
          )}
        </div>
        <div className="space-y-4 border-t bg-background px-4 py-2 shadow-lg sm:rounded-t-xl sm:border md:py-4">
          <PromptForm
            onSubmit={async value => {
              await append({
                id,
                content: value,
                role: 'user'
              })
            }}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
          />
          <FooterText className="hidden sm:block" />
        </div>
      </div>
    </div>
  )
}
