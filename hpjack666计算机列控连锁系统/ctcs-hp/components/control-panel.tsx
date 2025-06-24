"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ControlPanelProps {
  type: "shunting" | "general"
}

export function ControlPanel({ type }: ControlPanelProps) {
  if (type === "shunting") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Button className="bg-orange-600 hover:bg-orange-700">调车进路建立</Button>
          <Button className="bg-purple-600 hover:bg-purple-700">调车信号开放</Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="bg-yellow-50 border-yellow-300">
            调车作业暂停
          </Button>
          <Button variant="outline" className="bg-red-50 border-red-300">
            调车作业取消
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">当前调车作业</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-600">
              <div>作业区域: 2G-3G</div>
              <div>调车机车: DJ001</div>
              <div>作业状态: 进行中</div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <Button>控制1</Button>
        <Button>控制2</Button>
        <Button>控制3</Button>
      </div>
    </div>
  )
}
