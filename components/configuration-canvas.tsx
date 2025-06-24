"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import type { NodeData, Connection } from "@/app/page"
import { ConfigurationNode } from "@/components/configuration-node"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"

interface ConfigurationCanvasProps {
  nodes: NodeData[]
  connections: Connection[]
  onDrop: (e: React.DragEvent, x: number, y: number) => void
  onNodeSelect: (node: NodeData) => void
  onNodeDelete: (nodeId: string) => void
  onConnectionStart: (nodeId: string) => void
  onConnectionEnd: (fromId: string, toId: string) => void
  onConnectionDelete: (connectionId: string) => void
  connectingFrom: string | null
  disabled?: boolean
}

export function ConfigurationCanvas({
  nodes,
  connections,
  onDrop,
  onNodeSelect,
  onNodeDelete,
  onConnectionStart,
  onConnectionEnd,
  onConnectionDelete,
  connectingFrom,
  disabled,
}: ConfigurationCanvasProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left - pan.x) / zoom
    const y = (e.clientY - rect.top - pan.y) / zoom
    onDrop(e, x, y)
  }

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.min(Math.max(0.25, zoom + delta), 3)
      setZoom(newZoom)
    },
    [zoom],
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan on left click on empty space
    if (e.button === 0 && e.target === e.currentTarget) {
      setIsPanning(true)
      setLastPanPoint({ x: e.clientX, y: e.clientY })
      e.preventDefault()
    }
  }

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning) {
        const deltaX = e.clientX - lastPanPoint.x
        const deltaY = e.clientY - lastPanPoint.y
        setPan((prev) => ({ x: prev.x + deltaX, y: prev.y + deltaY }))
        setLastPanPoint({ x: e.clientX, y: e.clientY })
      }
    },
    [isPanning, lastPanPoint],
  )

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  const zoomIn = () => setZoom(Math.min(zoom + 0.25, 3))
  const zoomOut = () => setZoom(Math.max(zoom - 0.25, 0.25))
  const resetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const getConnectionPath = (from: NodeData, to: NodeData) => {
    const fromX = from.x + 96 // Half of node width (192px / 2)
    const fromY = from.y + 40 // Approximate center height
    const toX = to.x + 96
    const toY = to.y + 40

    // Create a straight line
    return `M ${fromX} ${fromY} L ${toX} ${toY}`
  }

  const handleConnectionClick = (connectionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onConnectionDelete(connectionId)
  }

  return (
    <div className="flex-1 relative bg-gray-50 overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button variant="outline" size="sm" onClick={zoomIn}>
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={zoomOut}>
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetView}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <div className="text-xs text-center text-gray-600 bg-white px-2 py-1 rounded">{Math.round(zoom * 100)}%</div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: "0 0",
          }}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${20 / zoom}px ${20 / zoom}px`,
              width: `${100 / zoom}%`,
              height: `${100 / zoom}%`,
            }}
          />

          {/* Connections SVG */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              width: `${100 / zoom}%`,
              height: `${100 / zoom}%`,
            }}
          >
            {connections.map((connection) => {
              const fromNode = nodes.find((n) => n.id === connection.from)
              const toNode = nodes.find((n) => n.id === connection.to)
              if (!fromNode || !toNode) return null

              return (
                <g key={connection.id}>
                  <path
                    d={getConnectionPath(fromNode, toNode)}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="pointer-events-auto cursor-pointer hover:stroke-red-500"
                    onClick={(e) => handleConnectionClick(connection.id, e)}
                  />
                  {/* Connection delete button */}
                  <circle
                    cx={(fromNode.x + toNode.x) / 2 + 96}
                    cy={(fromNode.y + toNode.y) / 2 + 40}
                    r="8"
                    fill="white"
                    stroke="#ef4444"
                    strokeWidth="2"
                    className="pointer-events-auto cursor-pointer hover:fill-red-50"
                    onClick={(e) => handleConnectionClick(connection.id, e)}
                  />
                  <text
                    x={(fromNode.x + toNode.x) / 2 + 96}
                    y={(fromNode.y + toNode.y) / 2 + 40}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10"
                    fill="#ef4444"
                    className="pointer-events-none"
                  >
                    ×
                  </text>
                </g>
              )
            })}
            {/* Arrow marker definition */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
              </marker>
            </defs>
          </svg>

          {/* Drop Zone Message */}
          {nodes.length === 0 && !disabled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-medium mb-2">Drag components here</h3>
                <p className="text-sm">Build your VM configuration by dragging components from the sidebar</p>
                <p className="text-xs mt-2 text-gray-400">
                  Tip: Drag canvas to pan • Mouse wheel to zoom • Hover nodes to connect
                </p>
              </div>
            </div>
          )}

          {disabled && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">🔌</div>
                <h3 className="text-xl font-medium mb-2">Connect a VM to get started</h3>
                <p className="text-sm">Click "Connect VM" to begin configuring your infrastructure</p>
              </div>
            </div>
          )}

          {/* Nodes */}
          {nodes.map((node) => (
            <ConfigurationNode
              key={node.id}
              node={node}
              onSelect={() => onNodeSelect(node)}
              onDelete={() => onNodeDelete(node.id)}
              onConnectionStart={onConnectionStart}
              onConnectionEnd={onConnectionEnd}
              connectingFrom={connectingFrom}
              isConnecting={connectingFrom === node.id}
              zoom={zoom}
            />
          ))}

          {/* Connection Instructions */}
          {connectingFrom && (
            <div className="absolute top-4 left-4 bg-blue-100 border border-blue-300 rounded-lg p-3 pointer-events-none">
              <p className="text-sm text-blue-800 font-medium">Drag the blue arrow to another node to connect</p>
              <p className="text-xs text-blue-600 mt-1">Click anywhere to cancel</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
