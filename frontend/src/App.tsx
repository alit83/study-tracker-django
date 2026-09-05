import { useState, useEffect } from 'react';
import { Target, TrendingUp, Settings } from 'lucide-react';
import * as jalaali from 'jalaali-js';
import { StudySession, Subject } from './types';
import { DEFAULT_SUBJECTS, getTodayJalaali, getInitialSessions, formatDurationHuman, toPersianDigits } from './utils/jalali';
import Timer from './components/Timer';
import Calendar from './components/Calendar';
import DayDetail from './components/DayDetail';
import SubjectStats from './components/SubjectStats';

export default function App() {
  // State
  const [subjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [sessions, setSessions] = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('study-tracker-sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return getInitialSessions();
      }
    }
    return getInitialSessions();
  });
  const [activeSubjectId, setActiveSubjectId] = useState('math');
  const [jYear, setJYear] = useState(() => getTodayJalaali().jy);
  const [jMonth, setJMonth] = useState(() => getTodayJalaali().jm);
  const [selectedDay, setSelectedDay] = useState<{ jYear: number; jMonth: number; jDay: number; sessions: StudySession[] } | null>(null);

  // Persist sessions
  useEffect(() => {
    localStorage.setItem('study-tracker-sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Current month sessions for stats
  const monthSessions = sessions.filter(s => s.jYear === jYear && s.jMonth === jMonth);
  const todayJ = getTodayJalaali();
  const todaySessions = sessions.filter(s => s.jYear === todayJ.jy && s.jMonth === todayJ.jm && s.jDay === todayJ.jd);
  const totalTrackedToday = todaySessions.reduce((sum, s) => sum + s.durationSeconds, 0);
  const totalTrackedMonth = monthSessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  // Session completion handler
  const handleSessionComplete = (subjectId: string, start: Date, end: Date, description: string) => {
    const jStart = jalaali.toJalaali(start.getFullYear(), start.getMonth() + 1, start.getDate());
    const newSession: StudySession = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      subjectId,
      subjectName: subjects.find(s => s.id === subjectId)?.name || 'نامشخص',
      description,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      durationSeconds: Math.floor((end.getTime() - start.getTime()) / 1000),
      jYear: jStart.jy,
      jMonth: jStart.jm,
      jDay: jStart.jd,
    };
    setSessions(prev => [newSession, ...prev]);
  };

  // Click on calendar day
  const handleDayClick = (y: number, m: number, d: number, daySessions: StudySession[]) => {
    setSelectedDay({ jYear: y, jMonth: m, jDay: d, sessions: daySessions });
  };

  const formatTime = (date: Date) => {
    return `${toPersianDigits(date.getHours().toString().padStart(2, '0'))}:${toPersianDigits(date.getMinutes().toString().padStart(2, '0'))}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b0f19] via-[#0b0f19] to-[#0a0f1a]">
      {/* Ambient gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-[120px] animate-pulse-slow" style={{ background: '#8B5CF6' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-[120px] animate-pulse-slow" style={{ background: '#06B6D4', animationDelay: '2s' }} />
      </div>

      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              StudyTracker
            </h1>
            <p className="text-slate-500 text-sm mt-1">تایمر مطالعه با تقویم جلالی • estilo Toggl</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button className="p-2 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors" aria-label="تنظیمات">
              <Settings size={20} />
          </button>
        </div>
      </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left column - Calendar */}
          <div className="space-y-6">
            {/* Calendar */}
            <Calendar
              jy={jYear}
              jm={jMonth}
              setJYear={setJYear}
              setJMonth={setJMonth}
              sessions={sessions}
              subjects={subjects}
              onDayClick={handleDayClick}
            />

            {/* Subject Stats */}
            <SubjectStats
              subjects={subjects}
              sessions={monthSessions.map(s => ({ subjectId: s.subjectId, durationSeconds: s.durationSeconds }))}
            />
          </div>

          {/* Right column - Timer & Quick Stats */}
          <div className="space-y-6">
            {/* Timer */}
            <Timer
              subjects={subjects}
              activeSubjectId={activeSubjectId}
              setActiveSubjectId={setActiveSubjectId}
              onSessionComplete={handleSessionComplete}
              totalTrackedToday={totalTrackedToday}
            />

            {/* Quick stats cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20">
                    <Target size={16} className="text-indigo-400" />
                  </div>
                  <span className="text-xs text-slate-400">امروز</span>
                </div>
                <p className="text-xl font-bold text-white font-mono">{formatDurationHuman(totalTrackedToday)}</p>
                <p className="text-xs text-slate-500 mt-1">مطالعه امروز</p>
              </div>
              
              <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/60">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20">
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-400">این ماه</span>
                </div>
                <p className="text-xl font-bold text-white font-mono">{formatDurationHuman(totalTrackedMonth)}</p>
                <p className="text-xs text-slate-500 mt-1">مطالعه این ماه</p>
              </div>
            </div>

            {/* Subject quick pick */}
            <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/60">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">دروس سریع</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSubjectId(s.id)}
                    className={`p-3 rounded-xl text-center text-sm font-medium transition-all ${
                      activeSubjectId === s.id
                        ? 'shadow-lg'
                        : 'hover:bg-slate-800/50'
                    }`}
                    style={{
                      background: activeSubjectId === s.id ? s.bgLight.replace('0.15', '0.25') : 'transparent',
                      color: activeSubjectId === s.id ? s.text : '#94A3B8',
                      borderColor: activeSubjectId === s.id ? s.border : 'transparent',
                      borderWidth: activeSubjectId === s.id ? '1px' : '0',
                      boxShadow: activeSubjectId === s.id ? `0 0 20px ${s.color}33` : 'none'
                    }}
                  >
                    <div className="w-2 h-2 mx-auto mb-1.5 rounded-full" style={{ background: s.color }} />
                    <span>{s.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Today's sessions list */}
            <div className="p-4 rounded-xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/60">
              <h3 className="text-sm font-semibold text-white mb-3">جلسات امروز</h3>
              {todaySessions.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-4">هنوز جلسه‌ای برای امروز ثبت نشده</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {todaySessions.map((session) => {
                    const subj = subjects.find(s => s.id === session.subjectId);
                    if (!subj) return null;
                    const start = new Date(session.startTime);
                    const end = new Date(session.endTime);
                    return (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-3 rounded-lg transition-colors"
                        style={{
                          background: subj.bgLight,
                          border: `1px solid ${subj.border}`
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: subj.color }} />
                          <div>
                            <p className="text-sm font-medium text-white">{subj.name}</p>
                            <p className="text-xs text-slate-400">{session.description || 'بدون توضیح'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-white">
                            {formatTime(start)} - {formatTime(end)}
                          </p>
                          <p className="text-xs text-slate-400 font-mono">
                            {formatDurationHuman(session.durationSeconds)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Day Detail Modal */}
      {selectedDay && (
        <DayDetail
          jYear={selectedDay.jYear}
          jMonth={selectedDay.jMonth}
          jDay={selectedDay.jDay}
          sessions={selectedDay.sessions}
          subjects={subjects}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}