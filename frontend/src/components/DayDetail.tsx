import { X, Clock, Calendar, BookOpen } from 'lucide-react';
import * as jalaali from 'jalaali-js';
import { StudySession, Subject } from '../types';
import { formatDurationHuman, toPersianDigits, PERSIAN_MONTH_NAMES, PERSIAN_WEEK_DAYS } from '../utils/jalali';

interface DayDetailProps {
  jYear: number;
  jMonth: number;
  jDay: number;
  sessions: StudySession[];
  subjects: Subject[];
  onClose: () => void;
}

export default function DayDetail({ jYear, jMonth, jDay, sessions, subjects, onClose }: DayDetailProps) {
  const getDayOfWeek = (jy: number, jm: number, jd: number) => {
    const g = jalaali.toGregorian(jy, jm, jd);
    const d = new Date(g.gy, g.gm - 1, g.gd).getDay();
    return (d + 1) % 7;
  };

  const dayOfWeek = getDayOfWeek(jYear, jMonth, jDay);
  const totalSeconds = sessions.reduce((sum, s) => sum + s.durationSeconds, 0);

  const formatTime = (date: Date) => {
    return `${toPersianDigits(date.getHours().toString().padStart(2, '0'))}:${toPersianDigits(date.getMinutes().toString().padStart(2, '0'))}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <p className="text-sm text-slate-400 mb-1">
              {PERSIAN_WEEK_DAYS[dayOfWeek]}، {toPersianDigits(jDay)} {PERSIAN_MONTH_NAMES[jMonth - 1]} {toPersianDigits(jYear)}
            </p>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar size={12} />
              {sessions.length} جلسه • {formatDurationHuman(totalSeconds)}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <BookOpen size={32} className="mx-auto mb-3 text-slate-500" />
              <p className="text-sm">هنوز جلسه‌ای برای این روز ثبت نشده</p>
              <p className="text-xs text-slate-500 mt-1">شروع مطالعه کنید تا اینجا پر شود</p>
            </div>
          ) : (
            sessions.map((s) => {
              const subj = subjects.find(sub => sub.id === s.subjectId);
              if (!subj) return null;
              const start = new Date(s.startTime);
              const end = new Date(s.endTime);
              const timeStr = `${formatTime(start)} - ${formatTime(end)}`;
              return (
                <div key={s.id} className="rounded-xl p-4 border transition-all hover:border-slate-700" style={{ background: subj.bgLight, borderColor: subj.border }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: subj.color }} />
                    <span className="font-medium text-white text-sm">{subj.name}</span>
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-mono" style={{ background: subj.bgLight, color: subj.text, border: `1px solid ${subj.border}` }}>
                      {formatDurationHuman(s.durationSeconds)}
                    </span>
                  </div>
                  {s.description && <p className="text-slate-300 text-sm mb-2 line-clamp-2">{s.description}</p>}
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={12} /> {timeStr}</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {formatDurationHuman(s.durationSeconds)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {sessions.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-800 bg-slate-900/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">مجموع این روز</span>
              <span className="font-bold text-white font-mono">{formatDurationHuman(totalSeconds)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}