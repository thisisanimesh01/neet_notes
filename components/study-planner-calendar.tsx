"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function StudyPlannerCalendar() {
  const now = new Date();
  const [displayMonth, setDisplayMonth] = useState(now.getMonth());
  const [displayYear, setDisplayYear] = useState(now.getFullYear());

  const todayDate = now.getDate();
  const todayMonth = now.getMonth();
  const todayYear = now.getFullYear();

  const isCurrentMonth = displayMonth === todayMonth && displayYear === todayYear;

  const firstDayIndex = new Date(displayYear, displayMonth, 1).getDay();
  const totalDays = new Date(displayYear, displayMonth + 1, 0).getDate();

  const blanks = Array.from({ length: firstDayIndex });
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  function goPrev() {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear((y) => y - 1);
    } else {
      setDisplayMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear((y) => y + 1);
    } else {
      setDisplayMonth((m) => m + 1);
    }
  }

  return (
    <div className="relative">
      <div className="absolute -left-5 top-12 h-28 w-28 rounded-full bg-emerald-200/50 blur-3xl" />
      <div className="absolute -right-5 bottom-12 h-28 w-28 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200/90 bg-white p-5 shadow-[0_25px_70px_rgba(15,23,42,0.08)]">
        <div className="rounded-[24px] bg-gradient-to-br from-slate-50 via-white to-emerald-50/40 p-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <CalendarDays className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-base font-black text-slate-900">Calendar</h2>
          </div>

          {/* Calendar Grid */}
          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm">
            {/* Month/Year Navigation */}
            <div className="mb-3 flex items-center justify-between">
              <button
                onClick={goPrev}
                aria-label="Previous month"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-extrabold text-slate-900">
                {MONTH_NAMES[displayMonth]} {displayYear}
              </span>
              <button
                onClick={goNext}
                aria-label="Next month"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Day of Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400">
              {DAY_LABELS.map((label, i) => (
                <div key={i}>{label}</div>
              ))}
            </div>

            {/* Date Cells */}
            <div className="mt-1.5 grid grid-cols-7 gap-1 text-center text-xs">
              {blanks.map((_, index) => (
                <span key={`blank-${index}`} />
              ))}

              {days.map((day) => {
                const isToday = isCurrentMonth && day === todayDate;

                if (isToday) {
                  return (
                    <span
                      key={day}
                      className="rounded-lg bg-emerald-600 py-1 font-black text-white shadow-sm ring-2 ring-emerald-400 ring-offset-1"
                    >
                      {day}
                    </span>
                  );
                }

                return (
                  <span
                    key={day}
                    className="rounded-lg py-1 font-medium text-slate-600 hover:bg-slate-100"
                  >
                    {day}
                  </span>
                );
              })}
            </div>

            {/* Today indicator — only when viewing current month */}
            {isCurrentMonth && (
              <div className="mt-3 border-t border-slate-100 pt-2.5 text-center text-[11px] font-semibold text-slate-500">
                Today: {now.toLocaleString("en-US", { weekday: "short" })},{" "}
                {MONTH_NAMES[todayMonth].slice(0, 3)} {todayDate}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
