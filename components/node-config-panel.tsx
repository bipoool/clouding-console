"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import type { NodeData } from "@/app/page"

interface NodeConfigPanelProps {
  node: NodeData
  onUpdateConfig: (config: Record<string, any>) => void
  onClose: () => void
}

export function NodeConfigPanel({ node, onUpdateConfig, onClose }: NodeConfigPanelProps) {
  const [config, setConfig] = useState(node.config)

  useEffect(() => {
    setConfig(node.config)
  }, [node])

  const handleSave = () => {
    onUpdateConfig(config)
    onClose()
  }

  const updateConfig = (key: string, value: any) => {
    setConfig({ ...config, [key]: value })
  }

  const renderConfigFields = () => {
    switch (node.type) {
      case "install-nginx":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={config.version || ""}
                onChange={(e) => updateConfig("version", e.target.value)}
                placeholder="latest"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="autoStart"
                checked={config.autoStart || false}
                onCheckedChange={(checked) => updateConfig("autoStart", checked)}
              />
              <Label htmlFor="autoStart">Auto-start service</Label>
            </div>
          </div>
        )

      case "install-go":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Select value={config.version || "1.21"} onValueChange={(value) => updateConfig("version", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1.21">1.21</SelectItem>
                  <SelectItem value="1.20">1.20</SelectItem>
                  <SelectItem value="1.19">1.19</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="addToPath"
                checked={config.addToPath || false}
                onCheckedChange={(checked) => updateConfig("addToPath", checked)}
              />
              <Label htmlFor="addToPath">Add to PATH</Label>
            </div>
          </div>
        )

      case "install-java":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="version">Version</Label>
              <Select value={config.version || "17"} onValueChange={(value) => updateConfig("version", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="17">17</SelectItem>
                  <SelectItem value="11">11</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="distribution">Distribution</Label>
              <Select
                value={config.distribution || "openjdk"}
                onValueChange={(value) => updateConfig("distribution", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openjdk">OpenJDK</SelectItem>
                  <SelectItem value="oracle">Oracle JDK</SelectItem>
                  <SelectItem value="adoptium">Adoptium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "open-port":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="port">Port Number</Label>
              <Input
                id="port"
                type="number"
                value={config.port || ""}
                onChange={(e) => updateConfig("port", Number.parseInt(e.target.value))}
                placeholder="80"
              />
            </div>
            <div>
              <Label htmlFor="protocol">Protocol</Label>
              <Select value={config.protocol || "tcp"} onValueChange={(value) => updateConfig("protocol", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case "bash-script":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="script">Script Content</Label>
              <Textarea
                id="script"
                value={config.script || ""}
                onChange={(e) => updateConfig("script", e.target.value)}
                placeholder="#!/bin/bash&#10;echo 'Hello World'"
                rows={6}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="runAsRoot"
                checked={config.runAsRoot || false}
                onCheckedChange={(checked) => updateConfig("runAsRoot", checked)}
              />
              <Label htmlFor="runAsRoot">Run as root</Label>
            </div>
          </div>
        )

      case "docker-image":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image">Docker Image</Label>
              <Input
                id="image"
                value={config.image || ""}
                onChange={(e) => updateConfig("image", e.target.value)}
                placeholder="nginx:latest"
              />
            </div>
            <div>
              <Label htmlFor="ports">Port Mappings</Label>
              <Input
                id="ports"
                value={config.ports?.join(", ") || ""}
                onChange={(e) =>
                  updateConfig(
                    "ports",
                    e.target.value.split(",").map((p) => p.trim()),
                  )
                }
                placeholder="80:80, 443:443"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="detached"
                checked={config.detached || false}
                onCheckedChange={(checked) => updateConfig("detached", checked)}
              />
              <Label htmlFor="detached">Run in background</Label>
            </div>
          </div>
        )

      case "clone-repo":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Repository URL</Label>
              <Input
                id="url"
                value={config.url || ""}
                onChange={(e) => updateConfig("url", e.target.value)}
                placeholder="https://github.com/user/repo.git"
              />
            </div>
            <div>
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={config.branch || ""}
                onChange={(e) => updateConfig("branch", e.target.value)}
                placeholder="main"
              />
            </div>
            <div>
              <Label htmlFor="directory">Target Directory</Label>
              <Input
                id="directory"
                value={config.directory || ""}
                onChange={(e) => updateConfig("directory", e.target.value)}
                placeholder="/opt/app"
              />
            </div>
          </div>
        )

      default:
        return <div>No configuration options available</div>
    }
  }

  return (
    <div className="w-80 bg-white border-l p-4 overflow-y-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">{node.label}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {renderConfigFields()}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
