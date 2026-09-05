import * as jalaali from 'jalaali-js';
import { StudySession, Subject } from '../types';

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

export const PERSIAN_WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه'
];

export const PERSIAN_WEEK_DAYS_SHORT = [
  'ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'
];

// Default pre-defined subjects with stylish colors
export const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'math',
    name: 'ریاضیات',
    color: '#8B5CF6', // Purple
    bgLight: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
    text: '#C4B5FD',
  },
  {
    id: 'physics',
    name: 'فیزیک',
    color: '#3B82F6', // Blue
    bgLight: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    text: '#93C5FD',
  },
  {
    id: 'programming',
    name: 'برنامه‌نویسی',
    color: '#10B981', // Emerald
    bgLight: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    text: '#6EE7B7',
  },
  {
    id: 'english',
    name: 'زبان انگلیسی',
    color: '#F59E0B', // Amber
    bgLight: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    text: '#FCD34D',
  },
  {
    id: 'chemistry',
    name: 'شیمی',
    color: '#EC4899', // Pink
    bgLight: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.4)',
    text: '#F9A8D4',
  },
  {
    id: 'biology',
    name: 'زیست‌شناسی',
    color: '#06B6D4', // Cyan
    bgLight: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.4)',
    text: '#67E8F9',
  }
];

export function toPersianDigits(num: number | string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
}

export function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
  
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

export function formatDurationHuman(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hrs > 0 && mins > 0) {
    return `${toPersianDigits(hrs)} ساعت و ${toPersianDigits(mins)} دقیقه`;
  } else if (hrs > 0) {
    return `${toPersianDigits(hrs)} ساعت`;
  } else if (mins > 0) {
    return `${toPersianDigits(mins)} دقیقه`;
  } else {
    return `${toPersianDigits(seconds)} ثانیه`;
  }
}

// Compact duration for tight calendar cells: ۲:۳۰ (h:mm) or ۴۵د (minutes)
export function formatDurationShort(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0) {
    return `${toPersianDigits(hrs)}:${toPersianDigits(String(mins).padStart(2, '0'))}`;
  }
  return `${toPersianDigits(mins)}د`;
}

export function getTodayJalaali() {
  const now = new Date();
  const jDate = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  return jDate;
}

export function getJalaaliMonthDays(jy: number, jm: number) {
  const daysInMonth = jalaali.jalaaliMonthLength(jy, jm);
  // Get starting day of week for the first day of this jalaali month
  const gDateFirst = jalaali.toGregorian(jy, jm, 1);
  // Date constructor month is 0-indexed
  const jsDate = new Date(gDateFirst.gy, gDateFirst.gm - 1, gDateFirst.gd);
  // JavaScript getDay(): 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // In Iranian Calendar week starts on Saturday (شنبه)
  // Saturday = 6 in JS Date -> 0 in Iranian
  // Sunday = 0 in JS Date -> 1 in Iranian
  // Monday = 1 -> 2
  // Tuesday = 2 -> 3
  // Wednesday = 3 -> 4
  // Thursday = 4 -> 5
  // Friday = 5 -> 6
  let firstDayOfWeek = (jsDate.getDay() + 1) % 7;

  return {
    daysInMonth,
    firstDayOfWeek
  };
}

// Generate sample realistic study sessions for the current Shamsi month
export function getInitialSessions(): StudySession[] {
  const today = getTodayJalaali();
  const year = today.jy;
  const month = today.jm;

  return [
    {
      id: '1',
      subjectId: 'math',
      subjectName: 'ریاضیات',
      description: 'حل تمرین‌های انتگرال و حد',
      startTime: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 22).toISOString(),
      durationSeconds: 7200, // 2 hours
      jYear: year,
      jMonth: month,
      jDay: Math.max(1, today.jd - 1)
    },
    {
      id: '2',
      subjectId: 'programming',
      subjectName: 'برنامه‌نویسی',
      description: 'تمرین React و Tailwind CSS',
      startTime: new Date(Date.now() - 3600000 * 5).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      durationSeconds: 5400, // 1.5 hours
      jYear: year,
      jMonth: month,
      jDay: today.jd
    },
    {
      id: '3',
      subjectId: 'physics',
      subjectName: 'فیزیک',
      description: 'فصل الکترومغناطیس و مرور فرمول‌ها',
      startTime: new Date(Date.now() - 3600000 * 48).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 45).toISOString(),
      durationSeconds: 10800, // 3 hours
      jYear: year,
      jMonth: month,
      jDay: Math.max(1, today.jd - 2)
    },
    {
      id: '4',
      subjectId: 'english',
      subjectName: 'زبان انگلیسی',
      description: 'لغات 504 وریدینگ 1',
      startTime: new Date(Date.now() - 3600000 * 72).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 71).toISOString(),
      durationSeconds: 3600, // 1 hour
      jYear: year,
      jMonth: month,
      jDay: Math.max(1, today.jd - 3)
    },
    {
      id: '5',
      subjectId: 'chemistry',
      subjectName: 'شیمی',
      description: 'آنتالپی و واکنش‌های ترمودینامیکی',
      startTime: new Date(Date.now() - 3600000 * 96).toISOString(),
      endTime: new Date(Date.now() - 3600000 * 93.5).toISOString(),
      durationSeconds: 9000, // 2.5 hours
      jYear: year,
      jMonth: month,
      jDay: Math.max(1, today.jd - 4)
    }
  ];
}
