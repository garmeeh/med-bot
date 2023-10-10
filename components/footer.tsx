import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import { DisclaimerText } from './disclaimer-text'

export function FooterText({ className, ...props }: React.ComponentProps<'p'>) {
  const [disclaimerOpen, setDisclaimerOpen] = React.useState(false)
  return (
    <>
      <p
        className={cn(
          'px-2 text-center text-xs leading-normal text-muted-foreground',
          className
        )}
        {...props}
      >
        This app is for demonstration purposes only and NOT a medical device.{' '}
        <button
          onClick={() => {
            setDisclaimerOpen(true)
          }}
          className="underline"
        >
          [view full disclaimer]
        </button>
      </p>
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
