"use client"
import InputField, { type InputFieldProps } from "./InputField"
import { type FC } from "react"

type AtLeastOneIdOrName =
  | { id: string; name?: string }
  | { name: string; id?: string }

export type SearchInputProps = Omit<
  InputFieldProps,
  "leadingIcon" | "iconSize"
> &
  AtLeastOneIdOrName

const SearchInput: FC<SearchInputProps> = ({ ...props }) => {
  return <InputField leadingIcon="Search" {...props} />
}

export default SearchInput
