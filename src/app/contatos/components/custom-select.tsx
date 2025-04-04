"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Selecione",
  className = "",
}: CustomSelectProps) {
  const [internalValue, setInternalValue] = useState(value)

  // Sincroniza o valor interno quando o valor externo muda
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  const handleChange = (newValue: string) => {
    setInternalValue(newValue)
    onChange(newValue)
  }

  return (
    <Select value={internalValue} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}