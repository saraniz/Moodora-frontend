import { cn } from "@/lib/utils";

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

interface CalendarWidgetProps {
  /** Days (from dayKey) that get a dot */
  marked?: Set<string>;
  className?: string;
}

/** This month at a glance. */
export function CalendarWidget({ marked, className }: CalendarWidgetProps) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const offset = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  return (
    <div className={cn("calendar", className)}>
      <div className="calendar-month">
        {today.toLocaleDateString(undefined, { month: "long" })}
      </div>
      <div className="calendar-grid">
        {weekdays.map((day) => (
          <span key={day} className="calendar-weekday">
            {day}
          </span>
        ))}
        {Array.from({ length: offset }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: days }, (_, i) => i + 1).map((day) => (
          <span
            key={day}
            className={cn(
              "calendar-day",
              day === today.getDate() && "is-today",
              marked?.has(dayKey(new Date(year, month, day))) && "is-marked",
            )}
          >
            {day}
          </span>
        ))}
      </div>
    </div>
  );
}
