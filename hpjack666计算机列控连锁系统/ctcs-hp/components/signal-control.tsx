"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface SignalDevice {
  id: string
  name: string
  aspect: "红灯" | "绿灯" | "黄灯" | "双黄灯"
  type: "进站" | "出站" | "通过" | "调车"
  locked: boolean
  fault: boolean
}

interface SignalControlProps {
  signalStates?: Record<string, { aspect: "红灯" | "绿灯" | "黄灯" | "双黄灯"; locked: boolean; fault: boolean }>
  onSignalStatesChange?: (
    states: Record<string, { aspect: "红灯" | "绿灯" | "黄灯" | "双黄灯"; locked: boolean; fault: boolean }>,
  ) => void
}

export function SignalControl({ signalStates = {}, onSignalStatesChange }: SignalControlProps) {
  // Updated signals to match the diagram
  const signals: SignalDevice[] = [
    // Upper track signals
    {
      id: "S3",
      name: "S3信号机",
      type: "出站",
      ...(signalStates["S3"] || { aspect: "红灯", locked: false, fault: false }),
    },
    {
      id: "X3",
      name: "X3信号机",
      type: "进站",
      ...(signalStates["X3"] || { aspect: "红灯", locked: false, fault: false }),
    },
    // Middle track signals
    {
      id: "X",
      name: "X信号机",
      type: "进站",
      ...(signalStates["X"] || { aspect: "红灯", locked: false, fault: false }),
    },
    {
      id: "D1",
      name: "D1信号机",
      type: "调车",
      ...(signalStates["D1"] || { aspect: "红灯", locked: false, fault: false }),
    },
    {
      id: "SII",
      name: "SII信号机",
      type: "出站",
      ...(signalStates["SII"] || { aspect: "红灯", locked: false, fault: false }),
    },
    {
      id: "XII",
      name: "XII信号机",
      type: "进站",
      ...(signalStates["XII"] || { aspect: "红灯", locked: false, fault: false }),
    },
    {
      id: "D2",
      name: "D2信号机",
      type: "调车",
      ...(signalStates["D2"] || { aspect: "红灯", locked: false, fault: false }),
    },
    {
      id: "S",
      name: "S信号机",
      type: "出站",
      ...(signalStates["S"] || { aspect: "红灯", locked: false, fault: false }),
    },
    // Lower track signals
    {
      id: "S1",
      name: "S1信号机",
      type: "出站",
      ...(signalStates["S1"] || { aspect: "绿灯", locked: false, fault: false }),
    },
    {
      id: "X1",
      name: "X1信号机",
      type: "进站",
      ...(signalStates["X1"] || { aspect: "红灯", locked: false, fault: false }),
    },
  ]

  const handleSignalAspect = (id: string, aspect: SignalDevice["aspect"]) => {
    if (!onSignalStatesChange) return

    const currentState = signalStates[id]
    if (currentState && (currentState.locked || currentState.fault)) return

    onSignalStatesChange({
      ...signalStates,
      [id]: {
        ...currentState,
        aspect,
      },
    })
  }

  const handleLock = (id: string) => {
    if (!onSignalStatesChange) return

    const currentState = signalStates[id]
    if (currentState?.fault) return

    onSignalStatesChange({
      ...signalStates,
      [id]: {
        ...currentState,
        locked: !currentState?.locked,
      },
    })
  }

  const getAspectColor = (aspect: string) => {
    switch (aspect) {
      case "红灯":
        return "bg-red-500"
      case "绿灯":
        return "bg-green-500"
      case "黄灯":
        return "bg-yellow-500"
      case "双黄灯":
        return "bg-yellow-400"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (sig: SignalDevice) => {
    if (sig.fault) return "bg-red-100 border-red-300"
    if (sig.locked) return "bg-yellow-100 border-yellow-300"
    return "bg-green-100 border-green-300"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>信号机控制面板</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {signals.map((sig) => (
              <div key={sig.id} className={`p-3 rounded-lg border-2 ${getStatusColor(sig)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-sm">{sig.name}</h3>
                    <Badge variant="outline" className="text-xs mt-1">
                      {sig.type}信号机
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full ${getAspectColor(sig.aspect)}`}></div>
                    <span className="text-xs font-medium">{sig.aspect}</span>
                  </div>
                </div>

                <div className="flex gap-1 mb-2">
                  {sig.fault && (
                    <Badge variant="destructive" className="text-xs">
                      故障
                    </Badge>
                  )}
                  {sig.locked && (
                    <Badge variant="outline" className="text-xs">
                      锁定
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleSignalAspect(sig.id, "绿灯")}
                    disabled={sig.locked || sig.fault}
                    className="bg-green-600 hover:bg-green-700 text-xs h-7"
                  >
                    开放
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSignalAspect(sig.id, "红灯")}
                    disabled={sig.locked || sig.fault}
                    className="bg-red-600 hover:bg-red-700 text-xs h-7"
                  >
                    关闭
                  </Button>
                </div>

                {sig.type !== "调车" && (
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSignalAspect(sig.id, "黄灯")}
                      disabled={sig.locked || sig.fault}
                      className="bg-yellow-50 border-yellow-300 text-xs h-7"
                    >
                      引导
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLock(sig.id)}
                      disabled={sig.fault}
                      className={`text-xs h-7 ${sig.locked ? "bg-yellow-50 border-yellow-300" : ""}`}
                    >
                      {sig.locked ? "解锁" : "锁定"}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>信号机状态统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {signals.filter((sig) => sig.aspect === "绿灯").length}
                </div>
                <div className="text-sm text-green-700">开放信号</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {signals.filter((sig) => sig.aspect === "红灯").length}
                </div>
                <div className="text-sm text-red-700">关闭信号</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {signals.filter((sig) => sig.aspect === "黄灯" || sig.aspect === "双黄灯").length}
                </div>
                <div className="text-sm text-yellow-700">注意信号</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{signals.filter((sig) => sig.fault).length}</div>
                <div className="text-sm text-gray-700">故障信号</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">信号机类型</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>进站信号机</span>
                  <Badge>{signals.filter((sig) => sig.type === "进站").length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>出站信号机</span>
                  <Badge>{signals.filter((sig) => sig.type === "出站").length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>调车信号机</span>
                  <Badge>{signals.filter((sig) => sig.type === "调车").length}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
