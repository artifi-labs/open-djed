type DropdownSetting = {
  type: "dropdown"
  key: string
  label: string
  items: { key: string; text: string }[]
  current: { key: string; text: string } | undefined
  onChange: (value: string) => void
}

export type Setting = DropdownSetting
