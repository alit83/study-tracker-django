import { useMemo, useState } from 'react';
import * as jalaali from 'jalaali-js';
import { ChevronLeft, ChevronRight, CalendarRange, CalendarDays, CalendarCheck, BookOpen } from 'lucide-react';
import { StudySession, Subject } from '../types';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEK_DAYS,
  PERSIAN_WEEK_DAYS_SHORT,
  getJalaaliMonthDays,
  getTodayJalaali,
  formatDurationHuman,
  formatDurationShort,
  toPersianDigits,
} from '../utils/jalali';

type ViewMode = 'month' | 'week' | 'day';

interface JDate {
  jy: number;
  jm: number;
  jd: number;
}

interface CalendarProps {
  jy: number;
  jm: number;
  setJYear: (y: number) => void;
  setJMonth: (m: number) => void;
  sessions: StudySession[];
  subjects: Subject[];
  onDayClick: (jYear: number, jMonth: number, jDay: number, sessions: StudySession[]) => void;
}

// --- Jalaali date helpers (JDN = Julian Day Number, via jalaali-js) ---
const toJdn = (d: JDate) => jalaali.j2d(d.jy, d.jm, d.jd);

const fromJdn = (jdn: number): JDate => {
  const j = jalaali.d2j(jdn);
  return { jy: j.jy, jm: j.jm, jd: j.jd };
};

const addDays = (d: JDate, delta: number): JDate => fromJdn(toJdn(d) + delta);

// Iranian week starts on Saturday (شنبه)
const weekStartJdn = (d: JDate) => {
  const g = jalaali.toGregorian(d.jy, d.jm, d.jd);
  const dow = new Date(g.gy, g.gm - 1, g.gd).getDay(); // 0=Sunday..6=Saturday
  const iranianDow = (dow + 1) % 7; // 0=Saturday..6=Friday
  return toJdn(d) - iranianDow;
};

const dayOfWeekIndex = (d: JDate) => {
  const g = jalaali.toGregorian(d.jy, d.jm, d.jd);
  return (new Date(g.gy, g.gm - 1, g.gd).getDay() + 1) % 7; // 0=شنبه..6=جمعه
};

export default function Calendar({
  jy,
  jm,
  setJYear,
  setJMonth,
  sessions,
  subjects,
  onDayClick
}: CalendarProps) {
  const todayJ = getTodayJalaali();
  const todayJdn = toJdn(todayJ);

  // The day that week/day views are centered on
  const [selected, setSelected] = useState<JDate>(() => ({ jy: todayJ.jy, jm: todayJ.jm, jd: todayJ.jd }));
  const [mode, setMode] = useState<ViewMode>('month');

  const selJdn = toJdn(selected);

  // Sessions for a specific day
  const sessionsForDay = (d: JDate) =>
    sessions.filter(s => s.jYear === d.jy && s.jMonth === d.jm && s.jDay === d.jd);

  // --- Month view data ---
  const { daysInMonth, firstDayOfWeek } = getJalaaliMonthDays(jy, jm);
  const sessionsByDay: Record<number, StudySession[]> = {};
  for (const s of sessions) {
    if (s.jYear === jy && s.jMonth === jm) {
      if (!sessionsByDay[s.jDay]) sessionsByDay[s.jDay] = [];
      sessionsByDay[s.jDay].push(s);
    }
  }

  const monthCells: { day: number | null }[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) monthCells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) monthCells.push({ day: d });
  while (monthCells.length % 7 !== 0) monthCells.push({ day: null });

  // --- Week view data ---
  const weekDays = useMemo(() => {
    const start = weekStartJdn(selected);
    return Array.from({ length: 7 }, (_, i) => fromJdn(start + i));
  }, [selected.jy, selected.jm, selected.jd]);

  // --- Navigation ---
  const handlePrevMonth = () => {
    const ny = jm === 1 ? jy - 1 : jy;
    const nm = jm === 1 ? 12 : jm - 1;
    setJYear(ny);
    setJMonth(nm);
    const len = jalaali.jalaaliMonthLength(ny, nm);
    setSelected(s => ({ jy: ny, jm: nm, jd: Math.min(s.jd, len) }));
  };

  const handleNextMonth = () => {
    const ny = jm === 12 ? jy + 1 : jy;
    const nm = jm === 12 ? 1 : jm + 1;
    setJYear(ny);
    setJMonth(nm);
    const len = jalaali.jalaaliMonthLength(ny, nm);
    setSelected(s => ({ jy: ny, jm: nm, jd: Math.min(s.jd, len) }));
  };

  const handleNav = (dir: 1 | -1) => {
    if (mode === 'month') {
      dir === 1 ? handleNextMonth() : handlePrevMonth();
    } else if (mode === 'week') {
      setSelected(s => addDays(s, dir * 7));
    } else {
      setSelected(s => addDays(s, dir));
    }
  };

  const goToday = () => {
    setSelected({ jy: todayJ.jy, jm: todayJ.jm, jd: todayJ.jd });
    setJYear(todayJ.jy);
    setJMonth(todayJ.jm);
  };

  const handleDayClick = (d: JDate) => {
    setSelected(d);
    onDayClick(d.jy, d.jm, d.jd, sessionsForDay(d));
  };

  // --- Header title per mode ---
  const title = useMemo(() => {
    if (mode === 'month') {
      return `${PERSIAN_MONTH_NAMES[jm - 1]} ${toPersianDigits(jy)}`;
    }
    if (mode === 'day') {
      const dow = dayOfWeekIndex(selected);
      return `${PERSIAN_WEEK_DAYS[dow]}، ${toPersianDigits(selected.jd)} ${PERSIAN_MONTH_NAMES[selected.jm - 1]} ${toPersianDigits(selected.jy)}`;
    }
    // week: show range
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.jm === last.jm && first.jy === last.jy) {
      return `هفته ${toPersianDigits(first.jd)} تا ${toPersianDigits(last.jd)} ${PERSIAN_MONTH_NAMES[first.jm - 1]}`;
    }
    return `${toPersianDigits(first.jd)} ${PERSIAN_MONTH_NAMES[first.jm - 1]} – ${toPersianDigits(last.jd)} ${PERSIAN_MONTH_NAMES[last.jm - 1]}`;
  }, [mode, jy, jm, selected, weekDays]);

  const isViewingToday =
    mode === 'month'
      ? jy === todayJ.jy && jm === todayJ.jm
      : selJdn === todayJdn;

  const uniqueSubjectColors = (daySessions: StudySession[]): string[] => {
    const colors: string[] = [];
    for (const s of daySessions) {
      const subj = subjects.find(sub => sub.id === s.subjectId);
      if (subj && !colors.includes(subj.color)) {
        colors.push(subj.color);
        if (colors.length >= 3) break;
      }
    }
    return colors;
  };

  const modeButton = (m: ViewMode, label: string, Icon: typeof CalendarRange) => (
    <button
      onClick={() => setMode(m)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        mode === m
          ? 'bg-indigo-500 text-white shadow-[0_0_16px_rgba(99,102,241,0.4)]'
          : 'text-slate-400 hover:text-white'
      }`}
    >
      <Icon size={14} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="w-full rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
      {/* Header: navigation + title + 3-way view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="قبلی"
          >
            <ChevronRight size={18} />
          </button>
          <div className="text-center min-w-[150px]">
            <div className="text-base font-bold text-white">{title}</div>
          </div>
          <button
            onClick={() => handleNav(1)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="بعدی"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isViewingToday && (
            <button
              onClick={goToday}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
            >
              برو به امروز
            </button>
          )}
          <div
            className="flex items-center rounded-lg bg-slate-800/60 p-0.5 border border-slate-700/60"
            role="tablist"
            aria-label="نوع نمایش تقویم"
          >
            {modeButton('month', 'ماه', CalendarRange)}
            {modeButton('week', 'هفته', CalendarDays)}
            {modeButton('day', 'روز', CalendarCheck)}
          </div>
        </div>
      </div>

      {/* ================= Month view ================= */}
      {mode === 'month' && (
        <>
          <div className="grid grid-cols-7 border-b border-slate-800/40">
            {PERSIAN_WEEK_DAYS_SHORT.map((d, i) => (
              <div
                key={i}
                className={`text-center py-3 text-xs font-medium ${i === 6 ? 'text-rose-400' : 'text-slate-500'}`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {monthCells.map((cell, idx) => {
              if (cell.day === null) {
                return <div key={idx} className="aspect-square border-l border-t border-slate-800/30 bg-slate-900/20" />;
              }

              const day = cell.day;
              const daySessions = sessionsByDay[day] || [];
              const isToday = todayJ.jy === jy && todayJ.jm === jm && todayJ.jd === day;
              const isSelected = selJdn === toJdn({ jy, jm, jd: day });
              const totalSeconds = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
              const colors = uniqueSubjectColors(daySessions);

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick({ jy, jm, jd: day })}
                  className={`group relative aspect-square border-l border-t border-slate-800/40 p-1.5 cursor-pointer transition-all hover:bg-slate-800/40 ${
                    isToday ? 'bg-slate-800/30' : ''
                  } ${isSelected ? 'ring-1 ring-inset ring-indigo-400/70' : ''}`}
                >
                  {isToday && (
                    <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  )}

                  <div
                    className={`text-xs font-medium mb-1 ${
                      isToday
                        ? 'text-emerald-400'
                        : isSelected
                          ? 'text-indigo-300'
                          : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    {toPersianDigits(day)}
                  </div>

                  {daySessions.length > 0 && (
                    <div className="space-y-1">
                      {colors.length > 0 && (
                        <div className="flex gap-0.5 h-1">
                          {colors.map((c, i) => (
                            <div key={i} className="flex-1 rounded-full" style={{ background: c }} />
                          ))}
                        </div>
                      )}

                      {daySessions.slice(0, 1).map((s) => {
                        const subj = subjects.find(sub => sub.id === s.subjectId);
                        if (!subj) return null;
                        return (
                          <div
                            key={s.id}
                            className="rounded-md px-1 py-0.5 text-[9px] leading-tight truncate"
                            style={{
                              background: subj.bgLight,
                              color: subj.text,
                              border: `1px solid ${subj.border}`
                            }}
                            title={`${subj.name} - ${formatDurationHuman(s.durationSeconds)}`}
                          >
                            <span className="font-semibold">{subj.name}</span>
                          </div>
                        );
                      })}

                      <div className="text-[9px] text-slate-500 font-mono text-center">
                        {toPersianDigits(formatDurationShort(totalSeconds))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ================= Week view ================= */}
      {mode === 'week' && (
        <>
          <div className="grid grid-cols-7 border-b border-slate-800/40">
            {weekDays.map((d, i) => {
              const isToday = toJdn(d) === todayJdn;
              return (
                <div
                  key={i}
                  className={`text-center py-2.5 text-xs font-medium ${
                    isToday ? 'text-emerald-400' : i === 6 ? 'text-rose-400' : 'text-slate-500'
                  }`}
                >
                  {PERSIAN_WEEK_DAYS_SHORT[i]}
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-7">
            {weekDays.map((d, i) => {
              const daySessions = sessionsForDay(d);
              const totalSeconds = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
              const isToday = toJdn(d) === todayJdn;
              const isSelected = toJdn(d) === selJdn;
              const colors = uniqueSubjectColors(daySessions);
              const visible = daySessions.slice(0, 2);
              const extra = daySessions.length - visible.length;

              return (
                <div
                  key={i}
                  onClick={() => handleDayClick(d)}
                  className={`relative flex flex-col min-h-[210px] border-l last:border-l-0 border-t border-slate-800/40 p-2 cursor-pointer transition-all hover:bg-slate-800/30 ${
                    isToday ? 'bg-slate-800/20' : 'bg-slate-900/20'
                  } ${isSelected ? 'ring-1 ring-inset ring-indigo-400/70' : ''}`}
                >
                  {isToday && (
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  )}

                  <div className="text-center mb-2">
                    <div
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-base font-bold ${
                        isToday
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : isSelected
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : 'text-slate-300'
                      }`}
                    >
                      {toPersianDigits(d.jd)}
                    </div>
                    {totalSeconds > 0 && (
                      <div className="mt-1 text-[10px] font-mono text-slate-500">
                        {toPersianDigits(formatDurationShort(totalSeconds))}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {colors.length > 0 && (
                      <div className="flex gap-0.5 h-1">
                        {colors.map((c, ci) => (
                          <div key={ci} className="flex-1 rounded-full" style={{ background: c }} />
                        ))}
                      </div>
                    )}

                    {visible.map((s) => {
                      const subj = subjects.find(sub => sub.id === s.subjectId);
                      if (!subj) return null;
                      return (
                        <div
                          key={s.id}
                          className="rounded-md px-1.5 py-1 text-[10px] leading-tight"
                          style={{
                            background: subj.bgLight,
                            color: subj.text,
                            border: `1px solid ${subj.border}`
                          }}
                          title={`${subj.name} - ${formatDurationHuman(s.durationSeconds)}`}
                        >
                          <div className="font-semibold truncate">{subj.name}</div>
                          <div className="font-mono text-[9px] opacity-80">
                            {toPersianDigits(formatDurationShort(s.durationSeconds))}
                          </div>
                        </div>
                      );
                    })}

                    {extra > 0 && (
                      <div className="text-[10px] text-slate-500 text-center">
                        +{toPersianDigits(extra)} جلسه
                      </div>
                    )}

                    {daySessions.length === 0 && (
                      <div className="h-full flex items-center justify-center">
                        <div className="w-1 h-1 rounded-full bg-slate-700" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ================= Day view ================= */}
      {mode === 'day' && (() => {
        const daySessions = sessionsForDay(selected);
        const totalSeconds = daySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
        const isToday = selJdn === todayJdn;

        // Per-subject totals for the day
        const bySubject: { subject: Subject; seconds: number; count: number }[] = [];
        for (const s of daySessions) {
          const subj = subjects.find(sub => sub.id === s.subjectId);
          if (!subj) continue;
          const entry = bySubject.find(b => b.subject.id === subj.id);
          if (entry) {
            entry.seconds += s.durationSeconds;
            entry.count += 1;
          } else {
            bySubject.push({ subject: subj, seconds: s.durationSeconds, count: 1 });
          }
        }

        return (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Summary */}
            <div className="flex items-center justify-between rounded-xl bg-slate-800/30 border border-slate-800/60 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/15">
                  <CalendarCheck size={20} className="text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white font-mono">
                      {formatDurationHuman(totalSeconds)}
                    </span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        امروز
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {toPersianDigits(daySessions.length)} جلسه در این روز
                  </p>
                </div>
              </div>
            </div>

            {/* Subject breakdown */}
            {bySubject.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-400">به تفکیک درس</h4>
                {bySubject.map(({ subject, seconds }) => {
                  const pct = totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0;
                  return (
                    <div key={subject.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: subject.color }} />
                          <span className="text-xs text-slate-300">{subject.name}</span>
                        </div>
                        <span className="text-xs font-mono text-slate-500">
                          {formatDurationShort(seconds)} • {toPersianDigits(pct)}٪
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: subject.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Session list */}
            {daySessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <BookOpen size={32} className="mx-auto mb-3 text-slate-600" />
                <p className="text-sm">هنوز جلسه‌ای برای این روز ثبت نشده</p>
                <p className="text-xs text-slate-600 mt-1">شروع مطالعه کنید تا اینجا پر شود</p>
              </div>
            ) : (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400">جلسه‌ها</h4>
                {daySessions.map((s) => {
                  const subj = subjects.find(sub => sub.id === s.subjectId);
                  if (!subj) return null;
                  const start = new Date(s.startTime);
                  const end = new Date(s.endTime);
                  const fmt = (date: Date) =>
                    `${toPersianDigits(date.getHours().toString().padStart(2, '0'))}:${toPersianDigits(date.getMinutes().toString().padStart(2, '0'))}`;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{
                        background: subj.bgLight,
                        border: `1px solid ${subj.border}`
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: subj.color }} />
                        <div>
                          <p className="text-sm font-medium text-white">{subj.name}</p>
                          <p className="text-xs text-slate-400">{s.description || 'بدون توضیح'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono text-white">
                          {fmt(start)} - {fmt(end)}
                        </p>
                        <p className="text-xs text-slate-400 font-mono">
                          {formatDurationShort(s.durationSeconds)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}
