"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import type { RendezVous } from "@/lib/types"

interface AppointmentCalendarProps {
  appointments: RendezVous[]
  onDateSelect?: (date: Date) => void
  onAppointmentClick?: (appointment: RendezVous) => void
}

export function AppointmentCalendar({ appointments, onDateSelect, onAppointmentClick }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()

  const monthNames = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ]

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const getAppointmentsForDate = (day: number) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.dateHeure)
      return (
        aptDate.getDate() === day &&
        aptDate.getMonth() === currentDate.getMonth() &&
        aptDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const days = []
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-24 border border-border bg-muted/30" />)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dayAppointments = getAppointmentsForDate(day)
    const isCurrentDay = isToday(day)

    days.push(
      <div
        key={day}
        className={`h-24 border border-border p-2 hover:bg-accent cursor-pointer transition-colors ${
          isCurrentDay ? "bg-primary/5 border-primary" : "bg-background"
        }`}
        onClick={() => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
          onDateSelect?.(date)
        }}
      >
        <div className={`text-sm font-semibold mb-1 ${isCurrentDay ? "text-primary" : "text-foreground"}`}>{day}</div>
        <div className="space-y-1">
          {dayAppointments.slice(0, 2).map((apt) => (
            <div
              key={apt.id}
              className={`text-xs p-1 rounded truncate ${
                apt.statut === "CONFIRME"
                  ? "bg-green-100 text-green-800"
                  : apt.statut === "DEMANDE"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
              }`}
              onClick={(e) => {
                e.stopPropagation()
                onAppointmentClick?.(apt)
              }}
            >
              {new Date(apt.dateHeure).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          ))}
          {dayAppointments.length > 2 && (
            <div className="text-xs text-muted-foreground">+{dayAppointments.length - 2} autres</div>
          )}
        </div>
      </div>,
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Calendrier des Rendez-vous
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold min-w-[150px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-0">
          {dayNames.map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center font-semibold text-sm border border-border bg-muted"
            >
              {day}
            </div>
          ))}
          {days}
        </div>
      </CardContent>
    </Card>
  )
}
