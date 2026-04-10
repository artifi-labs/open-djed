"use client"

import * as React from "react"
import ButtonIcon from "../ButtonIcon"
import {
  type TokenActionState,
  type TokenActionStateConfig,
} from "@/hooks/dashboard/useMintBurnAction.types"
import Checkbox from "@/components/Checkbox"
import ValueShowcase from "@/components/dashboard/ValueShowcase"
import TransactionInput from "@/components/input-fields/TransactionInput"
import type { ActionType } from "@/types/action"

export type InputSectionProps = {
  label: string
  action: ActionType
  state: TokenActionStateConfig
}

export type TransactionInputGroupProps = {
  state: TokenActionStateConfig
}

const TransactionInputGroup: React.FC<TransactionInputGroupProps> = ({
  state,
}) => {
  const renderInput = (
    state: TokenActionStateConfig,
    input: TokenActionState,
  ) => {
    return input.token === "ADA" ? (
      <ValueShowcase
        asset={{
          coin: input.token,
          coins: state.tokens,
          size: "small",
          checked: false,
          hasLeadingIcon: false,
          onCoinChange: input.onTokenChange,
        }}
        value={input.value}
        suffix={input.suffix}
        availableAmount={input.available?.toString()}
        hasAvailableAmount={input.available !== undefined}
      />
    ) : (
      <div className="relative flex-1">
        <TransactionInput
          disabled={input.disabled}
          placeholder="0"
          asset={{
            coin: input.token,
            coins: state.tokens,
            size: "small",
            checked: false,
            hasLeadingIcon: !state.dual.isDualSelected,
            onCoinChange: input.onTokenChange,
          }}
          assetIcon="Switch"
          value={input.value.toString()} // TODO: CHANGE THIS TO NUMBER
          suffix={input.suffix}
          onValueChange={(v) => input.onChange?.(Number(v))}
          availableAmount={input.available?.toString()}
          hasAvailableAmount={input.available !== undefined}
          onHalfClick={input.onHalfClick}
          onMaxClick={input.onMaxClick}
          hasMaxAndHalfActions={true}
          maxAmount={input.max}
          status={input.status}
          maxValue={Number.MAX_SAFE_INTEGER}
          maxDecimalPlaces={4}
        />
        {input.message?.message && (
          <span className="text-xxs absolute -bottom-18 left-0">
            {input.message.message}
          </span>
        )}
      </div>
    )
  }

  // TODO: CHECK THIS
  if (!state.dual.isDualSelected && state.inputs.length === 1) {
    return renderInput(state, state.inputs[0])
  }

  return (
    <div className="flex gap-8">
      {state.inputs.map((input, index) => {
        return (
          <React.Fragment key={index}>
            {renderInput(state, input)}

            {/* LINK BUTTON */}
            {state.inputs.length > 1 && index === 0 && (
              <ButtonIcon
                icon="Unlink"
                size="medium"
                variant="onlyIcon"
                active={state.dual.isLinkSelected}
                onClick={state.dual.onLinkChange}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

const InputSection: React.FC<InputSectionProps> = ({
  label,
  action,
  state,
}) => {
  return (
    <div className="flex w-full flex-col gap-12">
      <div className="flex justify-between">
        <p className="text-xxs text-secondary font-medium">{label}</p>

        {!state.dual.disabled && (
          <div className="flex items-center gap-8">
            <Checkbox
              size={24}
              order={["Deselected", "Selected"]}
              defaultType={
                state.dual.isDualSelected ? "Selected" : "Deselected"
              }
              onClick={state.dual.onDualChange}
            />
            <p className="text-secondary text-xxs font-medium">
              {`${action} both (DJED & SHEN)`}
            </p>
          </div>
        )}
      </div>

      <TransactionInputGroup state={state} />
    </div>
  )
}

export default InputSection
