"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Play, Square, RotateCcw } from "lucide-react"

interface ShuntingOperation {
  id: string
  locomotive: string
  fromTrack: string
  toTrack: string
  cars: number
  status: "准备" | "进行中" | "暂停" | "完成" | "取消"
  startTime?: string
  type: "推送" | "牵引" | "解编" | "编组"
}

export function ShuntingControl() {
  const [locomotive, setLocomotive] = useState("")
  const [fromTrack, setFromTrack] = useState("")
  const [toTrack, setToTrack] = useState("")
  const [carCount, setCarCount] = useState("")
  const [operationType, setOperationType] = useState("")

  const [operations, setOperations] = useState<ShuntingOperation[]>([
    {
      id: "1",
      locomotive: "DJ001",
      fromTrack: "2G",
      toTrack: "3G",
      cars: 5,
      status: "进行中",
      startTime: "14:25:30",
      type: "推送",
    },
  ])

  const tracks = ["1G", "2G", "3G", "IG", "IIG", "安全线"]
  const locomotives = ["DJ001", "DJ002", "DJ003", "DJ004"]
  const operationTypes = ["推送", "牵引", "解编", "编组"]

  const handleCreateOperation = () => {
    if (!locomotive || !fromTrack || !toTrack || !carCount || !operationType) return

    const newOperation: ShuntingOperation = {
      id: (operations.length + 1).toString(),
      locomotive,
      fromTrack,
      toTrack,
      cars: Number.parseInt(carCount),
      status: "准备",
      type: operationType as "推送" | "牵引" | "解编" | "编组",
    }

    setOperations([newOperation, ...operations])

    // Clear form
    setLocomotive("")
    setFromTrack("")
    setToTrack("")
    setCarCount("")
    setOperationType("")
  }

  const handleStartOperation = (id: string) => {
    setOperations((prev) =>
      prev.map((op) => (op.id === id ? { ...op, status: "进行中", startTime: new Date().toLocaleTimeString() } : op)),
    )
  }

  const handlePauseOperation = (id: string) => {
    setOperations((prev) => prev.map((op) => (op.id === id ? { ...op, status: "暂停" } : op)))
  }

  const handleCompleteOperation = (id: string) => {
    setOperations((prev) => prev.map((op) => (op.id === id ? { ...op, status: "完成" } : op)))
  }

  const handleCancelOperation = (id: string) => {
    setOperations((prev) => prev.map((op) => (op.id === id ? { ...op, status: "取消" } : op)))
  }

  const handleEmergencyStop = () => {
    setOperations((prev) => prev.map((op) => (op.status === "进行中" ? { ...op, status: "暂停" } : op)))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "准备":
        return "bg-blue-100 text-blue-800"
      case "进行中":
        return "bg-green-100 text-green-800"
      case "暂停":
        return "bg-yellow-100 text-yellow-800"
      case "完成":
        return "bg-gray-100 text-gray-800"
      case "取消":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getOperationIcon = (type: string) => {
    switch (type) {
      case "推送":
        return "→"
      case "牵引":
        return "←"
      case "解编":
        return "⊗"
      case "编组":
        return "⊕"
      default:
        return "•"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            调车作业
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="locomotive">调车机车</Label>
              <Select value={locomotive} onValueChange={setLocomotive}>
                <SelectTrigger>
                  <SelectValue placeholder="选择调车机车" />
                </SelectTrigger>
                <SelectContent>
                  {locomotives.map((loco) => (
                    <SelectItem key={loco} value={loco}>
                      {loco}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="operation-type">作业类型</Label>
              <Select value={operationType} onValueChange={setOperationType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择作业类型" />
                </SelectTrigger>
                <SelectContent>
                  {operationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}作业
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-track">起始轨道</Label>
              <Select value={fromTrack} onValueChange={setFromTrack}>
                <SelectTrigger>
                  <SelectValue placeholder="选择起始轨道" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((track) => (
                    <SelectItem key={track} value={track}>
                      {track}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="to-track">目标轨道</Label>
              <Select value={toTrack} onValueChange={setToTrack}>
                <SelectTrigger>
                  <SelectValue placeholder="选择目标轨道" />
                </SelectTrigger>
                <SelectContent>
                  {tracks.map((track) => (
                    <SelectItem key={track} value={track}>
                      {track}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="car-count">车辆数量</Label>
            <Input
              id="car-count"
              type="number"
              value={carCount}
              onChange={(e) => setCarCount(e.target.value)}
              placeholder="输入车辆数量"
              min="1"
              max="20"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleCreateOperation}
              disabled={!locomotive || !fromTrack || !toTrack || !carCount || !operationType}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="h-4 w-4 mr-2" />
              建立作业计划
            </Button>
            <Button onClick={handleEmergencyStop} variant="destructive" className="bg-red-600 hover:bg-red-700">
              <AlertTriangle className="h-4 w-4 mr-2" />
              紧急停车
            </Button>
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">快速作业模板</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setLocomotive("DJ001")
                  setFromTrack("2G")
                  setToTrack("3G")
                  setCarCount("3")
                  setOperationType("推送")
                }}
                className="bg-orange-50 border-orange-300"
              >
                2G→3G推送
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setLocomotive("DJ002")
                  setFromTrack("1G")
                  setToTrack("安全线")
                  setCarCount("5")
                  setOperationType("牵引")
                }}
                className="bg-purple-50 border-purple-300"
              >
                1G→安全线牵引
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>调车作业监控</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {operations.map((operation) => (
              <div key={operation.id} className="p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getOperationIcon(operation.type)}</span>
                    <div>
                      <h3 className="font-medium">
                        {operation.locomotive} - {operation.type}作业
                      </h3>
                      <div className="text-sm text-gray-600">
                        {operation.fromTrack} → {operation.toTrack} ({operation.cars}辆)
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(operation.status)}>{operation.status}</Badge>
                </div>

                {operation.startTime && (
                  <div className="text-xs text-gray-500 mb-3">开始时间: {operation.startTime}</div>
                )}

                <div className="flex gap-2">
                  {operation.status === "准备" && (
                    <Button
                      size="sm"
                      onClick={() => handleStartOperation(operation.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      开始
                    </Button>
                  )}

                  {operation.status === "进行中" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handlePauseOperation(operation.id)}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Square className="h-3 w-3 mr-1" />
                        暂停
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteOperation(operation.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        完成
                      </Button>
                    </>
                  )}

                  {operation.status === "暂停" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleStartOperation(operation.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        继续
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCompleteOperation(operation.id)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        完成
                      </Button>
                    </>
                  )}

                  {(operation.status === "准备" || operation.status === "暂停") && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelOperation(operation.id)}
                      className="bg-red-50 border-red-300 text-red-700"
                    >
                      取消
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {operations.length === 0 && <div className="text-center text-gray-500 py-8">暂无调车作业</div>}
          </div>

          <div className="mt-6">
            <h4 className="font-medium mb-3">作业统计</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {operations.filter((op) => op.status === "进行中").length}
                </div>
                <div className="text-sm text-green-700">进行中</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {operations.filter((op) => op.status === "准备").length}
                </div>
                <div className="text-sm text-blue-700">准备中</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xl font-bold text-gray-600">
                  {operations.filter((op) => op.status === "完成").length}
                </div>
                <div className="text-sm text-gray-700">已完成</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
