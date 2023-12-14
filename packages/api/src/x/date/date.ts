/**
 * @param date
 * @returns date formated as "hh:MM" eg. 12:37
 */
export const date_format_time = Intl.DateTimeFormat("de-DE", { timeStyle: "short" }).format
export const date_format_date_local = Intl.DateTimeFormat("de-DE", { dateStyle: "short" }).format

/**
 *
 * @param date
 * @returns date formated as ISO string eg. 2021-01-01
 */
export function date_format_iso (date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

/**
 *
 * @param date
 * @returns date formated as ISO string eg. "2021-01-01 12:37"
 */
export function date_formate_date_time_iso (date: Date): string {
    const date_iso = date_format_iso(date)
    const time_iso = date_format_time(date)
    return `${date_iso} ${time_iso}`
}

export function date_week_frames (date = new Date()): [start: Date, end:Date] {
    return [date_first_day_of_week(date, 1), date_last_day_of_week(date, 1)]
}

export function date_add_days (date: Date, days: number) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
}

export function date_first_day_of_week (date: Date, first_day_of_week_index = 1): Date {
    const day_of_week = date.getDay()
    const first_day_of_week = new Date(date)
    const diff = day_of_week >= first_day_of_week_index
        ? day_of_week - first_day_of_week_index
        : 6 - day_of_week

    first_day_of_week.setDate(date.getDate() - diff)
    first_day_of_week.setHours(0, 0, 0, 0)

    return first_day_of_week
}

function date_last_day_of_week (date: Date, first_day_of_week_index: number): Date {
    const first_day_of_week = date_first_day_of_week(date, first_day_of_week_index)
    const last_day_of_week = date_add_days(first_day_of_week, 6)

    return last_day_of_week
}

export function date_is_today (d: Date): boolean {
    const today = date_format_iso(new Date())
    const date = date_format_iso(d)

    const is_today = today === date
    return is_today
}

export function date_duration_in_minutes (start: Date, end: Date): number {
    const duration_in_minutes = Math.floor((end.getTime() - start.getTime()) / 1000 / 60)
    return duration_in_minutes
}

export function date_minutes_to_hours_and_minutes (duration: number): string {
    const hours = Math.floor(duration / 60)
    const minutes = duration % 60

    const hours_and_minutes = `${hours}h ${minutes}min`
    return hours_and_minutes
}

export function minutes_to_date (minutes: number, date = new Date()): Date {
    const new_date = new Date(date)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    new_date.setMinutes(mins)
    new_date.setHours(hours)

    return new_date
}

//

// 0 - Sunday
// 1 - Monday    <--
// 2 - Thuesday
// 3 - Wednesday <--
// 4 - Thursday
// 5 - Friday
// 6 - Saturday
