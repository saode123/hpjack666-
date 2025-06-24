"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface SimulationPanelProps {
  onSimulationEventsChange?: (
    events: Array<{
      id: number
      time: string
      event: string
      type: string
    }>,
  ) => void
}

export function SimulationPanel({ onSimulationEventsChange }: SimulationPanelProps) {
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [simulationSpeed, setSimulationSpeed] = useState([1])
  const [autoMode, setAutoMode] = useState(false)
  const [simulationTime, setSimulationTime] = useState(0)

  const [simulationEvents, setSimulationEvents] = useState([
    { id: 1, time: "14:30:15", event: "列车G1234进入1G轨道区段", type: "track" },
    { id: 2, time: "14:30:20", event: "信号机X显示绿灯", type: "signal" },
    { id: 3, time: "14:30:25", event: "道岔1#转换至定位", type: "switch" },
  ])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (simulationRunning) {
      interval = setInterval(() => {
        setSimulationTime((prev) => prev + simulationSpeed[0])
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [simulationRunning, simulationSpeed])

  const handleStartSimulation = () => {
    setSimulationRunning(true)
    const newEvent = {
      id: simulationEvents.length + 1,
      time: new Date().toLocaleTimeString(),
      event: "仿真开始运行",
      type: "system",
    }
    const updatedEvents = [newEvent, ...simulationEvents]
    setSimulationEvents(updatedEvents)
    if (onSimulationEventsChange) {
      onSimulationEventsChange(updatedEvents)
    }
  }

  const handleStopSimulation = () => {
    setSimulationRunning(false)
    const newEvent = {
      id: simulationEvents.length + 1,
      time: new Date().toLocaleTimeString(),
      event: "仿真停止运行",
      type: "system",
    }
    const updatedEvents = [newEvent, ...simulationEvents]
    setSimulationEvents(updatedEvents)
    if (onSimulationEventsChange) {
      onSimulationEventsChange(updatedEvents)
    }
  }

  const handleResetSimulation = () => {
    setSimulationRunning(false)
    setSimulationTime(0)
    setSimulationEvents([])
    if (onSimulationEventsChange) {
      onSimulationEventsChange([])
    }
  }

  const simulateTrackOccupation = () => {
    const tracks = ["1G", "2G", "3G", "IG", "IIG"]
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]
    const newEvent = {
      id: simulationEvents.length + 1,
      time: new Date().toLocaleTimeString(),
      event: `轨道区段${randomTrack}被列车占用`,
      type: "track",
    }
    const updatedEvents = [newEvent, ...simulationEvents]
    setSimulationEvents(updatedEvents)
    if (onSimulationEventsChange) {
      onSimulationEventsChange(updatedEvents)
    }
  }

  const simulateSignalChange = () => {
    const signals = ["X", "S1", "S3", "D1", "D2"]
    const aspects = ["红灯", "绿灯", "黄灯"]
    const randomSignal = signals[Math.floor(Math.random() * signals.length)]
    const randomAspect = aspects[Math.floor(Math.random() * aspects.length)]
    const newEvent = {
      id: simulationEvents.length + 1,
      time: new Date().toLocaleTimeString(),
      event: `信号机${randomSignal}显示${randomAspect}`,
      type: "signal",
    }
    const updatedEvents = [newEvent, ...simulationEvents]
    setSimulationEvents(updatedEvents)
    if (onSimulationEventsChange) {
      onSimulationEventsChange(updatedEvents)
    }
  }

  const simulateSwitchMovement = () => {
    const switches = ["1#", "2#", "3#", "4#", "5#"]
    const positions = ["定位", "反位"]
    const randomSwitch = switches[Math.floor(Math.random() * switches.length)]
    const randomPosition = positions[Math.floor(Math.random() * positions.length)]
    const newEvent = {
      id: simulationEvents.length + 1,
      time: new Date().toLocaleTimeString(),
      event: `道岔${randomSwitch}转换至${randomPosition}`,
      type: "switch",
    }
    const updatedEvents = [newEvent, ...simulationEvents]
    setSimulationEvents(updatedEvents)
    if (onSimulationEventsChange) {
      onSimulationEventsChange(updatedEvents)
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "track":
        return "bg-blue-100 text-blue-800"
      case "signal":
        return "bg-green-100 text-green-800"
      case "switch":
        return "bg-yellow-100 text-yellow-800"
      case "system":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>仿真控制面板</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="simulation-status">仿真状态</Label>
            <Badge variant={simulationRunning ? "default" : "secondary"}>
              {simulationRunning ? "运行中" : "已停止"}
            </Badge>
          </div>

          <div className="space-y-2">
            <Label>仿真速度: {simulationSpeed[0]}x</Label>
            <Slider
              value={simulationSpeed}
              onValueChange={setSimulationSpeed}
              max={10}
              min={0.1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="auto-mode" checked={autoMode} onCheckedChange={setAutoMode} />
            <Label htmlFor="auto-mode">自动模式</Label>
          </div>

          <div className="text-sm text-gray-600">
            仿真时间: {Math.floor(simulationTime / 60)}分{simulationTime % 60}秒
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleStartSimulation}
              disabled={simulationRunning}
              className="bg-green-600 hover:bg-green-700"
            >
              开始仿真
            </Button>
            <Button
              onClick={handleStopSimulation}
              disabled={!simulationRunning}
              className="bg-red-600 hover:bg-red-700"
            >
              停止仿真
            </Button>
          </div>

          <Button onClick={handleResetSimulation} variant="outline" className="w-full">
            重置仿真
          </Button>

          <div className="space-y-2">
            <Label>手动触发事件</Label>
            <div className="grid grid-cols-1 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={simulateTrackOccupation}
                className="bg-blue-50 border-blue-300"
              >
                模拟轨道占用
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={simulateSignalChange}
                className="bg-green-50 border-green-300"
              >
                模拟信号变化
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={simulateSwitchMovement}
                className="bg-yellow-50 border-yellow-300"
              >
                模拟道岔动作
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>仿真事件日志</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {simulationEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Badge className={`text-xs ${getEventTypeColor(event.type)}`}>
                  {event.type === "track"
                    ? "轨道"
                    : event.type === "signal"
                      ? "信号"
                      : event.type === "switch"
                        ? "道岔"
                        : "系统"}
                </Badge>
                <div className="flex-1">
                  <div className="text-sm">{event.event}</div>
                  <div className="text-xs text-gray-500">{event.time}</div>
                </div>
              </div>
            ))}

            {simulationEvents.length === 0 && <div className="text-center text-gray-500 py-8">暂无仿真事件</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
