"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"

interface SwitchDevice {
  id: string
  name: string
  position: "定位" | "反位"
  locked: boolean
  blocked: boolean
  fault: boolean
}

interface SwitchControlProps {
  switchStates?: Record<string, { position: "定位" | "反位"; locked: boolean; blocked: boolean; fault: boolean }>
  onSwitchStatesChange?: (
    states: Record<string, { position: "定位" | "反位"; locked: boolean; blocked: boolean; fault: boolean }>,
  ) => void
}

export function SwitchControl({ switchStates = {}, onSwitchStatesChange }: SwitchControlProps) {
  // Updated switches to match the diagram
  const switches: SwitchDevice[] = [
    {
      id: "1",
      name: "1#道岔",
      ...(switchStates["1"] || { position: "定位", locked: false, blocked: false, fault: false }),
    },
    {
      id: "3",
      name: "3#道岔",
      ...(switchStates["3"] || { position: "定位", locked: false, blocked: false, fault: false }),
    },
    {
      id: "4",
      name: "4#道岔",
      ...(switchStates["4"] || { position: "定位", locked: false, blocked: false, fault: false }),
    },
    {
      id: "2",
      name: "2#道岔",
      ...(switchStates["2"] || { position: "定位", locked: false, blocked: false, fault: false }),
    },
    {
      id: "5",
      name: "5#道岔",
      ...(switchStates["5"] || { position: "定位", locked: false, blocked: false, fault: false }),
    },
  ]

  const handleSwitchPosition = (id: string) => {
    if (!onSwitchStatesChange) return

    const currentState = switchStates[id]
    if (currentState && (currentState.locked || currentState.blocked || currentState.fault)) return

    onSwitchStatesChange({
      ...switchStates,
      [id]: {
        ...currentState,
        position: currentState?.position === "定位" ? "反位" : "定位",
      },
    })
  }

  const handleLock = (id: string) => {
    if (!onSwitchStatesChange) return

    const currentState = switchStates[id]
    if (currentState?.fault) return

    onSwitchStatesChange({
      ...switchStates,
      [id]: {
        ...currentState,
        locked: !currentState?.locked,
      },
    })
  }

  const handleBlock = (id: string) => {
    if (!onSwitchStatesChange) return

    const currentState = switchStates[id]
    if (currentState?.fault) return

    onSwitchStatesChange({
      ...switchStates,
      [id]: {
        ...currentState,
        blocked: !currentState?.blocked,
      },
    })
  }

  const getStatusColor = (sw: SwitchDevice) => {
    if (sw.fault) return "bg-red-100 border-red-300"
    if (sw.blocked) return "bg-orange-100 border-orange-300"
    if (sw.locked) return "bg-yellow-100 border-yellow-300"
    return "bg-green-100 border-green-300"
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>道岔控制面板</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {switches.map((sw) => (
              <div key={sw.id} className={`p-4 rounded-lg border-2 ${getStatusColor(sw)}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{sw.name}</h3>
                  <div className="flex gap-2">
                    {sw.fault && <Badge variant="destructive">故障</Badge>}
                    {sw.blocked && <Badge variant="secondary">封锁</Badge>}
                    {sw.locked && <Badge variant="outline">锁定</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">当前位置</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={sw.position === "定位" ? "default" : "secondary"}>{sw.position}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSwitchPosition(sw.id)}
                      disabled={sw.locked || sw.blocked || sw.fault}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      转换位置
                    </Button>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleLock(sw.id)}
                    disabled={sw.fault}
                    className={sw.locked ? "bg-yellow-50 border-yellow-300" : ""}
                  >
                    {sw.locked ? "解锁" : "单锁"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBlock(sw.id)}
                    disabled={sw.fault}
                    className={sw.blocked ? "bg-orange-50 border-orange-300" : ""}
                  >
                    {sw.blocked ? "解封" : "封锁"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>道岔状态统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {switches.filter((sw) => !sw.fault && !sw.blocked).length}
                </div>
                <div className="text-sm text-green-700">正常道岔</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{switches.filter((sw) => sw.fault).length}</div>
                <div className="text-sm text-red-700">故障道岔</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{switches.filter((sw) => sw.locked).length}</div>
                <div className="text-sm text-yellow-700">锁定道岔</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{switches.filter((sw) => sw.blocked).length}</div>
                <div className="text-sm text-orange-700">封锁道岔</div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">位置统计</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>定位道岔</span>
                  <Badge>{switches.filter((sw) => sw.position === "定位").length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>反位道岔</span>
                  <Badge>{switches.filter((sw) => sw.position === "反位").length}</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
