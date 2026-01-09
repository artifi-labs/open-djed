"use client"

import { useState } from "react"
import Button from "@/components/Button"
import Modal from "@/components/modals/Modal"
import SimulatorInfo from "@/components/SimulatorInfo"
import Results from "@/components/simulator/Results"
import InputAction from "@/components/simulator/InputAction"
import { useSimulatorActions } from './useSimulatorActions';

export default function Simulator() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { inputs, onUpdate } = useSimulatorActions()

  return (
    <div className="desktop:pt-32 desktop:pb-64 mx-auto w-full max-w-280 pt-16 pb-16">
      {/* Header */}
      <div className="desktop:flex-row desktop:items-end flex flex-col justify-between gap-12">
        <div className="desktop:gap-6 flex flex-col gap-4">
          <h2 className="text font-bold">SHEN Yield Simulator</h2>
          <span className="text-secondary text-sm">
            Check the yield outcomes quickly and clearly
          </span>
        </div>

        <div className="desktop:pb-0 pb-16">
          <Button
            variant="text"
            size="medium"
            text="What is a yield simulator?"
            onClick={() => setIsModalOpen(true)}
          />
        </div>
      </div>

      {/* Modal */}
      <Modal
        title="What is a yield simulator?"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <SimulatorInfo />
      </Modal>

      {/* Content */}
      <div className="desktop:flex-row desktop:gap-24 desktop:pt-32 flex flex-col gap-16 pt-16">
        <InputAction values={inputs} onUpdate={onUpdate} />
        <Results inputs={inputs} />
      </div>
    </div>
  )
}
