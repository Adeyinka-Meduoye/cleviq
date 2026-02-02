
import React, { useState, useEffect, useMemo } from 'react';
import { Course, Lesson } from '../types';
import { LessonView } from './LessonView';

interface Props {
  course: Course;
  onSave?: () => void;
  onProgressUpdate?: (course: Course) => void;
}

export const CourseView: React.FC<Props> = ({ course, onSave, onProgressUpdate }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set(course.completedLessonIds || []));
  const [isSaved, setIsSaved] = useState(false);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);

  // Synchronize state if the course prop changes
  useEffect(() => {
    setCompletedLessons(new Set(course.completedLessonIds || []));
  }, [course.id]);

  // Flatten lessons for easier navigation
  const allLessons = useMemo(() => {
    return course.modules.flatMap(m => m.lessons);
  }, [course]);

  const totalLessons = allLessons.length;
  const progressPercent = Math.round((completedLessons.size / totalLessons) * 100);

  const handleSave = () => {
    if (onSave) onSave();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCompleteLesson = (lessonId: string) => {
    if (completedLessons.has(lessonId)) return;
    
    const newSet = new Set(completedLessons);
    newSet.add(lessonId);
    setCompletedLessons(newSet);
    
    // Notify parent to persist progress
    if (onProgressUpdate) {
      onProgressUpdate({
        ...course,
        completedLessonIds: Array.from(newSet)
      });
    }
    
    // Check if this was the last lesson
    if (newSet.size === totalLessons) {
      setTimeout(() => setShowCompletionPopup(true), 1500);
    }
  };

  const getNextLesson = (currentLessonId: string) => {
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      return allLessons[currentIndex + 1];
    }
    return null;
  };

  if (selectedLesson) {
    return (
      <LessonView 
        lesson={selectedLesson} 
        onBack={() => setSelectedLesson(null)} 
        onComplete={() => handleCompleteLesson(selectedLesson.id)}
        nextLesson={getNextLesson(selectedLesson.id)}
        onNext={(next) => setSelectedLesson(next)}
        isCompleted={completedLessons.has(selectedLesson.id)}
        overallProgressPercent={progressPercent}
      />
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {showCompletionPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="max-w-md w-full glass-card p-10 rounded-[3rem] text-center border-indigo-500/30 shadow-2xl">
            <div className="w-24 h-24 bg-green-950/40 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-5xl">🎓</span>
            </div>
            <h2 className="text-3xl font-black text-white mb-2">Congratulations!</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              You have successfully completed the entire course: <br/>
              <span className="text-indigo-400 font-bold">{course.title}</span>
            </p>
            <button 
              onClick={() => setShowCompletionPopup(false)}
              className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40"
            >
              Back to Overview
            </button>
          </div>
        </div>
      )}

      {/* Course Banner */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl mb-12 relative overflow-hidden border border-indigo-500/20">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" /></svg>
        </div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-500/30 uppercase tracking-widest inline-block">
              Course Masterclass
            </span>
            <div className="flex items-center gap-3">
              <div className="text-right mr-2 hidden md:block">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Progress</p>
                <p className="text-lg font-black">{progressPercent}%</p>
              </div>
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-sm transition-all ${isSaved ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-900 hover:bg-white'}`}
              >
                <svg className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {isSaved ? 'Saved' : 'Save Course'}
              </button>
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">{course.title}</h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed opacity-90">
            {course.description}
          </p>
          <div className="flex flex-wrap gap-6 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Target:</span>
              <span className="text-slate-100">{course.targetAudience}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Duration:</span>
              <span className="text-slate-100">{course.estimatedDuration}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Objectives */}
        <div className="lg:col-span-1">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            Objectives
          </h3>
          <ul className="space-y-4">
            {course.learningObjectives.map((obj, i) => (
              <li key={i} className="flex gap-4 p-5 glass-card rounded-3xl border border-slate-800 shadow-xl">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center text-xs font-black">{i + 1}</span>
                <span className="text-slate-300 text-sm font-semibold leading-relaxed">{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modules List */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
            Curriculum
          </h3>
          <div className="space-y-12">
            {course.modules.map((module, idx) => (
              <div key={module.id} className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl font-black text-slate-800/50">{String(idx + 1).padStart(2, '0')}</span>
                  <h4 className="text-xl font-black text-white">{module.title}</h4>
                </div>
                <div className="grid gap-4">
                  {module.lessons.map((lesson) => (
                    <button
                      key={lesson.id}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`group w-full flex items-center justify-between p-6 bg-slate-900 border rounded-[2rem] shadow-lg transition-all text-left ${
                        completedLessons.has(lesson.id) ? 'border-green-900/50 opacity-90' : 'border-slate-800 hover:border-indigo-600'
                      }`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all transform group-hover:rotate-6 ${
                          completedLessons.has(lesson.id) ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-indigo-600 group-hover:text-white'
                        }`}>
                          {completedLessons.has(lesson.id) ? (
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          )}
                        </div>
                        <div>
                          <p className={`font-bold text-lg transition-colors ${completedLessons.has(lesson.id) ? 'text-green-400' : 'text-white group-hover:text-indigo-400'}`}>
                            {lesson.title}
                          </p>
                          <p className="text-sm text-slate-500 font-medium line-clamp-1">{lesson.summary}</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-600 group-hover:text-indigo-400 group-hover:border-indigo-600/50 group-hover:translate-x-1 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
