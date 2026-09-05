import { Subject } from '../types';
import { formatDurationHuman, toPersianDigits } from '../utils/jalali';

interface SubjectStatsProps {
  subjects: Subject[];
  sessions: { subjectId: string; durationSeconds: number }[];
}

export default function SubjectStats({ subjects, sessions }: SubjectStatsProps) {
  // Total per subject for current month
  const totals: Record<string, number> = {};
  let grandTotal = 0;
  for (const s of sessions) {
    totals[s.subjectId] = (totals[s.subjectId] || 0) + s.durationSeconds;
    grandTotal += s.durationSeconds;
  }

  const rows = subjects
    .filter((s) => totals[s.id] && totals[s.id] > 0)
    .sort((a, b) => totals[b.id] - totals[a.id]);

  if (rows.length === 0) return null;

  return (
    <div className="w-full rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-slate-800/60">
        <h2 className="text-sm font-bold text-white">آمار دروس این ماه</h2>
        <span className="text-xs text-slate-500 font-mono">{formatDurationHuman(grandTotal)}</span>
     </div>

      <div className="p-4 space-y-3">
        {rows.map((subj) => {
          const seconds = totals[subj.id] || 0;
          const percentage = grandTotal > 0 ? (seconds / grandTotal) * 100 : 0;
          return (
            <div key={subj.id} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: subj.color }} />
                  <span className="text-xs font-medium text-slate-300">{subj.name}</span>
               </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-mono">{toPersianDigits(Math.round(percentage))}%</span>
                  <span className="text-slate-300 font-mono">{formatDurationHuman(seconds)}</span>
               </div>
             </div>
              <div className="h-1.5 bg-slate-800/60 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${subj.color}, ${subj.color}dd)`,
                    boxShadow: `0 0 8px ${subj.color}66`
                  }}
                />
             </div>
           </div>
          );
        })}
     </div>
   </div>
  );
}
