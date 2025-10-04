"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import formatDate, { parseDate } from "@/lib/utils/date"
import { toast } from "sonner"

function isValidDate(date: Date | undefined) {
  return !!date && !isNaN(date.getTime())
}

type Props = {
  value?: string | Date
  onChange: (date: Date) => void
  dateLabel?: string
  className?: string
  placeholder?: string
  isRequired?: boolean
}

export function DatePicker({
  value,
  onChange,
  dateLabel,
  className,
  placeholder,
  isRequired = false,
}: Props) {

  const parsedDate = React.useMemo(() => {
    if (!value) return undefined;
    
    try {
      if (value instanceof Date) {
        return isValidDate(value) ? value : undefined;
      }
      
      if (typeof value === 'string') {
        const date = new Date(value);
        return isValidDate(date) ? date : undefined;
      }
      
      return undefined;
    } catch (error) {
      console.warn('Date parsing error:', error);
      return undefined;
    }
  }, [value]);

  const validDate = parsedDate && isValidDate(parsedDate) ? parsedDate : new Date()

  const [lastValidDate, setLastValidDate] = React.useState<Date>(validDate)
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState(formatDate(validDate))
  const [month, setMonth] = React.useState<Date | undefined>(validDate)

  React.useEffect(() => {
    if (isValidDate(parsedDate)) {
      setInputValue(formatDate(parsedDate))
      if (parsedDate) setLastValidDate(parsedDate)
      setMonth(parsedDate)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    const newDate = parseDate(e.target.value)
    if (isValidDate(newDate)) {
      if (newDate) setLastValidDate(newDate)
      if (newDate) onChange(newDate)
    }
  }

  const handleBlur = () => {
    const currentDate = parseDate(inputValue)
    if (!isValidDate(currentDate)) {
      // Revert to last valid date, not just prop value
      setInputValue(formatDate(lastValidDate))
    } else {
      setInputValue(formatDate(currentDate))
      if (currentDate) setLastValidDate(currentDate)
      if (currentDate) onChange(currentDate)
    }
  }

  const handleCalendarSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && isValidDate(selectedDate)) {
      setLastValidDate(selectedDate)
      setInputValue(formatDate(selectedDate))
      onChange(selectedDate)
      setOpen(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="date" className="px-1">
        {dateLabel} {isRequired && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative flex gap-2">
        <Input
          id="date"
          value={inputValue}
          placeholder={placeholder || "Select date"}
          className={`bg-background pr-10 ${className}`}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setOpen(true)
            }
          }}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="date-picker"
              variant="ghost"
              className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
            >
              <CalendarIcon className="size-3.5" />
              <span className="sr-only">Select date</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="end"
            alignOffset={-8}
            sideOffset={10}
          >
            <Calendar
              className={className}
              mode="single"
              selected={parsedDate}
              captionLayout="dropdown"
              month={month}
              onMonthChange={setMonth}
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
