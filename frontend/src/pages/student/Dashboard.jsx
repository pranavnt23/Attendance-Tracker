import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { formatDateString, formatReadableDate } from '../../utils/dateUtils';
import {
  Clock,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react';
import ActualTimetable from '../../components/timetable/ActualTimetable';
import Card from '../../components/common/Card';
import MiniRing from '../../components/common/MiniRing';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const parseDateString = (dateStr) => {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Compact inline tab group — fits well in tight spaces on mobile
const InlineTabs = ({ options, activeId, onChange }) => (
  <div className="flex bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 gap-0.5">
    {options.map((opt) => {
      const isActive = activeId === opt.id;
      return (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all duration-200 cursor-pointer whitespace-nowrap border-0 ${
            isActive
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-extrabold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

// ─── Sub-Components ───────────────────────────────────────────────────────────

const StatBar = ({ label, value, colorClass }) => (
  <div className="flex flex-col items-center gap-0.5 flex-1">
    <span className={`text-base font-display font-extrabold leading-none ${colorClass}`}>{value}</span>
    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</span>
  </div>
);

const SubjectCard = ({ s, selectedTarget, statusBadgeColor, statusLabel, statusDesc, ringColor }) => (
  <div
    className={`rounded-2xl border transition-all duration-200 flex flex-col gap-2.5 active:scale-[0.99] ${
      s.status === 'shortage'
        ? 'border-l-[3px] border-l-rose-400 border-rose-100 dark:border-rose-900/40 bg-gradient-to-br from-rose-500/[0.03] to-transparent'
        : s.status === 'warning'
          ? 'border-l-[3px] border-l-amber-400 border-amber-100 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/[0.03] to-transparent'
          : 'border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/30'
    }`}
  >
    {/* Card body */}
    <div className="p-3">
      {/* Header row: code + ring */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex-1 min-w-0">
          <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 tracking-widest uppercase block">
            {s.subject_code}
          </span>
          <h5 className="font-display font-bold text-xs text-slate-900 dark:text-white mt-0.5 line-clamp-2 leading-snug">
            {s.subject_name}
          </h5>
        </div>
        {s.conducted_hours > 0 ? (
          <MiniRing percentage={s.currentPercentage} size={44} strokeWidth={4} color={ringColor} />
        ) : (
          <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border shrink-0 mt-1 ${statusBadgeColor}`}>
            {statusLabel}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {s.conducted_hours > 0 && (
        <div className="space-y-1 mt-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                s.status === 'shortage'
                  ? 'bg-gradient-to-r from-rose-400 to-rose-500'
                  : s.status === 'warning'
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                    : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
              }`}
              style={{ width: `${Math.min(100, s.currentPercentage)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 opacity-50"
              style={{ left: `${selectedTarget}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
            <span>0%</span>
            <span className="text-indigo-500 dark:text-indigo-400">Target {selectedTarget}%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>

    {/* Footer advice */}
    <div className={`flex items-start gap-1.5 px-3 pb-3 pt-0 border-t border-slate-100 dark:border-slate-800/50 mt-0 pt-2`}>
      <Info
        className={`w-3 h-3 shrink-0 mt-0.5 ${
          s.status === 'shortage'
            ? 'text-rose-500'
            : s.status === 'warning'
              ? 'text-amber-500'
              : 'text-slate-400 dark:text-slate-500'
        }`}
      />
      <p
        className={`text-[10px] font-semibold leading-relaxed ${
          s.status === 'shortage'
            ? 'text-rose-600 dark:text-rose-400'
            : s.status === 'warning'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-slate-500 dark:text-slate-400'
        }`}
      >
        {statusDesc}
      </p>
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const { user, isAuthenticating } = useAuth();
  const navigate = useNavigate();
  const { useSubjectWiseStats, useActualTimetable, useLastUpdatedDate } = useAttendance();

  const [activeTab, setActiveTab] = useState('official');
  const [selectedTarget, setSelectedTarget] = useState(75);
  const [showAllSubjects, setShowAllSubjects] = useState(false);

  const todayStr = formatDateString(new Date());
  const subjectQuery = useSubjectWiseStats();
  const todayClassesQuery = useActualTimetable(todayStr);
  const lastUpdatedQuery = useLastUpdatedDate();

  const isLoading =
    isAuthenticating || subjectQuery.isLoading || todayClassesQuery.isLoading || lastUpdatedQuery.isLoading;

  if (isLoading) {
    return <Loader message="Compiling your attendance records..." size="large" />;
  }

  const subjects = subjectQuery.data || [];
  const todayClasses = todayClassesQuery.data || [];
  const lastUpdatedData = lastUpdatedQuery.data;

  // Totals
  const totalConducted = subjects.reduce((sum, s) => sum + (s.conducted_hours || 0), 0);
  const totalPresent = subjects.reduce((sum, s) => sum + (s.present_hours || 0), 0);
  const totalAbsent = subjects.reduce((sum, s) => sum + (s.absent_hours || 0), 0);
  const totalOD = subjects.reduce((sum, s) => sum + (s.od_hours || 0), 0);

  const overallPercentage =
    totalConducted > 0 ? parseFloat(((totalPresent / totalConducted) * 100).toFixed(1)) : 100.0;
  const overallPercentageOD =
    totalConducted > 0
      ? parseFloat((((totalPresent + totalOD) / totalConducted) * 100).toFixed(1))
      : 100.0;
  const currentPercent = activeTab === 'official' ? overallPercentage : overallPercentageOD;

  // Subject forecasts
  const targetFraction = selectedTarget / 100;
  const subjectForecasts = subjects.map((sub) => {
    const conducted = sub.conducted_hours || 0;
    const attended =
      activeTab === 'official'
        ? sub.present_hours || 0
        : (sub.present_hours || 0) + (sub.od_hours || 0);
    const pct = conducted > 0 ? parseFloat(((attended / conducted) * 100).toFixed(1)) : 100.0;

    let status = 'safe';
    let classesToMiss = 0;
    let classesToAttend = 0;

    if (conducted === 0) {
      status = 'no_classes';
    } else if (pct < selectedTarget) {
      status = 'shortage';
      classesToAttend = Math.ceil((targetFraction * conducted - attended) / (1 - targetFraction));
    } else {
      classesToMiss = Math.floor((attended - targetFraction * conducted) / targetFraction);
      status = classesToMiss === 0 ? 'warning' : 'safe';
    }

    return { ...sub, currentPercentage: pct, status, classesToMiss, classesToAttend };
  });

  const shortageSubjects = subjectForecasts.filter((s) => s.status === 'shortage');
  const warningSubjects = subjectForecasts.filter((s) => s.status === 'warning');
  const safeSubjects = subjectForecasts.filter((s) => s.status === 'safe' || s.status === 'no_classes');

  // On mobile show only first 3 by default, then reveal all
  const MOBILE_PREVIEW_COUNT = 3;
  const visibleSubjects = showAllSubjects ? subjectForecasts : subjectForecasts.slice(0, MOBILE_PREVIEW_COUNT);
  const hasMore = subjectForecasts.length > MOBILE_PREVIEW_COUNT;

  const getSubjectCardProps = (s) => {
    let statusLabel = '';
    let statusBadgeColor = '';
    let statusDesc = '';
    if (s.status === 'no_classes') {
      statusLabel = 'No Classes';
      statusBadgeColor = 'text-slate-600 bg-slate-100 border-slate-200 dark:text-slate-400 dark:bg-slate-800/60 dark:border-slate-700';
      statusDesc = 'No lectures conducted yet.';
    } else if (s.status === 'shortage') {
      statusLabel = `Shortage`;
      statusBadgeColor = 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-950/30 dark:border-rose-800/80';
      statusDesc = `Must attend next ${s.classesToAttend} consecutive class${s.classesToAttend > 1 ? 'es' : ''} to recover.`;
    } else if (s.status === 'warning') {
      statusLabel = `Warning`;
      statusBadgeColor = 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/30 dark:border-amber-800/80';
      statusDesc = 'Borderline! Cannot afford to miss any upcoming classes.';
    } else {
      statusLabel = `Safe`;
      statusBadgeColor = 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/30 dark:border-emerald-800';
      statusDesc = `Can miss up to ${s.classesToMiss} class${s.classesToMiss > 1 ? 'es' : ''} without falling below target.`;
    }
    const ringColor =
      s.status === 'shortage' ? '#ef4444' : s.status === 'warning' ? '#f59e0b' : '#10b981';
    return { statusLabel, statusBadgeColor, statusDesc, ringColor };
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-6xl mx-auto pb-24 md:pb-8">

      {/* ── Page Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-violet-800 dark:from-white dark:via-slate-200 dark:to-indigo-300 bg-clip-text text-transparent">
            {user?.student_name ? `Hello, ${user.student_name.split(' ')[0]} 👋` : 'Hello'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            {formatReadableDate(new Date())}
          </p>
        </div>
        {/* Overall percentage pill */}
        <div className={`shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl border ${
          currentPercent < selectedTarget
            ? 'bg-rose-500/8 border-rose-200 dark:border-rose-900/50'
            : currentPercent < selectedTarget + 5
              ? 'bg-amber-500/8 border-amber-200 dark:border-amber-900/50'
              : 'bg-emerald-500/8 border-emerald-200 dark:border-emerald-900/50'
        }`}>
          <span className={`text-xl font-display font-extrabold leading-none ${
            currentPercent < selectedTarget
              ? 'text-rose-600 dark:text-rose-400'
              : currentPercent < selectedTarget + 5
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {currentPercent}%
          </span>
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
            Overall
          </span>
        </div>
      </div>

      {/* ── Sync Status Banner ────────────────────────────────────── */}
      <div className="bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5">
        <div className="shrink-0 w-6 h-6 rounded-full bg-indigo-500/10 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
        </div>
        <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          {lastUpdatedData?.last_updated_date ? (
            <>
              Synced until{' '}
              <strong className="font-semibold text-slate-900 dark:text-white">
                {formatReadableDate(parseDateString(lastUpdatedData.last_updated_date))}
              </strong>
              {lastUpdatedData.last_updated_slot !== null && (
                <>
                  {' '}·{' '}
                  <strong className="font-semibold text-indigo-600 dark:text-indigo-400">
                    Slot {lastUpdatedData.last_updated_slot}
                  </strong>
                </>
              )}
            </>
          ) : (
            <span className="italic text-slate-400">No attendance synced yet.</span>
          )}
        </span>
      </div>

      {/* ── 3-Stat Overview Row ───────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="glass-panel border-l-[3px] border-l-rose-500 border border-rose-100 dark:border-rose-950/50 p-3 rounded-2xl bg-gradient-to-br from-rose-500/[0.04] to-transparent animate-slide-up">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Below</span>
              <span className="text-lg font-display font-extrabold text-rose-600 dark:text-rose-400 leading-none">{shortageSubjects.length}</span>
            </div>
          </div>
        </div>
        <div className="glass-panel border-l-[3px] border-l-amber-500 border border-amber-100 dark:border-amber-950/50 p-3 rounded-2xl bg-gradient-to-br from-amber-500/[0.04] to-transparent animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Border</span>
              <span className="text-lg font-display font-extrabold text-amber-600 dark:text-amber-400 leading-none">{warningSubjects.length}</span>
            </div>
          </div>
        </div>
        <div className="glass-panel border-l-[3px] border-l-emerald-500 border border-emerald-100 dark:border-emerald-950/50 p-3 rounded-2xl bg-gradient-to-br from-emerald-500/[0.04] to-transparent animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Safe</span>
              <span className="text-lg font-display font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">{safeSubjects.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Classes (mobile-first: shown BEFORE the big calculator) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-display font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            Today's Classes
          </h3>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-1 rounded-lg">
            {todayClasses.length} slot{todayClasses.length !== 1 ? 's' : ''}
          </span>
        </div>
        <ActualTimetable
          slots={todayClasses}
          subjectWiseStats={subjects}
          activeTab={activeTab}
        />
      </div>

      {/* ── Attendance Stats + Target Calculator ─────────────────── */}
      <div className="glass-panel card-shimmer-top rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">

        {/* Card Header */}
        <div className="px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="font-display font-extrabold text-sm text-slate-900 dark:text-white">
              Attendance &amp; Buffer Calculator
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 ml-8 leading-relaxed">
            Track classes you can miss or need to attend.
          </p>

          {/* Controls — on their own row, full-width on mobile */}
          <div className="mt-3 flex flex-wrap gap-2">
            <InlineTabs
              options={[
                { id: 'official', label: 'Official' },
                { id: 'alternate', label: 'OD as Present' },
              ]}
              activeId={activeTab}
              onChange={setActiveTab}
            />
            <InlineTabs
              options={[
                { id: 75, label: '75%' },
                { id: 80, label: '80%' },
                { id: 85, label: '85%' },
              ]}
              activeId={selectedTarget}
              onChange={setSelectedTarget}
            />
          </div>
        </div>

        {/* Hours breakdown — horizontal scrollable on mobile */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center divide-x divide-slate-200 dark:divide-slate-700/60">
            <StatBar label="Conducted" value={`${totalConducted}h`} colorClass="text-slate-900 dark:text-white" />
            <StatBar label="Present" value={`${totalPresent}h`} colorClass="text-slate-900 dark:text-white" />
            <StatBar label="Absent" value={`${totalAbsent}h`} colorClass="text-rose-600 dark:text-rose-400" />
            <StatBar label="On Duty" value={`${totalOD}h`} colorClass="text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        {/* Status banner */}
        <div className="px-4 pt-3 pb-1">
          {shortageSubjects.length > 0 ? (
            <div className="flex gap-2.5 p-3 rounded-2xl bg-rose-500/8 border border-rose-500/20 text-rose-800 dark:text-rose-350">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <span className="font-bold">Attention:</span> You are below {selectedTarget}% in{' '}
                <strong className="font-extrabold">{shortageSubjects.length} subject{shortageSubjects.length > 1 ? 's' : ''}</strong>.
                Prioritize attending upcoming classes.
              </p>
            </div>
          ) : (
            <div className="flex gap-2.5 p-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/20 text-emerald-800 dark:text-emerald-350">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <span className="font-bold">You're on track!</span> All subjects meet your {selectedTarget}% target. Keep it up!
              </p>
            </div>
          )}
        </div>

        {/* Subject cards */}
        <div className="px-4 pt-3 pb-4 space-y-3">
          <h4 className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
            Subjectwise Standings &amp; Buffer
          </h4>

          {subjects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs italic">
              No subject records found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visibleSubjects.map((s) => (
                  <SubjectCard
                    key={s.subject_id}
                    s={s}
                    selectedTarget={selectedTarget}
                    {...getSubjectCardProps(s)}
                  />
                ))}
              </div>

              {/* Show more / less toggle */}
              {hasMore && (
                <button
                  onClick={() => setShowAllSubjects((v) => !v)}
                  className="w-full mt-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer"
                >
                  {showAllSubjects ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" />
                      Show All {subjectForecasts.length} Subjects
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
