"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrackLayout } from "@/components/track-layout";
import { SimulationPanel } from "@/components/simulation-panel";
import { TrainOperations } from "@/components/train-operations";
import { SwitchControl } from "@/components/switch-control";
import { SignalControl } from "@/components/signal-control";
import { ShuntingControl } from "@/components/shunting-control";

export default function RailwayInterlockingSystem() {
  const [systemStatus, setSystemStatus] = useState("正常运行");
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null); // 初始化为 null
  const [trainOperations, setTrainOperations] = useState<
    Array<{
      id: number;
      trainNumber: string;
      operation: string;
      startSignal: string;
      endSignal: string;
      status: string;
      time: string;
    }>
  >([]);

  const [switchStates, setSwitchStates] = useState<
    Record<
      string,
      {
        position: "定位" | "反位";
        locked: boolean;
        blocked: boolean;
        fault: boolean;
      }
    >
  >({
    "1": { position: "定位", locked: false, blocked: false, fault: false },
    "2": { position: "定位", locked: false, blocked: false, fault: false },
    "3": { position: "定位", locked: false, blocked: false, fault: false },
    "4": { position: "定位", locked: false, blocked: false, fault: false },
  });

  const [signalStates, setSignalStates] = useState<
    Record<
      string,
      {
        aspect: "红灯" | "绿灯" | "黄灯" | "双黄灯";
        locked: boolean;
        fault: boolean;
      }
    >
  >({
    X3: { aspect: "红灯", locked: false, fault: false },
    S3: { aspect: "红灯", locked: false, fault: false },
    X: { aspect: "红灯", locked: false, fault: false },
    D1: { aspect: "红灯", locked: false, fault: false },
    SII: { aspect: "红灯", locked: false, fault: false },
    XII: { aspect: "红灯", locked: false, fault: false },
    D2: { aspect: "红灯", locked: false, fault: false },
    S: { aspect: "红灯", locked: false, fault: false },
    X1: { aspect: "红灯", locked: false, fault: false },
    S1: { aspect: "红灯", locked: false, fault: false },
  });

  const [simulationEvents, setSimulationEvents] = useState<
    Array<{
      id: number;
      time: string;
      event: string;
      type: string;
    }>
  >([]);

  useEffect(() => {
    setCurrentTime(new Date()); // 在客户端初始化时间
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-lg bg-blue-900 p-4 text-white">
          <div>
            <h1 className="text-2xl font-bold">铁路计算机联锁控制系统</h1>
            <p className="text-blue-200">
              Railway Computer Interlocking Control System
            </p>
          </div>
          <div className="text-right">
            {currentTime && ( // 确保 currentTime 不为 null
              <>
                <div className="text-lg font-mono">
                  {currentTime.toLocaleTimeString()}
                </div>
                <Badge
                  variant={
                    systemStatus === "正常运行" ? "default" : "destructive"
                  }
                >
                  {systemStatus}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Alerts */}
        {activeAlerts.length > 0 && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription>
              <strong>系统告警:</strong> {activeAlerts.join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Track Layout - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle>站场状态显示</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackLayout
              trainOperations={trainOperations}
              switchStates={switchStates}
              signalStates={signalStates}
              onSwitchStatesChange={setSwitchStates}
              onSignalStatesChange={setSignalStates}
              simulationEvents={simulationEvents}
            />
          </CardContent>
        </Card>

        {/* Control Tabs */}
        <Tabs defaultValue="train-ops" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="train-ops">列车作业</TabsTrigger>
            <TabsTrigger value="shunting">调车作业</TabsTrigger>
            <TabsTrigger value="switches">道岔控制</TabsTrigger>
            <TabsTrigger value="signals">信号控制</TabsTrigger>
            <TabsTrigger value="simulation">仿真控制</TabsTrigger>
          </TabsList>

          <TabsContent value="train-ops">
            <TrainOperations
              onOperationsChange={setTrainOperations}
              onTrainArrival={(operationId) => {
                console.log(`Train operation ${operationId} completed`);
              }}
            />
          </TabsContent>

          <TabsContent value="shunting">
            <ShuntingControl />
          </TabsContent>

          <TabsContent value="switches">
            <SwitchControl
              switchStates={switchStates}
              onSwitchStatesChange={setSwitchStates}
            />
          </TabsContent>

          <TabsContent value="signals">
            <SignalControl
              signalStates={signalStates}
              onSignalStatesChange={setSignalStates}
            />
          </TabsContent>

          <TabsContent value="simulation">
            <SimulationPanel onSimulationEventsChange={setSimulationEvents} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
