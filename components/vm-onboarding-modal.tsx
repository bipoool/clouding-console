"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Copy, Check, Terminal } from "lucide-react"

interface VMOnboardingModalProps {
  open: boolean
  onClose: () => void
  onConnect: () => void
}

export function VMOnboardingModal({ open, onClose, onConnect }: VMOnboardingModalProps) {
  const [copied, setCopied] = useState(false)
  const [connecting, setConnecting] = useState(false)

  const installCommand = `curl -fsSL https://vm-config.dev/install.sh | bash -s -- --token=vm_abc123xyz`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(installCommand)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnect = () => {
    setConnecting(true)
    // Simulate connection delay
    setTimeout(() => {
      onConnect()
      setConnecting(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            Connect Your VM
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Run the following command on your VM to install the configuration client:
            </p>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <code className="flex-1 text-sm bg-gray-100 p-3 rounded font-mono break-all">{installCommand}</code>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="shrink-0">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">What this does:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Installs the VM configuration client</li>
              <li>• Establishes secure connection to the configuration service</li>
              <li>• Enables remote configuration management</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleConnect} disabled={connecting}>
              {connecting ? "Connecting..." : "I've run the command"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
