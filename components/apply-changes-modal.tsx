"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react"
import type { NodeData } from "@/app/page"

interface ApplyChangesModalProps {
  open: boolean
  onClose: () => void
  nodes: NodeData[]
}

interface ExecutionStep {
  id: string
  component: string
  status: "pending" | "running" | "completed" | "failed"
  logs: string[]
}

export function ApplyChangesModal({ open, onClose, nodes }: ApplyChangesModalProps) {
  const [confirmed, setConfirmed] = useState(false)
  const [executing, setExecuting] = useState(false)
  const [steps, setSteps] = useState<ExecutionStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (open && !confirmed) {
      setConfirmed(false)
      setExecuting(false)
      setSteps([])
      setCurrentStep(0)
    }
  }, [open])

  const handleConfirm = () => {
    setConfirmed(true)
    setExecuting(true)

    const executionSteps: ExecutionStep[] = nodes.map((node) => ({
      id: node.id,
      component: node.label,
      status: "pending",
      logs: [],
    }))

    setSteps(executionSteps)
    simulateExecution(executionSteps)
  }

  const simulateExecution = async (executionSteps: ExecutionStep[]) => {
    for (let i = 0; i < executionSteps.length; i++) {
      setCurrentStep(i)

      // Start step
      setSteps((prev) =>
        prev.map((step, index) => (index === i ? { ...step, status: "running", logs: ["Starting..."] } : step)),
      )

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add some logs
      const sampleLogs = getSampleLogs(executionSteps[i].component)
      for (const log of sampleLogs) {
        setSteps((prev) => prev.map((step, index) => (index === i ? { ...step, logs: [...step.logs, log] } : step)))
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      // Complete step
      setSteps((prev) =>
        prev.map((step, index) =>
          index === i
            ? {
                ...step,
                status: Math.random() > 0.9 ? "failed" : "completed",
                logs: [...step.logs, "Completed successfully"],
              }
            : step,
        ),
      )

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setExecuting(false)
  }

  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0
  const completedSteps = steps.filter((step) => step.status === "completed").length
  const failedSteps = steps.filter((step) => step.status === "failed").length

  if (!confirmed) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Ready to apply changes</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    This will install and configure {nodes.length} component{nodes.length !== 1 ? "s" : ""} on your VM.
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {nodes.map((node) => (
                <div key={node.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{node.label}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>Apply Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={!executing ? onClose : undefined}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Applying Changes</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {completedSteps}/{steps.length} completed
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {failedSteps > 0 && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {failedSteps} step{failedSteps !== 1 ? "s" : ""} failed
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {steps.map((step, index) => (
              <Card
                key={step.id}
                className={`
                ${step.status === "running" ? "border-blue-200 bg-blue-50" : ""}
                ${step.status === "completed" ? "border-green-200 bg-green-50" : ""}
                ${step.status === "failed" ? "border-red-200 bg-red-50" : ""}
              `}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-2">
                    {step.status === "pending" && <Clock className="w-4 h-4 text-gray-400" />}
                    {step.status === "running" && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                    {step.status === "completed" && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {step.status === "failed" && <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span className="font-medium">{step.component}</span>
                  </div>

                  {step.logs.length > 0 && (
                    <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
                      {step.logs.map((log, logIndex) => (
                        <div key={logIndex}>{log}</div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {!executing && (
            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getSampleLogs(component: string): string[] {
  const commonLogs = [
    "Checking system requirements...",
    "Downloading packages...",
    "Installing dependencies...",
    "Configuring service...",
  ]

  const specificLogs: Record<string, string[]> = {
    "Install Nginx": [
      "Adding nginx repository...",
      "Installing nginx package...",
      "Starting nginx service...",
      "Enabling auto-start...",
    ],
    "Install Go": [
      "Downloading Go binary...",
      "Extracting to /usr/local/go...",
      "Updating PATH environment...",
      "Verifying installation...",
    ],
    "Install Java": [
      "Installing OpenJDK...",
      "Setting JAVA_HOME...",
      "Updating alternatives...",
      "Testing Java installation...",
    ],
  }

  return specificLogs[component] || commonLogs
}
