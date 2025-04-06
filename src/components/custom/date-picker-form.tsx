"use client"

import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerFormProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  disabled?: boolean
  className?: string
}

export function DatePickerForm({
  date,
  setDate,
  disabled = false,
  className,
}: DatePickerFormProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          disabled={disabled}
          className={cn(
            "w-full pl-3 text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          {date ? (
            format(date, "PPP", { locale: ptBR })
          ) : (
            <span>Selecione uma data</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={disabled}
          initialFocus
          locale={ptBR}
        />
      </PopoverContent>
    </Popover>
  )
}

export function DateTimePickerForm({
  date,
  setDate,
  disabled = false,
  className,
}: DatePickerFormProps) {
  const [selectedTime, setSelectedTime] = React.useState<string>(
    date ? format(date, "HH:mm") : ""
  )

  // Atualiza o tempo quando a data mudar
  React.useEffect(() => {
    if (date) {
      setSelectedTime(format(date, "HH:mm"))
    }
  }, [date])

  // Atualiza a data quando o tempo mudar
  const handleTimeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSelectedTime(e.target.value)
      
      if (!date) return
      
      const [hours, minutes] = e.target.value.split(":").map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours || 0)
      newDate.setMinutes(minutes || 0)
      setDate(newDate)
    },
    [date, setDate]
  )

  // Atualiza a hora quando a data mudar
  const handleDateChange = React.useCallback(
    (newDate: Date | undefined) => {
      if (!newDate) {
        setDate(undefined)
        return
      }

      if (date && selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number)
        newDate.setHours(hours || 0)
        newDate.setMinutes(minutes || 0)
      }
      
      setDate(newDate)
    },
    [date, selectedTime, setDate]
  )

  return (
    <div className="flex gap-2">
      <div className="flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              disabled={disabled}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !date && "text-muted-foreground",
                className
              )}
            >
              {date ? (
                format(date, "PPP", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              disabled={disabled}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-24">
        <input
          type="time"
          value={selectedTime}
          onChange={handleTimeChange}
          disabled={disabled || !date}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        />
      </div>
    </div>
  )
} 