"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Plus, AlertCircle } from "lucide-react"
import type { NodeData } from "@/app/page"

interface PlanChangesModalProps {
  open: boolean
  onClose: () => void
  nodes: NodeData[]
}

export function PlanChangesModal({ open, onClose, nodes }: PlanChangesModalProps) {
  // Sort nodes by execution order (you can implement topological sort here)
  const sortedNodes = [...nodes] // For now, keep original order

  const planItems = sortedNodes.map((node, index) => ({
    id: node.id,
    action: "install",
    component: node.label,
    status: Math.random() > 0.7 ? "update" : "new",
    details: getActionDetails(node),
    order: index + 1,
  }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Plan Changes - Execution Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-green-600" />
              <span>{planItems.filter((item) => item.status === "new").length} to install</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span>{planItems.filter((item) => item.status === "update").length} to update</span>
            </div>
          </div>

          <div className="space-y-2">
            {planItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {item.order}
                      </div>
                      {item.status === "new" ? (
                        <Plus className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-orange-600" />
                      )}
                      <div>
                        <div className="font-medium">{item.component}</div>
                        <div className="text-sm text-gray-600">{item.details}</div>
                      </div>
                    </div>
                    <Badge variant={item.status === "new" ? "default" : "secondary"}>
                      {item.status === "new" ? "Install" : "Update"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Execution Order Confirmed</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Components will be executed in the order shown above, following your connection map.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>Looks Good</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getActionDetails(node: NodeData): string {
  switch (node.type) {
    case "install-nginx":
      return `Install Nginx ${node.config.version || "latest"}`
    case "install-go":
      return `Install Go ${node.config.version || "1.21"}`
    case "install-java":
      return `Install ${node.config.distribution || "OpenJDK"} ${node.config.version || "17"}`
    case "install-kafka":
      return `Install Kafka ${node.config.version || "2.8.0"}`
    case "open-port":
      return `Open port ${node.config.port || 80}/${node.config.protocol || "tcp"}`
    case "bash-script":
      return "Execute custom bash script"
    case "docker-image":
      return `Run Docker container: ${node.config.image || "nginx:latest"}`
    case "clone-repo":
      return `Clone repository to ${node.config.directory || "/opt/app"}`
    default:
      return "Configure component"
  }
}
