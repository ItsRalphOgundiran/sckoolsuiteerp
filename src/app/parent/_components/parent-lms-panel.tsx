"use client";

import { useMemo, useState } from "react";
import { BookOpen, ClipboardList, FileText, Video, HelpCircle } from "lucide-react";

type ChildOption = {
  id: string;
  name: string;
  className: string;
  classId: string | null;
};

type AssignmentItem = {
  id: string;
  title: string;
  dueDate: string;
  submittedAt: string | null;
  studentId: string | null;
  classId: string | null;
  subjectName: string;
};

type LessonItem = {
  id: string;
  title: string;
  createdAt: string;
  classId: string | null;
  subjectName: string;
};

type SubjectItem = {
  id: string;
  name: string;
  classId: string | null;
};

type QuizItem = {
  id: string;
  title: string;
  dueDate: string | null;
  classId: string | null;
  subjectName: string;
};

type OnlineClassItem = {
  id: string;
  title: string;
  startTime: string;
  classId: string | null;
  subjectName: string;
};

export function ParentLmsPanel({
  childOptions,
  assignments,
  lessons,
  subjects,
  quizzes,
  onlineClasses,
}: {
  childOptions: ChildOption[];
  assignments: AssignmentItem[];
  lessons: LessonItem[];
  subjects: SubjectItem[];
  quizzes: QuizItem[];
  onlineClasses: OnlineClassItem[];
}) {
  const [selectedChildId, setSelectedChildId] = useState(childOptions[0]?.id ?? "");
  const selectedChild = childOptions.find((child) => child.id === selectedChildId) ?? null;

  const data = useMemo(() => {
    if (!selectedChild) {
      return {
        assignments: [] as AssignmentItem[],
        lessons: [] as LessonItem[],
        subjectCount: 0,
        quizzes: [] as QuizItem[],
        onlineClasses: [] as OnlineClassItem[],
      };
    }

    const childAssignments = assignments.filter((item) => item.studentId === selectedChild.id || (!item.studentId && (!selectedChild.classId || item.classId === selectedChild.classId)));
    const childLessons = lessons.filter((item) => !selectedChild.classId || item.classId === selectedChild.classId);
    const childSubjectCount = subjects.filter((subject) => !selectedChild.classId || subject.classId === selectedChild.classId).length;
    const childQuizzes = quizzes.filter((item) => !item.classId || !selectedChild.classId || item.classId === selectedChild.classId);
    const childOnlineClasses = onlineClasses.filter((item) => !item.classId || !selectedChild.classId || item.classId === selectedChild.classId);

    return {
      assignments: childAssignments,
      lessons: childLessons,
      subjectCount: childSubjectCount,
      quizzes: childQuizzes,
      onlineClasses: childOnlineClasses,
    };
  }, [assignments, lessons, onlineClasses, quizzes, selectedChild, subjects]);

  const submittedCount = data.assignments.filter((item) => item.submittedAt).length;
  const pendingCount = Math.max(0, data.assignments.length - submittedCount);
  const progress = data.assignments.length ? (submittedCount / data.assignments.length) * 100 : 0;

  const modules = [
    { label: "Quizzes", count: data.quizzes.length, icon: HelpCircle, tone: "border-violet-200 bg-violet-50 text-violet-700", note: data.quizzes.length ? "Published quizzes" : "No quiz published" },
    { label: "Assignments", count: data.assignments.length, icon: ClipboardList, tone: "border-blue-200 bg-blue-50 text-blue-700", note: `${submittedCount} submitted` },
    { label: "Resources", count: data.lessons.length, icon: FileText, tone: "border-emerald-200 bg-emerald-50 text-emerald-700", note: "From lesson notes" },
    { label: "Online Class", count: data.onlineClasses.length, icon: Video, tone: "border-rose-200 bg-rose-50 text-rose-700", note: data.onlineClasses.length ? "Scheduled sessions" : "No live class yet" },
    { label: "Lessons", count: data.lessons.length, icon: BookOpen, tone: "border-amber-200 bg-amber-50 text-amber-700", note: "Published lessons" },
  ];

  return (
    <section className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] via-[#1a3a6e] to-[var(--brand-secondary)] p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">LMS Monitoring</p>
            <h2 className="mt-1 text-2xl font-bold">Track Learning Progress</h2>
            <p className="text-sm text-white/85">Monitor assignments, lessons, resources, quizzes and online class readiness.</p>
          </div>
          <div className="min-w-[260px]">
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-white/70">Select Child</label>
            <select
              className="w-full rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-sm text-white outline-none backdrop-blur-sm"
              value={selectedChildId}
              onChange={(event) => setSelectedChildId(event.target.value)}
            >
              {childOptions.map((child) => (
                <option key={child.id} value={child.id} className="text-slate-900">
                  {child.name} - {child.className}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <article key={module.label} className={`rounded-2xl border p-4 ${module.tone}`}>
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5" />
                <span className="text-xl font-extrabold">{module.count}</span>
              </div>
              <p className="mt-2 text-sm font-semibold">{module.label}</p>
              <p className="text-[11px] opacity-80">{module.note}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Assignment Tracker</h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{pendingCount} pending</span>
          </div>

          <div className="mb-4">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>Completion Progress</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {data.assignments.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-600">
                    <th className="px-3 py-2">Assignment</th>
                    <th className="px-3 py-2">Subject</th>
                    <th className="px-3 py-2">Due Date</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.assignments.slice(0, 15).map((item, idx) => (
                    <tr key={item.id} className={idx % 2 ? "bg-white" : "bg-slate-50/70"}>
                      <td className="px-3 py-2 font-medium text-slate-800">{item.title}</td>
                      <td className="px-3 py-2 text-slate-600">{item.subjectName}</td>
                      <td className="px-3 py-2 text-slate-600">{new Date(item.dueDate).toLocaleDateString("en-GB")}</td>
                      <td className="px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.submittedAt ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                          {item.submittedAt ? "Submitted" : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No assignments mapped to this child yet.</p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-800">Learning Snapshot</h3>
          <div className="space-y-2 text-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Child</p>
              <p className="font-semibold text-slate-900">{selectedChild?.name ?? "-"}</p>
              <p className="text-xs text-slate-600">{selectedChild?.className ?? "-"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Subjects in Scope</p>
              <p className="font-semibold text-slate-900">{data.subjectCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Lesson Resources</p>
              <p className="font-semibold text-slate-900">{data.lessons.length}</p>
              <p className="text-xs text-slate-600">Derived from lesson notes currently available.</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
              <p className="text-xs uppercase tracking-wide text-violet-700">Quiz & Live Class</p>
              <p className="text-xs text-violet-700">{data.quizzes.length} quizzes • {data.onlineClasses.length} online classes</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Upcoming Online Classes</p>
              {data.onlineClasses.slice(0, 3).length ? (
                <div className="space-y-2">
                  {data.onlineClasses.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                      <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-600">{item.subjectName} • {new Date(item.startTime).toLocaleString("en-GB")}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-500">No online classes scheduled yet.</p>}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Recent Quizzes</p>
              {data.quizzes.slice(0, 3).length ? (
                <div className="space-y-2">
                  {data.quizzes.slice(0, 3).map((item) => (
                    <div key={item.id} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                      <p className="text-xs font-semibold text-slate-800">{item.title}</p>
                      <p className="text-[11px] text-slate-600">{item.subjectName}{item.dueDate ? ` • Due ${new Date(item.dueDate).toLocaleDateString("en-GB")}` : ""}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-xs text-slate-500">No quizzes published yet.</p>}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
