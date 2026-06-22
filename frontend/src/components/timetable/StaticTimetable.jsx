import React, { useState } from 'react';
import { Clock, User } from 'lucide-react';
import { useAttendance } from '../../hooks/useAttendance';

const slotsDefinition = [
  { no: 1, start: "09:00", end: "09:55" },
  { no: 2, start: "09:55", end: "10:50" },
  { no: 3, start: "11:05", end: "12:00" },
  { no: 4, start: "12:00", end: "12:55" },
  { no: 5, start: "02:00", end: "02:55" },
  { no: 6, start: "02:55", end: "03:50" },
  { no: 7, start: "03:50", end: "04:45" }
];

const days = [
  { key: '1', name: 'Monday' },
  { key: '2', name: 'Tuesday' },
  { key: '3', name: 'Wednesday' },
  { key: '4', name: 'Thursday' },
  { key: '5', name: 'Friday' }
];

const getSlotColorClasses = (code, name) => {
  if (!code && !name) return 'bg-slate-150/40 dark:bg-slate-800/10 border-slate-200 dark:border-slate-800/60 text-slate-400 dark:text-slate-500';
  
  const upperCode = code?.toUpperCase() || '';
  const upperName = name?.toUpperCase() || '';
  
  // Free Hour style -> Neutral Slate
  if (upperName.includes('FREE HOUR')) {
    return 'bg-slate-50 border-slate-200 text-slate-400 dark:bg-slate-900/10 dark:border-slate-800 dark:text-slate-500';
  }

  // Laboratory subjects -> Light Green / Emerald
  if (upperCode.includes('L10') || upperCode.includes('S94') || upperCode.includes('L06') || upperCode.includes('L11') || upperName.includes('LABORATORY')) {
    return 'bg-emerald-50 border-emerald-250 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-300';
  }
  
  // Elective subjects (BI & UI Design) -> Lavender / Purple
  if (upperCode.includes('SE15') || upperCode.includes('SE18') || upperName.includes('INTERFACE') || upperName.includes('INTELLIGENCE')) {
    return 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/20 dark:border-purple-900/40 dark:text-purple-300';
  }
  
  // Compulsory Theory -> Light Blue
  if (upperCode.startsWith('20MSS')) {
    return 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-300';
  }
  
  // Placement CGC, Wellness, Library, TVM, P.Ed -> Pink / Rose / Light Red
  return 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-300';
};

const getSlotTimeRange = (slotNo, colSpan = 1) => {
  const startSlot = slotsDefinition.find(s => s.no === slotNo);
  const endSlot = slotsDefinition.find(s => s.no === slotNo + colSpan - 1);
  if (startSlot && endSlot) {
    return `${startSlot.start} - ${endSlot.end}`;
  }
  return startSlot ? `${startSlot.start} - ${startSlot.end}` : "";
};

const getTimetableData = (isMappedToAI, isMappedToPA) => {
  // Determine Monday & Friday Slot 6 & 7 Lab Item (AI Lab or PA Lab or Elective)
  let monFriSlot6 = { 
    slot_no: 6, 
    subject_code: "20MSSL06 / 22MDCEL11", 
    subject_name: "Predictive Analytics / AI Systems Lab (Elective)", 
    faculty_name: "Dr. T.N. Sugumar / Dr. V. Savithri", 
    colSpan: 2 
  };
  
  if (isMappedToAI) {
    monFriSlot6 = { 
      slot_no: 6, 
      subject_code: "22MDCEL11", 
      subject_name: "AI Systems Engineering for Agentic Workflows Laboratory", 
      faculty_name: "Dr. V. Savithri (i/c), Dr. A. G. Aruna", 
      colSpan: 2 
    };
  } else if (isMappedToPA) {
    monFriSlot6 = { 
      slot_no: 6, 
      subject_code: "20MSSL06", 
      subject_name: "Predictive Analytics Laboratory", 
      faculty_name: "Dr. T.N. Sugumar (i/c), Dr. N. Priya, Dr. S.B. Mahalakshmi", 
      colSpan: 2 
    };
  }

  return {
    // Monday
    "1": [
      { slot_no: 1, subject_code: "20MSSE18", subject_name: "Software User Interface Design", faculty_name: "Dr. A.D. Chitra" },
      { slot_no: 2, subject_code: "20MSS93", subject_name: "Professional Ethics", faculty_name: "Dr. S. Manjula Gandhi" },
      { slot_no: 3, subject_code: "20MSSL10", subject_name: "Business Intelligence Laboratory", faculty_name: "Dr. J. Shana (i/c), Mrs. V. Shanthi, Dr. M. Umarani" },
      { slot_no: 4, subject_code: "20MSSL10", subject_name: "Business Intelligence Laboratory", faculty_name: "Dr. J. Shana (i/c), Mrs. V. Shanthi, Dr. M. Umarani" },
      { slot_no: 5, subject_code: "", subject_name: "Library", faculty_name: "" },
      monFriSlot6,
    ],
    // Tuesday
    "2": [
      { slot_no: 1, subject_code: "20MSS93", subject_name: "Professional Ethics", faculty_name: "Dr. S. Manjula Gandhi" },
      { slot_no: 2, subject_code: "20MSS91", subject_name: "Agile Methods for Software Development", faculty_name: "Mrs. V. Shanthi" },
      { slot_no: 3, subject_code: "20MSSL10", subject_name: "Business Intelligence Laboratory", faculty_name: "Dr. J. Shana (i/c), Mrs. V. Shanthi, Dr. M. Umarani" },
      { slot_no: 4, subject_code: "20MSSL10", subject_name: "Business Intelligence Laboratory", faculty_name: "Dr. J. Shana (i/c), Mrs. V. Shanthi, Dr. M. Umarani" },
      { slot_no: 5, subject_code: "20MSSE15", subject_name: "Business Intelligence", faculty_name: "Dr. M. Umarani" },
      { slot_no: 6, subject_code: "", subject_name: "Assoc / Placement Training / CGC", faculty_name: "", colSpan: 2 },
    ],
    // Wednesday
    "3": [
      { slot_no: 1, subject_code: "20MSS94", subject_name: "Information Security Laboratory", faculty_name: "Dr. S. Manjula Gandhi (i/c), Dr. A.D. Chitra, Dr. D. Anandhi", colSpan: 2 },
      { slot_no: 3, subject_code: "20MSS91", subject_name: "Agile Methods for Software Development", faculty_name: "Mrs. V. Shanthi" },
      { slot_no: 4, subject_code: "20MSSE15", subject_name: "Business Intelligence", faculty_name: "Dr. M. Umarani" },
      { slot_no: 5, subject_code: "20MSS92", subject_name: "Information Security", faculty_name: "Dr. D. Anandhi" },
      { slot_no: 6, subject_code: "WELLNESS", subject_name: "Wellness", faculty_name: "Mrs. Mahalakshmi Rajagopal" },
      { slot_no: 7, subject_code: "TWM", subject_name: "TWM / CCM", faculty_name: "" },
    ],
    // Thursday
    "4": [
      { slot_no: 1, subject_code: "20MSS94", subject_name: "Information Security Laboratory", faculty_name: "Dr. S. Manjula Gandhi (i/c), Dr. A.D. Chitra, Dr. D. Anandhi", colSpan: 2 },
      { slot_no: 3, subject_code: "20MSSE15", subject_name: "Business Intelligence", faculty_name: "Dr. M. Umarani" },
      { slot_no: 4, subject_code: "20MSS92", subject_name: "Information Security", faculty_name: "Dr. D. Anandhi" },
      { slot_no: 5, subject_code: "20MSSE18", subject_name: "Software User Interface Design", faculty_name: "Dr. A.D. Chitra" },
      { slot_no: 6, subject_code: "", subject_name: "Assoc / Placement Training / CGC", faculty_name: "", colSpan: 2 },
    ],
    // Friday
    "5": [
      { slot_no: 1, subject_code: "20MSS92", subject_name: "Information Security", faculty_name: "Dr. D. Anandhi" },
      { slot_no: 2, subject_code: "20MSSE18", subject_name: "Software User Interface Design", faculty_name: "Dr. A.D. Chitra" },
      { slot_no: 3, subject_code: "20MSS91", subject_name: "Agile Methods for Software Development", faculty_name: "Mrs. V. Shanthi" },
      { slot_no: 4, subject_code: "20MSS93", subject_name: "Professional Ethics", faculty_name: "Dr. S. Manjula Gandhi" },
      { slot_no: 5, subject_code: "", subject_name: "Library", faculty_name: "" },
      monFriSlot6,
    ]
  };
};

const StaticTimetable = () => {
  const { useSubjectWiseStats } = useAttendance();
  const subjectQuery = useSubjectWiseStats();
  const subjects = subjectQuery.data || [];

  const isMappedToAI = subjects.some(s => s.subject_code === '22MDCEL11');
  const isMappedToPA = subjects.some(s => s.subject_code === '20MSSL06');

  // Initialize with today's day key (1-5) or default to Monday ('1')
  const getTodayDayKey = () => {
    const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    if (day >= 1 && day <= 5) return String(day);
    return '1';
  };

  const [activeDayKey, setActiveDayKey] = useState(getTodayDayKey());

  const timetableData = getTimetableData(isMappedToAI, isMappedToPA);

  // Function to build day's rendering slots including colSpans
  const getRenderedSlotsForDay = (dayKey) => {
    const slots = timetableData[dayKey] || [];
    const rendered = [];
    let skipCount = 0;
    
    for (let slotNo = 1; slotNo <= 7; slotNo++) {
      if (skipCount > 0) {
        skipCount--;
        continue;
      }
      const slot = slots.find(s => s.slot_no === slotNo);
      if (slot) {
        rendered.push(slot);
        if (slot.colSpan > 1) {
          skipCount = slot.colSpan - 1;
        }
      } else {
        rendered.push({ slot_no: slotNo, isFree: true });
      }
    }
    return rendered;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Mobile & Tablet View (Day selector tab bar + vertical cards view) */}
      <div className="block lg:hidden space-y-4">
        {/* Horizontal day tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
          {days.map((day) => {
            const isSelected = activeDayKey === day.key;
            return (
              <button
                key={day.key}
                onClick={() => setActiveDayKey(day.key)}
                className={`snap-center shrink-0 px-5 py-3 rounded-2xl text-sm font-bold border transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 dark:bg-indigo-600 dark:border-indigo-500 shadow-md scale-[1.02]'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                }`}
              >
                {day.name}
              </button>
            );
          })}
        </div>

        {/* Vertical list of slots for active day */}
        <div className="space-y-3">
          {getRenderedSlotsForDay(activeDayKey).map((slot, index) => {
            if (slot.isFree) {
              return (
                <div 
                  key={`free-${index}`}
                  className="p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {getSlotTimeRange(slot.slot_no)}
                  </span>
                  <span>No Class</span>
                </div>
              );
            }

            const colSpan = slot.colSpan || 1;
            const colors = getSlotColorClasses(slot.subject_code, slot.subject_name);

            return (
              <div 
                key={`${activeDayKey}-${slot.slot_no}`}
                className={`p-5 rounded-2xl border flex flex-col gap-3 shadow-sm hover:shadow-md transition-all ${colors}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 shrink-0">
                    Slot {colSpan > 1 ? `${slot.slot_no} - ${slot.slot_no + colSpan - 1}` : slot.slot_no}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5 opacity-80" />
                    {getSlotTimeRange(slot.slot_no, colSpan)}
                  </span>
                </div>

                <div>
                  {slot.subject_code && (
                    <span className="text-[10px] font-extrabold tracking-wider block opacity-90 uppercase">
                      {slot.subject_code}
                    </span>
                  )}
                  <h4 className="text-sm font-extrabold leading-snug mt-0.5 font-display">
                    {slot.subject_name}
                  </h4>
                </div>

                {slot.faculty_name && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold opacity-90 border-t border-black/5 dark:border-white/5 pt-2 mt-1">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{slot.faculty_name}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Desktop View (Grid/Table matching the user's uploaded screenshot exactly) */}
      <div className="hidden lg:block glass-panel border rounded-3xl p-6 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="py-4 px-3 w-28 text-left">
                  <div className="bg-slate-900 text-white dark:bg-slate-800 px-4 py-2.5 rounded-xl border border-slate-800 dark:border-slate-700 text-xs font-bold uppercase tracking-wider text-center">
                    Day
                  </div>
                </th>
                {slotsDefinition.map(s => (
                  <th key={s.no} className="py-4 px-2 min-w-[170px] text-center">
                    <div className="bg-slate-900 text-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-800 dark:border-slate-700 flex flex-col items-center">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-60">Slot {s.no}</span>
                      <span className="text-xs font-extrabold tracking-tight mt-0.5">{s.start} - {s.end}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => {
                const renderedSlots = getRenderedSlotsForDay(day.key);
                return (
                  <tr 
                    key={day.key} 
                    className="border-b last:border-0 border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition-colors"
                  >
                    <td className="py-5 px-4 font-display font-bold text-sm text-slate-950 dark:text-white">
                      {day.name}
                    </td>
                    {renderedSlots.map((slot, index) => {
                      if (slot.isFree) {
                        return (
                          <td key={`free-cell-${index}`} className="py-3 px-2">
                            <div className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col justify-center h-24 text-slate-400 text-[10px] font-bold text-center">
                              No Class
                            </div>
                          </td>
                        );
                      }

                      const colors = getSlotColorClasses(slot.subject_code, slot.subject_name);
                      const colSpan = slot.colSpan || 1;

                      return (
                        <td 
                          key={`${day.key}-${slot.slot_no}`} 
                          colSpan={colSpan}
                          className="py-3 px-2"
                        >
                          <div className={`p-4 rounded-2xl border flex flex-col justify-center h-24 text-center transition-all hover:scale-[1.02] shadow-sm hover:shadow ${colors}`}>
                            {slot.subject_code && (
                              <span className="text-[9px] font-extrabold tracking-wider opacity-90 uppercase">
                                {slot.subject_code}
                              </span>
                            )}
                            <span className="text-xs font-extrabold font-display leading-snug mt-0.5 line-clamp-2">
                              {slot.subject_name}
                            </span>
                            {slot.faculty_name && (
                              <span className="text-[9px] font-semibold opacity-85 mt-1 truncate max-w-full">
                                {slot.faculty_name}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default StaticTimetable;
