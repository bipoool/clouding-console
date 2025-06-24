"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Server, Code, Coffee, Database, Network, Terminal, Container, GitBranch } from "lucide-react"

interface ComponentSidebarProps {
  onDragStart: (componentType: string) => void
  disabled?: boolean
}

const components = [
  { id: "install-nginx", label: "Install Nginx", icon: Server, color: "bg-green-100 text-green-700" },
  { id: "install-go", label: "Install Go", icon: Code, color: "bg-blue-100 text-blue-700" },
  { id: "install-java", label: "Install Java", icon: Coffee, color: "bg-orange-100 text-orange-700" },
  { id: "install-kafka", label: "Install Kafka", icon: Database, color: "bg-purple-100 text-purple-700" },
  { id: "open-port", label: "Open Port", icon: Network, color: "bg-red-100 text-red-700" },
  { id: "bash-script", label: "Run Bash Script", icon: Terminal, color: "bg-gray-100 text-gray-700" },
  { id: "docker-image", label: "Run Docker Image", icon: Container, color: "bg-cyan-100 text-cyan-700" },
  { id: "clone-repo", label: "Clone Git Repo", icon: GitBranch, color: "bg-indigo-100 text-indigo-700" },
]

export function ComponentSidebar({ onDragStart, disabled }: ComponentSidebarProps) {
  const handleDragStart = (e: React.DragEvent, componentId: string) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    onDragStart(componentId)
  }

  return (
    <div className="w-80 bg-white border-r p-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Components</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {components.map((component) => {
            const Icon = component.icon
            return (
              <div
                key={component.id}
                draggable={!disabled}
                onDragStart={(e) => handleDragStart(e, component.id)}
                className={`
                  p-3 rounded-lg border-2 border-dashed border-gray-200 
                  flex items-center gap-3 cursor-move transition-all
                  ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300 hover:bg-gray-50"}
                `}
              >
                <div className={`p-2 rounded ${component.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium">{component.label}</span>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {disabled && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">Connect a VM to start building your configuration</p>
        </div>
      )}
    </div>
  )
}
