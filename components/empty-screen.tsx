import { useState } from 'react'
import { UseChatHelpers } from 'ai/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ExternalLink } from '@/components/external-link'
import { DisclaimerText } from './disclaimer-text'
import { Button } from './ui/button'

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  return (
    <>
      <div className="mx-auto max-w-2xl px-4">
        <div className="rounded-lg border bg-background p-8">
          <h1 className="mb-2 text-lg font-semibold">Welcome to Medi Bot!</h1>
          <p className="mb-2 leading-normal text-muted-foreground"></p>
          <p className="mb-2 leading-normal text-muted-foreground">
            This app demos the current capabilities of the GPT-4 model in a
            medical setting. Completely open source and available on{' '}
            <ExternalLink href="https://github.com/garmeeh/med-bot">
              Github
            </ExternalLink>{' '}
            created by{' '}
            <ExternalLink href="https://twitter.com/garmeeh">Gary</ExternalLink>
            . It is based on some of the amazing work done by{' '}
            <ExternalLink href="https://www.linkedin.com/in/dave-shap-automator/">
              David Shapiro
            </ExternalLink>
            .
          </p>
          <p className="mb-4 leading-normal text-muted-foreground">
            It is intended to be a tool for medical professionals to help them
            during intake and during the diagnosis process.
          </p>
          <p className="mb-4 leading-normal text-muted-foreground">
            To get started enter a medical problem you are currently facing. For
            example: "I have a pain in my head that I keep waking up with each
            day. "
          </p>

          <p className="text-xs leading-normal text-muted-foreground">
            This is just for demo purposes -{' '}
            <button
              onClick={() => {
                setDisclaimerOpen(true)
              }}
              className="underline"
            >
              view full disclaimer
            </button>
          </p>
        </div>
      </div>
      <Dialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
        <DialogContent className="max-h-screen overflow-auto">
          <DialogHeader>
            <DialogTitle>Medical Device Disclaimer</DialogTitle>
            <DialogDescription>
              <DisclaimerText />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="items-center">
            <Button
              onClick={() => {
                setDisclaimerOpen(false)
              }}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
