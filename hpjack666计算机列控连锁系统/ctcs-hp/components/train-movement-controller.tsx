"use client"

import type React from "react"
import { useEffect } from "react"

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

interface TrainMovementControllerProps {
  onTrainsUpdate: React.Dispatch<React.SetStateAction<Train[]>>
  operations: Array<{
    id: number
    trainNumber: string
    operation: string
    startSignal: string
    endSignal: string
    status: string
    time: string
  }>
}

export function TrainMovementController({ onTrainsUpdate, operations }: TrainMovementControllerProps) {
  useEffect(() => {
    // This controller is now simplified since path planning is handled in the main component
    const activeOperations = operations.filter((op) => op.status === "执行中")

    onTrainsUpdate((prevTrains) =>
      prevTrains.map((train) => {
        const operation = activeOperations.find((op) => op.trainNumber === train.id)
        if (operation) {
          return { ...train, isMoving: true, speed: 2 }
        }
        return { ...train, isMoving: false, speed: 0 }
      }),
    )
  }, [operations, onTrainsUpdate])

  return null
}
