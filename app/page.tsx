"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { VMOnboardingModal } from "@/components/vm-onboarding-modal"
import { ConfigurationCanvas } from "@/components/configuration-canvas"
import { ComponentSidebar } from "@/components/component-sidebar"
import { NodeConfigPanel } from "@/components/node-config-panel"
import { PlanChangesModal } from "@/components/plan-changes-modal"
import { ApplyChangesModal } from "@/components/apply-changes-modal"

export interface NodeData {
  id: string
  type: string
  label: string
  x: number
  y: number
  config: Record<string, any>
}

export interface Connection {
  id: string
  from: string
  to: string
}

export default function VMConfigTool() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [vmConnected, setVmConnected] = useState(false)
  const [nodes, setNodes] = useState<NodeData[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [draggedComponent, setDraggedComponent] = useState<string | null>(null)
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)

  const handleVMConnect = () => {
    setVmConnected(true)
    setShowOnboarding(false)
  }

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault()
    if (!draggedComponent) return

    const newNode: NodeData = {
      id: `node-${Date.now()}`,
      type: draggedComponent,
      label: getNodeLabel(draggedComponent),
      x,
      y,
      config: getDefaultConfig(draggedComponent),
    }

    setNodes([...nodes, newNode])
    setDraggedComponent(null)
  }

  const updateNodeConfig = (nodeId: string, config: Record<string, any>) => {
    setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, config } : node)))
  }

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter((node) => node.id !== nodeId))
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null)
    }
  }

  const addConnection = (fromId: string, toId: string) => {
    if (fromId === toId) return

    const connectionExists = connections.some(
      (conn) => (conn.from === fromId && conn.to === toId) || (conn.from === toId && conn.to === fromId),
    )

    if (!connectionExists) {
      const newConnection: Connection = {
        id: `conn-${Date.now()}`,
        from: fromId,
        to: toId,
      }
      setConnections([...connections, newConnection])
    }
    setConnectingFrom(null)
  }

  const deleteConnection = (connectionId: string) => {
    setConnections(connections.filter((conn) => conn.id !== connectionId))
  }

  // Update the canvas props to include new functionality
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">VM Configuration Studio</h1>
          <p className="text-sm text-gray-600">Visual infrastructure configuration without code</p>
        </div>
        <div className="flex items-center gap-3">
          {vmConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">VM Connected</span>
            </div>
          ) : (
            <Button onClick={() => setShowOnboarding(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Connect VM
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <ComponentSidebar onDragStart={setDraggedComponent} disabled={!vmConnected} />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <ConfigurationCanvas
            nodes={nodes}
            connections={connections}
            onDrop={handleDrop}
            onNodeSelect={setSelectedNode}
            onNodeDelete={deleteNode}
            onConnectionStart={setConnectingFrom}
            onConnectionEnd={addConnection}
            onConnectionDelete={deleteConnection}
            connectingFrom={connectingFrom}
            disabled={!vmConnected}
          />

          {/* Action Buttons */}
          {vmConnected && nodes.length > 0 && (
            <div className="p-4 bg-white border-t flex gap-3">
              <Button variant="outline" onClick={() => setShowPlanModal(true)}>
                Plan Changes
              </Button>
              <Button onClick={() => setShowApplyModal(true)}>Apply Changes</Button>
            </div>
          )}
        </div>

        {/* Node Configuration Panel */}
        {selectedNode && (
          <NodeConfigPanel
            node={selectedNode}
            onUpdateConfig={(config) => updateNodeConfig(selectedNode.id, config)}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>

      {/* Modals */}
      <VMOnboardingModal open={showOnboarding} onClose={() => setShowOnboarding(false)} onConnect={handleVMConnect} />

      <PlanChangesModal open={showPlanModal} onClose={() => setShowPlanModal(false)} nodes={nodes} />

      <ApplyChangesModal open={showApplyModal} onClose={() => setShowApplyModal(false)} nodes={nodes} />
    </div>
  )
}

function getNodeLabel(type: string): string {
  const labels: Record<string, string> = {
    "install-nginx": "Install Nginx",
    "install-go": "Install Go",
    "install-java": "Install Java",
    "install-kafka": "Install Kafka",
    "open-port": "Open Port",
    "bash-script": "Run Bash Script",
    "docker-image": "Run Docker Image",
    "clone-repo": "Clone Git Repo",
  }
  return labels[type] || type
}

function getDefaultConfig(type: string): Record<string, any> {
  const configs: Record<string, Record<string, any>> = {
    "install-nginx": { version: "latest", autoStart: true },
    "install-go": { version: "1.21", addToPath: true },
    "install-java": { version: "17", distribution: "openjdk" },
    "install-kafka": { version: "2.8.0", zookeeperPort: 2181, kafkaPort: 9092 },
    "open-port": { port: 80, protocol: "tcp" },
    "bash-script": { script: '#!/bin/bash\necho "Hello World"', runAsRoot: false },
    "docker-image": { image: "nginx:latest", ports: ["80:80"], detached: true },
    "clone-repo": { url: "https://github.com/user/repo.git", branch: "main", directory: "/opt/app" },
  }
  return configs[type] || {}
}
