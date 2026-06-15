import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disablePast?: boolean
  error?: string
}

export function DatePickerInput({
  id,
  label,
  value,
  onChange,
  placeholder = "Selecciona una fecha",
  disablePast = true,
  error,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = parseDateInputValue(value)
  const [month, setMonth] = React.useState<Date | undefined>(selectedDate)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            className="h-8 w-full justify-between px-2.5 font-normal"
            aria-invalid={Boolean(error)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault()
                setOpen(true)
              }
            }}
          >
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {value ? formatDisplayDate(value) : placeholder}
            </span>
            <CalendarIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-fit overflow-hidden p-0"
          align="start"
          sideOffset={8}
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            month={month}
            disabled={disablePast ? { before: getToday() } : undefined}
            onMonthChange={setMonth}
            onSelect={(date) => {
              if (!date) return
              onChange(toDateInputValue(date))
              setMonth(date)
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

function getToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

function parseDateInputValue(value: string) {
  if (!value) return undefined
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? undefined : date
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10)
}

function formatDisplayDate(value: string) {
  const date = parseDateInputValue(value)
  if (!date) return value

  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}
