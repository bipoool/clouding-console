"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { NodeData } from "@/app/page"
import {
  Server,
  Code,
  Coffee,
  Database,
  Network,
  Terminal,
  Container,
  GitBranch,
  Settings,
  X,
  ArrowRight,
} from "lucide-react"

interface ConfigurationNodeProps {
  node: NodeData
  onSelect: () => void
  onDelete: () => void
  onConnectionStart: (nodeId: string) => void
  onConnectionEnd: (fromId: string, toId: string) => void
  connectingFrom: string | null
  isConnecting: boolean
  zoom: number
}

const nodeIcons: Record<string, any> = {
  "install-nginx": Server,
  "install-go": Code,
  "install-java": Coffee,
  "install-kafka": Database,
  "open-port": Network,
  "bash-script": Terminal,
  "docker-image": Container,
  "clone-repo": GitBranch,
}

const nodeColors: Record<string, string> = {
  "install-nginx": "bg-green-100 text-green-700 border-green-200",
  "install-go": "bg-blue-100 text-blue-700 border-blue-200",
  "install-java": "bg-orange-100 text-orange-700 border-orange-200",
  "install-kafka": "bg-purple-100 text-purple-700 border-purple-200",
  "open-port": "bg-red-100 text-red-700 border-red-200",
  "bash-script": "bg-gray-100 text-gray-700 border-gray-200",
  "docker-image": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "clone-repo": "bg-indigo-100 text-indigo-700 border-indigo-200",
}

export function ConfigurationNode({
  node,
  onSelect,
  onDelete,
  onConnectionStart,
  onConnectionEnd,
  connectingFrom,
  isConnecting,
  zoom,
}: ConfigurationNodeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isDraggingConnection, setIsDraggingConnection] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)
  const Icon = nodeIcons[node.type] || Server

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    if (connectingFrom && connectingFrom !== node.id) {
      onConnectionEnd(connectingFrom, node.id)
    } else if (!connectingFrom && !isDraggingConnection) {
      onSelect()
    }
  }

  const handleConnectionHandleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDraggingConnection(true)
    onConnectionStart(node.id)
  }

  const handleConnectionHandleMouseUp = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDraggingConnection(false)
  }

  return (
    <div
      ref={nodeRef}
      className="absolute cursor-pointer select-none"
      style={{ left: node.x, top: node.y }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`
          w-48 transition-all duration-200 
          ${nodeColors[node.type] || "bg-gray-100 border-gray-200"}
          ${isHovered ? "shadow-lg scale-105" : "shadow-md"}
          ${isConnecting ? "ring-2 ring-blue-400 ring-opacity-75" : ""}
          ${connectingFrom && connectingFrom !== node.id ? "ring-2 ring-green-400 ring-opacity-75 cursor-crosshair" : ""}
        `}
        onClick={handleNodeClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{node.label}</span>
            </div>
            {isHovered && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect()
                  }}
                  title="Configure"
                >
                  <Settings className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete()
                  }}
                  title="Delete"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-600 mb-2">{getNodeSummary(node)}</div>

          {/* Connection indicator */}
          {connectingFrom === node.id && (
            <div className="text-xs text-blue-600 font-medium">Drag to another node to connect →</div>
          )}

          {connectingFrom && connectingFrom !== node.id && (
            <div className="text-xs text-green-600 font-medium">← Drop here to connect</div>
          )}
        </CardContent>
      </Card>

      {/* Connection Handle - appears on hover */}
      {isHovered && !connectingFrom && (
        <div
          className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center cursor-grab hover:bg-blue-600 transition-colors shadow-lg"
          onMouseDown={handleConnectionHandleMouseDown}
          onMouseUp={handleConnectionHandleMouseUp}
          title="Drag to create connection"
        >
          <ArrowRight className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  )
}

function getNodeSummary(node: NodeData): string {
  switch (node.type) {
    case "install-nginx":
      return `Version: ${node.config.version || "latest"}`
    case "install-go":
      return `Version: ${node.config.version || "1.21"}`
    case "install-java":
      return `${node.config.distribution || "openjdk"} ${node.config.version || "17"}`
    case "install-kafka":
      return `Port: ${node.config.kafkaPort || 9092}`
    case "open-port":
      return `Port: ${node.config.port || 80}/${node.config.protocol || "tcp"}`
    case "bash-script":
      return "Custom script"
    case "docker-image":
      return node.config.image || "nginx:latest"
    case "clone-repo":
      return node.config.url ? new URL(node.config.url).pathname.split("/").pop() || "Repository" : "Repository"
    default:
      return "Configuration"
  }
}
