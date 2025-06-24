"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface StatusMonitorProps {
  systemStatus: string
  onStatusChange: (status: string) => void
  onAlertsChange: (alerts: string[]) => void
}

export function StatusMonitor({ systemStatus, onStatusChange, onAlertsChange }: StatusMonitorProps) {
  const [cpuUsage, setCpuUsage] = useState(45)
  const [memoryUsage, setMemoryUsage] = useState(62)
  const [networkStatus, setNetworkStatus] = useState("正常")
  const [deviceStatus, setDeviceStatus] = useState({
    signals: { total: 12, normal: 11, fault: 1 },
    switches: { total: 8, normal: 8, fault: 0 },
    tracks: { total: 15, normal: 14, occupied: 1 },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage((prev) => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 10)))
      setMemoryUsage((prev) => Math.max(30, Math.min(90, prev + (Math.random() - 0.5) * 8)))

      // Simulate alerts
      const alerts = []
      if (deviceStatus.signals.fault > 0) alerts.push("信号机故障")
      if (cpuUsage > 70) alerts.push("CPU使用率过高")
      if (memoryUsage > 85) alerts.push("内存使用率过高")

      onAlertsChange(alerts)
      onStatusChange(alerts.length > 0 ? "告警状态" : "正常运行")
    }, 3000)

    return () => clearInterval(interval)
  }, [deviceStatus, cpuUsage, memoryUsage, onAlertsChange, onStatusChange])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>系统状态监控</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">CPU使用率</span>
              <span className="text-sm font-mono">{cpuUsage.toFixed(1)}%</span>
            </div>
            <Progress value={cpuUsage} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">内存使用率</span>
              <span className="text-sm font-mono">{memoryUsage.toFixed(1)}%</span>
            </div>
            <Progress value={memoryUsage} className="h-2" />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">网络状态</span>
            <Badge variant={networkStatus === "正常" ? "default" : "destructive"}>{networkStatus}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>设备状态统计</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">信号机</span>
            <div className="flex gap-2">
              <Badge variant="default">{deviceStatus.signals.normal}正常</Badge>
              {deviceStatus.signals.fault > 0 && <Badge variant="destructive">{deviceStatus.signals.fault}故障</Badge>}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">道岔</span>
            <div className="flex gap-2">
              <Badge variant="default">{deviceStatus.switches.normal}正常</Badge>
              {deviceStatus.switches.fault > 0 && (
                <Badge variant="destructive">{deviceStatus.switches.fault}故障</Badge>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm">轨道电路</span>
            <div className="flex gap-2">
              <Badge variant="default">{deviceStatus.tracks.normal}空闲</Badge>
              <Badge variant="secondary">{deviceStatus.tracks.occupied}占用</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
