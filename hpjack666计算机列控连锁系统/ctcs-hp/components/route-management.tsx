"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Route {
  id: string
  name: string
  from: string
  to: string
  status: "空闲" | "锁闭" | "开放" | "占用"
  type: "接车" | "发车" | "调车"
  switches: string[]
  signals: string[]
}

export function RouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: "1",
      name: "X-1G接车进路",
      from: "X",
      to: "1G",
      status: "空闲",
      type: "接车",
      switches: ["1#", "3#"],
      signals: ["X", "S1"],
    },
    {
      id: "2",
      name: "1G-S1发车进路",
      from: "1G",
      to: "S1",
      status: "锁闭",
      type: "发车",
      switches: ["1#"],
      signals: ["S1"],
    },
    {
      id: "3",
      name: "2G-S3发车进路",
      from: "2G",
      to: "S3",
      status: "开放",
      type: "发车",
      switches: ["3#"],
      signals: ["S3"],
    },
  ])

  const [selectedRoute, setSelectedRoute] = useState("")

  const handleRouteOperation = (operation: string) => {
    if (!selectedRoute) return

    setRoutes((prev) =>
      prev.map((route) => {
        if (route.id === selectedRoute) {
          switch (operation) {
            case "建立":
              return { ...route, status: "锁闭" }
            case "开放":
              return { ...route, status: "开放" }
            case "取消":
              return { ...route, status: "空闲" }
            default:
              return route
          }
        }
        return route
      }),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "空闲":
        return "default"
      case "锁闭":
        return "secondary"
      case "开放":
        return "default"
      case "占用":
        return "destructive"
      default:
        return "default"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "空闲":
        return "bg-gray-100 border-gray-300"
      case "锁闭":
        return "bg-yellow-100 border-yellow-300"
      case "开放":
        return "bg-green-100 border-green-300"
      case "占用":
        return "bg-red-100 border-red-300"
      default:
        return "bg-gray-100 border-gray-300"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>进路控制</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="route-select">选择进路</Label>
            <Select value={selectedRoute} onValueChange={setSelectedRoute}>
              <SelectTrigger>
                <SelectValue placeholder="选择要操作的进路" />
              </SelectTrigger>
              <SelectContent>
                {routes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleRouteOperation("建立")}
              disabled={!selectedRoute}
              className="bg-blue-600 hover:bg-blue-700"
            >
              建立进路
            </Button>
            <Button
              onClick={() => handleRouteOperation("开放")}
              disabled={!selectedRoute}
              className="bg-green-600 hover:bg-green-700"
            >
              开放进路
            </Button>
            <Button
              onClick={() => handleRouteOperation("取消")}
              disabled={!selectedRoute}
              className="bg-red-600 hover:bg-red-700"
            >
              取消进路
            </Button>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">进路详情</h4>
            {selectedRoute && (
              <div className="space-y-2">
                {routes
                  .filter((r) => r.id === selectedRoute)
                  .map((route) => (
                    <div key={route.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{route.name}</span>
                        <Badge variant={getStatusColor(route.status)}>{route.status}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>
                          起点: {route.from} → 终点: {route.to}
                        </div>
                        <div>类型: {route.type}进路</div>
                        <div>涉及道岔: {route.switches.join(", ")}</div>
                        <div>涉及信号机: {route.signals.join(", ")}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>进路状态监控</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {routes.map((route) => (
              <div key={route.id} className={`p-4 rounded-lg border-2 ${getStatusBgColor(route.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{route.name}</h3>
                  <Badge variant={getStatusColor(route.status)}>{route.status}</Badge>
                </div>

                <div className="text-sm text-gray-600 mb-2">
                  <div>
                    {route.from} → {route.to}
                  </div>
                  <div className="flex gap-4">
                    <span>道岔: {route.switches.join(", ")}</span>
                    <span>信号: {route.signals.join(", ")}</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs">
                  {route.type}进路
                </Badge>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">进路统计</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {routes.filter((r) => r.status === "开放").length}
                </div>
                <div className="text-sm text-green-700">开放进路</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-xl font-bold text-yellow-600">
                  {routes.filter((r) => r.status === "锁闭").length}
                </div>
                <div className="text-sm text-yellow-700">锁闭进路</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
