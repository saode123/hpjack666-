"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TrainOperationsProps {
  onOperationsChange?: (
    operations: Array<{
      id: number
      trainNumber: string
      operation: string
      startSignal: string
      endSignal: string
      status: string
      time: string
    }>,
  ) => void
  onTrainArrival?: (operationId: number) => void
}

export function TrainOperations({ onOperationsChange, onTrainArrival }: TrainOperationsProps) {
  const [trainNumber, setTrainNumber] = useState("")
  const [startSignal, setStartSignal] = useState("")
  const [endSignal, setEndSignal] = useState("")
  const [operations, setOperations] = useState([
    {
      id: 1,
      trainNumber: "G1234",
      operation: "接车",
      startSignal: "X",
      endSignal: "SII",
      status: "完成",
      time: "14:30:15",
    },
  ])

  const signals = ["X3", "S3", "X", "D1", "SII", "XII", "D2", "S", "X1", "S1"]

  const handleOperation = (operationType: string) => {
    if (!trainNumber || !startSignal || !endSignal) return

    // Validate signals before creating operation
    const routeSignals = getRequiredSignals(startSignal, endSignal)
    const invalidSignals = routeSignals.filter((signalName) => {
      // This would need to be passed from parent component
      // For now, we'll create the operation and let the track layout handle validation
      return false
    })

    const newOperation = {
      id: operations.length + 1,
      trainNumber: trainNumber,
      operation: operationType,
      startSignal: startSignal,
      endSignal: endSignal,
      status: "执行中",
      time: new Date().toLocaleTimeString(),
    }

    const updatedOperations = [newOperation, ...operations]
    setOperations(updatedOperations)

    // Notify parent component
    if (onOperationsChange) {
      onOperationsChange(updatedOperations)
    }

    // Calculate estimated completion time based on distance
    const estimatedTime = calculateCompletionTime(startSignal, endSignal)

    // Auto-complete operation when train reaches destination
    setTimeout(() => {
      const completedOperations = updatedOperations.map((op) =>
        op.id === newOperation.id ? { ...op, status: "完成" } : op,
      )
      setOperations(completedOperations)
      if (onOperationsChange) {
        onOperationsChange(completedOperations)
      }
      if (onTrainArrival) {
        onTrainArrival(newOperation.id)
      }
    }, estimatedTime)
  }

  // Add helper function to get required signals for a route
  const getRequiredSignals = (startSignal: string, endSignal: string): string[] => {
    const signals = [startSignal]
    if (startSignal !== endSignal) {
      signals.push(endSignal)
    }

    // Add logic to determine intermediate signals based on route
    // This mirrors the logic in track-layout.tsx
    const signalPositions: Record<string, { x: number; y: number }> = {
      X3: { x: 500, y: 60 },
      S3: { x: 300, y: 60 },
      X: { x: 50, y: 120 },
      D1: { x: 100, y: 120 },
      SII: { x: 300, y: 120 },
      XII: { x: 500, y: 120 },
      D2: { x: 700, y: 120 },
      S: { x: 750, y: 120 },
      X1: { x: 500, y: 180 },
      S1: { x: 300, y: 180 },
    }

    const getTrack = (signal: string) => {
      if (["X3", "S3"].includes(signal)) return "upper"
      if (["X1", "S1"].includes(signal)) return "lower"
      return "middle"
    }

    const startTrack = getTrack(startSignal)
    const endTrack = getTrack(endSignal)

    if (startTrack === "middle" && endTrack === "middle") {
      const startX = signalPositions[startSignal].x
      const endX = signalPositions[endSignal].x

      if (startX < endX) {
        // Moving right - add intermediate signals
        if (startX < 200 && endX > 200) signals.push("D1")
        if (startX < 300 && endX > 300) signals.push("SII")
        if (startX < 500 && endX > 500) signals.push("XII")
        if (startX < 700 && endX > 700) signals.push("D2")
      }
    }

    return [...new Set(signals)]
  }

  const calculateCompletionTime = (startSignal: string, endSignal: string): number => {
    // Simple distance-based calculation (in milliseconds)
    const signalPositions: Record<string, { x: number; y: number }> = {
      X3: { x: 500, y: 60 },
      S3: { x: 300, y: 60 },
      X: { x: 50, y: 120 },
      D1: { x: 100, y: 120 },
      SII: { x: 300, y: 120 },
      XII: { x: 500, y: 120 },
      D2: { x: 700, y: 120 },
      S: { x: 750, y: 120 },
      X1: { x: 500, y: 180 },
      S1: { x: 300, y: 180 },
    }

    const start = signalPositions[startSignal]
    const end = signalPositions[endSignal]

    if (!start || !end) return 8000

    const distance = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2))
    return Math.max(3000, distance * 15) // Minimum 3 seconds, scale with distance
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>列车作业控制</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="train-number">输入列车号</Label>
            <Input
              id="train-number"
              value={trainNumber}
              onChange={(e) => setTrainNumber(e.target.value)}
              placeholder="请输入列车号，如：G1234"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-signal">起始信号机</Label>
              <Select value={startSignal} onValueChange={setStartSignal}>
                <SelectTrigger>
                  <SelectValue placeholder="选择起始信号机" />
                </SelectTrigger>
                <SelectContent>
                  {signals.map((signal) => (
                    <SelectItem key={signal} value={signal}>
                      {signal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="end-signal">终止信号机</Label>
              <Select value={endSignal} onValueChange={setEndSignal}>
                <SelectTrigger>
                  <SelectValue placeholder="选择终止信号机" />
                </SelectTrigger>
                <SelectContent>
                  {signals.map((signal) => (
                    <SelectItem key={signal} value={signal}>
                      {signal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">信号检查</h4>
            {startSignal && endSignal && (
              <div className="text-xs text-gray-600">
                <div>所需信号机: {getRequiredSignals(startSignal, endSignal).join(", ")}</div>
                <div className="text-orange-600 mt-1">⚠️ 请确保所有信号机已设置为绿灯状态</div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleOperation("接车")}
              disabled={!trainNumber || !startSignal || !endSignal}
              className="bg-green-600 hover:bg-green-700"
            >
              接车作业
            </Button>
            <Button
              onClick={() => handleOperation("发车")}
              disabled={!trainNumber || !startSignal || !endSignal}
              className="bg-blue-600 hover:bg-blue-700"
            >
              发车作业
            </Button>
            <Button
              onClick={() => handleOperation("通过")}
              disabled={!trainNumber || !startSignal || !endSignal}
              className="bg-purple-600 hover:bg-purple-700"
            >
              通过作业
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="bg-yellow-50 border-yellow-300 text-yellow-800">
              暂停作业
            </Button>
            <Button variant="outline" className="bg-red-50 border-red-300 text-red-800">
              取消作业
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>作业记录</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {operations.map((op) => (
              <div key={op.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">
                    {op.trainNumber} - {op.operation}
                  </div>
                  <div className="text-sm text-gray-600">
                    {op.startSignal} → {op.endSignal}
                  </div>
                  <div className="text-xs text-gray-500">{op.time}</div>
                </div>
                <Badge variant={op.status === "完成" ? "default" : "secondary"}>{op.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
