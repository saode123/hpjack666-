"use client"

import { useState, useEffect } from "react"

interface TrackElement {
  id: string
  type: "track" | "switch" | "signal" | "platform"
  position: { x: number; y: number }
  status: "normal" | "occupied" | "locked" | "fault"
  name: string
}

interface TrackLayoutProps {
  trainOperations?: Array<{
    id: number
    trainNumber: string
    operation: string
    startSignal: string
    endSignal: string
    status: string
    time: string
  }>
  switchStates?: Record<string, { position: "定位" | "反位"; locked: boolean; blocked: boolean; fault: boolean }>
  signalStates?: Record<string, { aspect: "红灯" | "绿灯" | "黄灯" | "双黄灯"; locked: boolean; fault: boolean }>
  onSwitchStatesChange?: (
    states: Record<string, { position: "定位" | "反位"; locked: boolean; blocked: boolean; fault: boolean }>,
  ) => void
  onSignalStatesChange?: (
    states: Record<string, { aspect: "红灯" | "绿灯" | "黄灯" | "双黄灯"; locked: boolean; fault: boolean }>,
  ) => void
  simulationEvents?: Array<{
    id: number
    time: string
    event: string
    type: string
  }>
}

interface Train {
  id: string
  position: { x: number; y: number }
  speed: number
  direction: "right" | "left"
  isMoving: boolean
  targetPosition?: { x: number; y: number }
  route?: string
  path?: Array<{ x: number; y: number }>
  pathIndex?: number
}

export function TrackLayout({
  trainOperations = [],
  switchStates = {},
  signalStates = {},
  onSwitchStatesChange,
  onSignalStatesChange,
  simulationEvents = [],
}: TrackLayoutProps) {
  const [showTextStatus, setShowTextStatus] = useState(false)

  const [trackElements, setTrackElements] = useState<TrackElement[]>([
    // Upper track (3G) signals - repositioned to middle of shortened track
    { id: "x3", type: "signal", position: { x: 500, y: 60 }, status: "normal", name: "X3" },
    { id: "s3", type: "signal", position: { x: 300, y: 60 }, status: "normal", name: "S3" },

    // Middle track signals
    { id: "x", type: "signal", position: { x: 50, y: 120 }, status: "normal", name: "X" },
    { id: "d1", type: "signal", position: { x: 100, y: 120 }, status: "normal", name: "D1" },
    { id: "sii", type: "signal", position: { x: 300, y: 120 }, status: "normal", name: "SII" },
    { id: "xii", type: "signal", position: { x: 500, y: 120 }, status: "normal", name: "XII" },
    { id: "d2", type: "signal", position: { x: 700, y: 120 }, status: "normal", name: "D2" },
    { id: "s", type: "signal", position: { x: 750, y: 120 }, status: "normal", name: "S" },

    // Lower track (1G) signals - repositioned to middle of shortened track
    { id: "x1", type: "signal", position: { x: 500, y: 180 }, status: "normal", name: "X1" },
    { id: "s1", type: "signal", position: { x: 300, y: 180 }, status: "normal", name: "S1" },

    // Switches
    { id: "sw1", type: "switch", position: { x: 150, y: 120 }, status: "normal", name: "1" },
    { id: "sw3", type: "switch", position: { x: 200, y: 120 }, status: "normal", name: "3" },
    { id: "sw4", type: "switch", position: { x: 600, y: 120 }, status: "normal", name: "4" },
    { id: "sw2", type: "switch", position: { x: 650, y: 120 }, status: "normal", name: "2" },
    { id: "sw5", type: "switch", position: { x: 235, y: 180 }, status: "normal", name: "5" },

    // Track sections
    { id: "track_upper", type: "track", position: { x: 400, y: 60 }, status: "normal", name: "3G" },
    { id: "track_middle_1", type: "track", position: { x: 20, y: 120 }, status: "normal", name: "JXG" },
    { id: "track_middle_2", type: "track", position: { x: 80, y: 120 }, status: "normal", name: "IIAG" },
    { id: "track_middle_3", type: "track", position: { x: 400, y: 120 }, status: "normal", name: "IIG" },
    { id: "track_middle_4", type: "track", position: { x: 725, y: 100 }, status: "normal", name: "IIBG" },
    { id: "track_middle_5", type: "track", position: { x: 770, y: 100 }, status: "normal", name: "JSG" },
    { id: "track_lower", type: "track", position: { x: 400, y: 180 }, status: "normal", name: "1G" },
    { id: "track_lower_2", type: "track", position: { x: 100, y: 180 }, status: "normal", name: "安全线" },
  ])

  const [trains, setTrains] = useState<Train[]>([
    { id: "G123", position: { x: 25, y: 120 }, speed: 0, direction: "right", isMoving: false },
  ])

  const [activePath, setActivePath] = useState<Array<{ x: number; y: number }>>([])
  const [occupiedTracks, setOccupiedTracks] = useState<Set<string>>(new Set())
  const [occupiedConnections, setOccupiedConnections] = useState<Set<string>>(new Set())

  // Updated signal positions mapping
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

  // Enhanced path planning function with switch validation
  const planPath = (startSignal: string, endSignal: string): Array<{ x: number; y: number }> | null => {
    const start = signalPositions[startSignal]
    const end = signalPositions[endSignal]

    if (!start || !end) return null

    const path: Array<{ x: number; y: number }> = [start]

    // Determine which tracks the signals are on
    const getTrack = (signal: string) => {
      if (["X3", "S3"].includes(signal)) return "upper"
      if (["X1", "S1"].includes(signal)) return "lower"
      return "middle"
    }

    const startTrack = getTrack(startSignal)
    const endTrack = getTrack(endSignal)

    if (startTrack === endTrack) {
      // Same track - direct path
      const y = start.y
      const steps = Math.abs(end.x - start.x) / 50
      for (let i = 1; i <= steps; i++) {
        const x = start.x + (end.x - start.x) * (i / steps)
        path.push({ x, y })
      }
    } else {
      // Different tracks - need to use switches with validation
      if (startTrack === "middle" && endTrack === "upper") {
        const switchNum = start.x < 150 ? "1" : "4"
        const switchState = switchStates[switchNum]

        if (!switchState || switchState.position === "定位") {
          alert(`需要将${switchNum}号道岔转换至反位才能通行！`)
          return null
        }

        const switchX = switchNum === "1" ? 150 : 600
        path.push({ x: switchX, y: 120 })

        if (switchNum === "1") {
          path.push({ x: 185, y: 60 })
        } else {
          path.push({ x: 575, y: 60 })
        }

        const steps = Math.abs(end.x - (switchNum === "1" ? 185 : 575)) / 50
        for (let i = 1; i <= steps; i++) {
          const startX = switchNum === "1" ? 185 : 575
          const x = startX + (end.x - startX) * (i / steps)
          path.push({ x, y: 60 })
        }
      } else if (startTrack === "upper" && endTrack === "middle") {
        const switchNum = end.x < 150 ? "1" : "4"
        const switchState = switchStates[switchNum]

        if (!switchState || switchState.position === "定位") {
          alert(`需要将${switchNum}号道岔转换至反位才能通行！`)
          return null
        }

        const switchX = switchNum === "1" ? 150 : 600

        if (switchNum === "1") {
          path.push({ x: 185, y: 60 })
        } else {
          path.push({ x: 575, y: 60 })
        }

        path.push({ x: switchX, y: 120 })

        const steps = Math.abs(end.x - switchX) / 50
        for (let i = 1; i <= steps; i++) {
          const x = switchX + (end.x - switchX) * (i / steps)
          path.push({ x, y: 120 })
        }
      } else if (startTrack === "middle" && endTrack === "lower") {
        const switchNum = start.x < 200 ? "3" : "2"
        const switchState = switchStates[switchNum]

        if (!switchState || switchState.position === "定位") {
          alert(`需要将${switchNum}号道岔转换至反位才能通行！`)
          return null
        }

        const switchX = switchNum === "3" ? 200 : 650
        path.push({ x: switchX, y: 120 })

        if (switchNum === "3") {
          path.push({ x: 235, y: 180 })
        } else {
          path.push({ x: 625, y: 180 })
        }

        const steps = Math.abs(end.x - (switchNum === "3" ? 265 : 625)) / 50
        for (let i = 1; i <= steps; i++) {
          const startX = switchNum === "3" ? 265 : 625
          const x = startX + (end.x - startX) * (i / steps)
          path.push({ x, y: 180 })
        }
      } else if (startTrack === "lower" && endTrack === "middle") {
        const switchNum = end.x < 200 ? "3" : "2"
        const switchState = switchStates[switchNum]

        if (!switchState || switchState.position === "定位") {
          alert(`需要将${switchNum}号道岔转换至反位才能通行！`)
          return null
        }

        const switchX = switchNum === "3" ? 200 : 650

        if (switchNum === "3") {
          path.push({ x: 235, y: 180 })
        } else {
          path.push({ x: 625, y: 180 })
        }

        path.push({ x: switchX, y: 120 })

        const steps = Math.abs(end.x - switchX) / 50
        for (let i = 1; i <= steps; i++) {
          const x = switchX + (end.x - switchX) * (i / steps)
          path.push({ x, y: 120 })
        }
      }
    }

    return path
  }

  // Update occupied tracks and connections based on train position
  const updateOccupancy = (trainPosition: { x: number; y: number }, path: Array<{ x: number; y: number }>) => {
    const newOccupiedTracks = new Set<string>()
    const newOccupiedConnections = new Set<string>()

    // Check which track the train is on
    if (Math.abs(trainPosition.y - 60) < 10) {
      newOccupiedTracks.add("upper")
    } else if (Math.abs(trainPosition.y - 120) < 10) {
      newOccupiedTracks.add("middle")
    } else if (Math.abs(trainPosition.y - 180) < 10) {
      newOccupiedTracks.add("lower")
    }

    // Check if train is on connection lines
    const tolerance = 15
    if (
      Math.abs(trainPosition.x - 150) < tolerance &&
      trainPosition.y > 60 &&
      trainPosition.y < 120 &&
      switchStates["1"]?.position === "反位"
    ) {
      newOccupiedConnections.add("1")
    }
    if (
      Math.abs(trainPosition.x - 200) < tolerance &&
      trainPosition.y > 120 &&
      trainPosition.y < 180 &&
      switchStates["3"]?.position === "反位"
    ) {
      newOccupiedConnections.add("3")
    }
    if (
      Math.abs(trainPosition.x - 600) < tolerance &&
      trainPosition.y > 60 &&
      trainPosition.y < 120 &&
      switchStates["4"]?.position === "反位"
    ) {
      newOccupiedConnections.add("4")
    }
    if (
      Math.abs(trainPosition.x - 650) < tolerance &&
      trainPosition.y > 120 &&
      trainPosition.y < 180 &&
      switchStates["2"]?.position === "反位"
    ) {
      newOccupiedConnections.add("2")
    }

    setOccupiedTracks(newOccupiedTracks)
    setOccupiedConnections(newOccupiedConnections)
  }

  useEffect(() => {
    const activeOperations = trainOperations.filter((op) => op.status === "执行中")

    if (activeOperations.length > 0) {
      const operation = activeOperations[0]
      const path = planPath(operation.startSignal, operation.endSignal)

      if (path) {
        // Validate signals along the route before starting movement
        const routeSignals = getSignalsAlongRoute(operation.startSignal, operation.endSignal)
        const invalidSignals = routeSignals.filter((signalName) => {
          const signalState = signalStates[signalName]
          return !signalState || signalState.aspect !== "绿灯"
        })

        if (invalidSignals.length > 0) {
          alert(`列车无法通行！以下信号机需要设置为绿灯：${invalidSignals.join(", ")}`)
          return
        }

        setActivePath(path)

        setTrains((prevTrains) => [
          {
            ...prevTrains[0],
            id: operation.trainNumber,
            isMoving: true,
            speed: 2,
            path: path,
            pathIndex: 0,
            position: path[0] || prevTrains[0].position,
          },
        ])
      }
    } else {
      setActivePath([])
      setOccupiedTracks(new Set())
      setOccupiedConnections(new Set())
      setTrains((prevTrains) => [
        {
          ...prevTrains[0],
          isMoving: false,
          speed: 0,
          path: undefined,
          pathIndex: undefined,
        },
      ])
    }
  }, [trainOperations, switchStates, signalStates])

  // Add function to get signals along route
  const getSignalsAlongRoute = (startSignal: string, endSignal: string): string[] => {
    const signals = []

    // Always include start and end signals
    signals.push(startSignal)
    if (startSignal !== endSignal) {
      signals.push(endSignal)
    }

    // Determine which tracks the signals are on
    const getTrack = (signal: string) => {
      if (["X3", "S3"].includes(signal)) return "upper"
      if (["X1", "S1"].includes(signal)) return "lower"
      return "middle"
    }

    const startTrack = getTrack(startSignal)
    const endTrack = getTrack(endSignal)

    // Add intermediate signals based on route
    if (startTrack !== endTrack) {
      // Cross-track movement - add relevant intermediate signals
      if (startTrack === "middle" && endTrack === "upper") {
        // Check if we need D1 signal for switch area
        if (signalPositions[startSignal].x < 150) {
          signals.push("D1")
        }
      } else if (startTrack === "middle" && endTrack === "lower") {
        // Check if we need D2 signal for switch area
        if (signalPositions[startSignal].x > 600) {
          signals.push("D2")
        }
      }
    } else if (startTrack === "middle") {
      // Same track movement on middle line - add intermediate signals
      const startX = signalPositions[startSignal].x
      const endX = signalPositions[endSignal].x

      if (startX < endX) {
        // Moving right
        if (startX < 200 && endX > 200) signals.push("D1")
        if (startX < 300 && endX > 300) signals.push("SII")
        if (startX < 500 && endX > 500) signals.push("XII")
        if (startX < 700 && endX > 700) signals.push("D2")
      } else {
        // Moving left
        if (startX > 700 && endX < 700) signals.push("D2")
        if (startX > 500 && endX < 500) signals.push("XII")
        if (startX > 300 && endX < 300) signals.push("SII")
        if (startX > 200 && endX < 200) signals.push("D1")
      }
    }

    return [...new Set(signals)] // Remove duplicates
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setTrains((prevTrains) =>
        prevTrains.map((train) => {
          if (train.isMoving && train.path && train.pathIndex !== undefined) {
            // Check signals before moving to next position
            const currentOperation = trainOperations.find((op) => op.trainNumber === train.id && op.status === "执行中")
            if (currentOperation) {
              const routeSignals = getSignalsAlongRoute(currentOperation.startSignal, currentOperation.endSignal)
              const nearbySignals = getNearbySignals(train.position)

              // Check if any nearby signals are not green
              const blockedSignals = nearbySignals.filter((signalName) => {
                const signalState = signalStates[signalName]
                return routeSignals.includes(signalName) && (!signalState || signalState.aspect !== "绿灯")
              })

              if (blockedSignals.length > 0) {
                alert(`列车${train.id}前方信号机显示停车信号！需要将以下信号机设置为绿灯：${blockedSignals.join(", ")}`)
                return {
                  ...train,
                  isMoving: false,
                  speed: 0,
                }
              }
            }

            const nextIndex = train.pathIndex + 1
            if (nextIndex < train.path.length) {
              const newPosition = train.path[nextIndex]
              updateOccupancy(newPosition, train.path)
              return {
                ...train,
                position: newPosition,
                pathIndex: nextIndex,
              }
            } else {
              setOccupiedTracks(new Set())
              setOccupiedConnections(new Set())
              return {
                ...train,
                isMoving: false,
                speed: 0,
              }
            }
          }
          return train
        }),
      )
    }, 200)

    return () => clearInterval(interval)
  }, [switchStates, signalStates, trainOperations])

  // Add function to get nearby signals
  const getNearbySignals = (position: { x: number; y: number }): string[] => {
    const nearbySignals = []
    const checkDistance = 80 // Distance to check for signals ahead

    Object.entries(signalPositions).forEach(([signalName, signalPos]) => {
      const distance = Math.sqrt(Math.pow(signalPos.x - position.x, 2) + Math.pow(signalPos.y - position.y, 2))

      // Check if signal is ahead in the direction of travel and within check distance
      if (distance <= checkDistance && signalPos.x >= position.x - 20) {
        // Only include signals on the same track level
        if (Math.abs(signalPos.y - position.y) < 15) {
          nearbySignals.push(signalName)
        }
      }
    })

    return nearbySignals
  }

  // Handle signal click
  const handleSignalClick = (signalName: string) => {
    if (!onSignalStatesChange) return

    const currentState = signalStates[signalName]
    if (currentState?.locked || currentState?.fault) return

    const currentAspect = currentState?.aspect || "红灯"
    let nextAspect: "红灯" | "绿灯" | "黄灯" | "双黄灯"

    switch (currentAspect) {
      case "红灯":
        nextAspect = "绿灯"
        break
      case "绿灯":
        nextAspect = "黄灯"
        break
      case "黄灯":
        nextAspect = "双黄灯"
        break
      case "双黄灯":
        nextAspect = "红灯"
        break
      default:
        nextAspect = "红灯"
    }

    onSignalStatesChange({
      ...signalStates,
      [signalName]: {
        ...currentState,
        aspect: nextAspect,
      },
    })
  }

  // Handle switch click
  const handleSwitchClick = (switchName: string) => {
    if (!onSwitchStatesChange) return

    const currentState = switchStates[switchName]
    if (currentState?.locked || currentState?.blocked || currentState?.fault) return

    onSwitchStatesChange({
      ...switchStates,
      [switchName]: {
        ...currentState,
        position: currentState?.position === "定位" ? "反位" : "定位",
      },
    })
  }

  const getSignalColor = (signalName: string) => {
    const signalState = signalStates[signalName]
    if (!signalState) return "#808080"

    if (signalState.fault) return "#808080"

    switch (signalState.aspect) {
      case "绿灯":
        return "#00ff00"
      case "红灯":
        return "#ff0000"
      case "黄灯":
        return "#ffff00"
      case "双黄灯":
        return "#ffaa00"
      default:
        return "#808080"
    }
  }

  const getSwitchColor = (switchName: string) => {
    const switchState = switchStates[switchName]
    if (!switchState) return "#ffffff"

    if (switchState.fault) return "#ff0000"
    if (switchState.blocked) return "#ff8800"
    if (switchState.locked) return "#ffff00"
    return "#ffffff"
  }

  const getSwitchPosition = (switchName: string) => {
    const switchState = switchStates[switchName]
    return switchState?.position || "定位"
  }

  const getTrackColor = (trackType: string) => {
    if (occupiedTracks.has(trackType)) {
      return "#ff0000" // Red for occupied
    }
    return "#0066ff" // Blue for idle
  }

  const getConnectionColor = (switchName: string) => {
    const switchState = switchStates[switchName]
    if (!switchState) return "#ffffff"

    if (occupiedConnections.has(switchName)) {
      return "#ff0000" // Red for occupied
    }

    if (switchState.position === "反位") {
      return "#0066ff" // Blue for idle when in reverse position
    } else {
      return "#ffffff" // White for locked when in normal position
    }
  }

  const getElementColor = (status: string, type: string, name: string) => {
    if (type === "signal") {
      return getSignalColor(name)
    }
    if (type === "switch") {
      return getSwitchColor(name)
    }
    if (type === "track") {
      return "#0066ff" // Default blue for tracks (handled separately)
    }
    return "#808080"
  }

  const handleElementClick = (element: TrackElement) => {
    if (element.type === "signal") {
      handleSignalClick(element.name)
    } else if (element.type === "switch") {
      handleSwitchClick(element.name)
    }
  }

  return (
    <div className="relative w-full h-96 bg-black rounded-lg overflow-hidden">
      {/* 添加显示文本状态按钮 */}
      <button
        className="absolute top-2 left-2 bg-blue-500 text-white p-2 rounded text-xs"
        onClick={() => setShowTextStatus(!showTextStatus)}
      >
        {showTextStatus ? "隐藏状态文本" : "显示状态文本"}
      </button>

      <svg width="100%" height="100%" viewBox="0 0 800 240">
        {/* Upper track line (3G) - shortened from switch 1 to switch 4 connection points */}
        <line x1="185" y1="60" x2="575" y2="60" stroke={getTrackColor("upper")} strokeWidth="3" />

        {/* Middle track line (main) - full length */}
        <line x1="20" y1="120" x2="780" y2="120" stroke={getTrackColor("middle")} strokeWidth="3" />

        {/* Lower track line (1G) - shortened from switch 3 to switch 2 connection points */}
        <line x1="100" y1="180" x2="625" y2="180" stroke={getTrackColor("lower")} strokeWidth="3" />

        {/* Switch connections - rotated diagonal lines with dynamic colors */}
        {/* Switch 1: Middle to Upper - 45° clockwise rotation */}
        <line x1="150" y1="120" x2="185" y2="60" stroke={getConnectionColor("1")} strokeWidth="3" />

        {/* Switch 3: Middle to Lower - 45° counter-clockwise rotation */}
        <line x1="200" y1="120" x2="235" y2="180" stroke={getConnectionColor("3")} strokeWidth="3" />

        {/* Switch 4: Middle to Upper - 45° counter-clockwise rotation */}
        <line x1="600" y1="120" x2="575" y2="60" stroke={getConnectionColor("4")} strokeWidth="3" />

        {/* Switch 2: Middle to Lower - 45° clockwise rotation */}
        <line x1="650" y1="120" x2="625" y2="180" stroke={getConnectionColor("2")} strokeWidth="3" />

        {/* Active path visualization */}
        {activePath.length > 1 && (
          <g>
            {activePath.map((point, index) => {
              if (index === activePath.length - 1) return null
              const nextPoint = activePath[index + 1]
              return (
                <line
                  key={index}
                  x1={point.x}
                  y1={point.y}
                  x2={nextPoint.x}
                  y2={nextPoint.y}
                  stroke="#00ffff"
                  strokeWidth="4"
                  opacity="0.7"
                  strokeDasharray="5,5"
                >
                  <animate attributeName="stroke-dashoffset" values="0;10" dur="1s" repeatCount="indefinite" />
                </line>
              )
            })}
          </g>
        )}

        {/* Track elements */}
        {trackElements.map((element) => (
          <g key={element.id}>
            {element.type === "signal" && (
              <g>
                <circle
                  cx={element.position.x}
                  cy={element.position.y}
                  r="6"
                  fill={getElementColor(element.status, element.type, element.name)}
                  stroke="#000"
                  strokeWidth="1"
                  className="cursor-pointer hover:stroke-white hover:stroke-2"
                  onClick={() => handleElementClick(element)}
                />
                <text
                  x={element.position.x}
                  y={element.position.y - 12}
                  fill="#ffffff"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {element.name}
                </text>
                {/* 根据状态决定是否显示信号灯状态文本 */}
                {showTextStatus && signalStates[element.name] && (
                  <text
                    x={element.position.x}
                    y={element.position.y + 20}
                    fill="#ffffff"
                    fontSize="7"
                    textAnchor="middle"
                  >
                    {signalStates[element.name].aspect}
                  </text>
                )}
              </g>
            )}

            {element.type === "switch" && (
              <g>
                <rect
                  x={element.position.x - 8}
                  y={element.position.y - 4}
                  width="16"
                  height="8"
                  fill={getElementColor(element.status, element.type, element.name)}
                  stroke="#000"
                  strokeWidth="1"
                  className="cursor-pointer hover:stroke-white hover:stroke-2"
                  onClick={() => handleElementClick(element)}
                />
                <text
                  x={element.position.x}
                  y={element.position.y - 12}
                  fill="#ffffff"
                  fontSize="10"
                  textAnchor="middle"
                >
                  {element.name}
                </text>
                {/* 根据状态决定是否显示道岔位置文本 */}
                {showTextStatus && switchStates[element.name] && (
                  <text
                    x={element.position.x}
                    y={element.position.y + 20}
                    fill="#ffffff"
                    fontSize="7"
                    textAnchor="middle"
                  >
                    {switchStates[element.name].position}
                  </text>
                )}
                {/* Switch indicator based on position */}
                {switchStates[element.name] && getSwitchPosition(element.name) === "反位" && (
                  <circle cx={element.position.x} cy={element.position.y} r="3" fill="#ffff00" opacity="0.8" />
                )}
              </g>
            )}

            {element.type === "track" && (
              <g>
                <text
                  x={element.position.x}
                  y={element.position.y + 15}
                  fill="#ffffff"
                  fontSize="8"
                  textAnchor="middle"
                >
                  {element.name}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* Train */}
        {trains.map((train) => (
          <g key={train.id}>
            <rect
              x={train.position.x - 12}
              y={train.position.y - 6}
              width="24"
              height="12"
              fill={train.isMoving ? "#00aa00" : "#0066cc"}
              stroke="#ffffff"
              strokeWidth="1"
            />
            <text x={train.position.x} y={train.position.y + 2} fill="#ffffff" fontSize="8" textAnchor="middle">
              {train.id}
            </text>

            {train.isMoving && (
              <>
                <circle cx={train.position.x + 15} cy={train.position.y} r="2" fill="#ffff00" opacity="0.8">
                  <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1s" repeatCount="indefinite" />
                </circle>

                <text x={train.position.x} y={train.position.y - 15} fill="#00ff00" fontSize="7" textAnchor="middle">
                  运行中
                </text>
              </>
            )}
          </g>
        ))}

        {/* Simulation event indicators */}
        {simulationEvents.slice(0, 3).map((event, index) => (
          <g key={event.id}>
            <rect x={20 + index * 200} y={220} width={180} height={15} fill="rgba(0, 0, 0, 0.8)" rx="3" />
            <text x={25 + index * 200} y={230} fill="#ffffff" fontSize="8" textAnchor="start">
              {event.time} - {event.event.substring(0, 20)}...
            </text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="absolute top-2 right-2 bg-gray-800 p-2 rounded text-white text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>轨道空闲</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>轨道占用</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-white rounded-full"></div>
          <span>道岔闭锁</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
          <span>运行轨迹</span>
        </div>
      </div>

      {/* Interactive instructions */}
      <div className="absolute bottom-2 left-2 bg-gray-800 p-2 rounded text-white text-xs">
        <div>点击信号灯切换状态</div>
        <div>点击道岔切换正反位</div>
      </div>
    </div>
  )
}
