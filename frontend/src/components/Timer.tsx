import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Square, ChevronDown } from 'lucide-react';
import { Subject } from '../types';
import { formatTime, toPersianDigits, formatDurationHuman } from '../utils/jalali';

interface TimerProps {
  subjects: Subject[];
  activeSubjectId: string;
  setActiveSubjectId: (id: string) => void;
  onSessionComplete: (subjectId: string, start: Date, end: Date, description: string) => void;
  totalTrackedToday: number;
}

export default function Timer({
  subjects,
  activeSubjectId,
  setActiveSubjectId,
  onSessionComplete,
  totalTrackedToday
}: TimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [description, setDescription] = useState('');
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const startTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = new Date(Date.now() - elapsed * 1000);
      intervalRef.current = window.setInterval(() => {
        if (startTimeRef.current) {
          setElapsed(Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000));
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleStop = () => {
    if (elapsed > 0 && startTimeRef.current) {
      onSessionComplete(activeSubjectId, startTimeRef.current, new Date(), description.trim() || 'بدون توضیح');
    }
    setIsRunning(false);
    setElapsed(0);
    setDescription('');
  };

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];
  const activeColor = activeSubject?.color || '#8B5CF6';

  return (
    <div className="w-full rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative">
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20 blur-3xl pointer-events-none" style={{ background: activeColor }} />
      <div className="relative p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-xs font-medium text-slate-400 tracking-wider">تایمر مطالعه</span>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            {toPersianDigits(new Date().getHours().toString().padStart(2, '0'))}
            <span className="animate-pulse mx-1">:</span>
            {toPersianDigits(new Date().getMinutes().toString().padStart(2, '0'))}
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-6xl sm:text-7xl lg:text-8xl font-extralight tracking-tight text-white tabular-nums font-mono" style={{ textShadow: '0 0 40px rgba(139, 92, 246, 0.15)' }}>
              {formatTime(elapsed)}
            </span>
          </div>
        </div>

        <div className="mb-4 relative">
          <button
            onClick={() => setShowSubjectMenu(!showSubjectMenu)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: activeColor, boxShadow: `0 0 12px ${activeColor}80` }} />
              <span className="text-slate-200 font-medium">{activeSubject?.name}</span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform ${showSubjectMenu ? 'rotate-180' : ''}`} />
          </button>

          {showSubjectMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-slate-800/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { setActiveSubjectId(s.id); setShowSubjectMenu(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700/50 transition-colors text-right"
                >
                  <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-200">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="چه چیزی مطالعه می‌کنی؟"
          className="w-full px-4 py-3 rounded-xl bg-slate-800/30 border border-slate-800/60 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-slate-600 transition-colors mb-6 text-sm"
        />

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <button
              onClick={handleStart}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play size={20} fill="currentColor" />
              <span>شروع مطالعه</span>
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white font-semibold transition-all"
              >
                <Pause size={20} />
                <span>توقف موقت</span>
              </button>
              <button
                onClick={handleStop}
                className="px-5 py-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 hover:text-rose-300 transition-all"
                aria-label="پایان"
              >
                <Square size={20} fill="currentColor" />
              </button>
            </>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>مجموع امروز</span>
          <span className="font-mono text-slate-300">{toPersianDigits(formatDurationHuman(totalTrackedToday))}</span>
        </div>
      </div>
    </div>
  );
}