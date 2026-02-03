
import React, { useState, useEffect } from 'react';
import { Lesson } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { Quiz } from './Quiz';

interface Props {
  lesson: Lesson;
  onBack: () => void;
  onComplete: () => void;
  nextLesson: Lesson | null;
  onNext: (lesson: Lesson) => void;
  isCompleted: boolean;
  overallProgressPercent?: number; 
}

export const LessonView: React.FC<Props> = ({ 
  lesson, 
  onBack, 
  onComplete, 
  nextLesson, 
  onNext, 
  isCompleted,
  overallProgressPercent = 0
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'audio' | 'podcast' | 'quiz'>('text');

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab('text');
  }, [lesson]);

  const handleQuizSuccess = () => {
    onComplete();
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex justify-between items-center mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-indigo-400 font-bold hover:text-indigo-300 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Curriculum Overview
        </button>
        {isCompleted && (
           <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
             Topic Mastered
           </span>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Content Area */}
        <div className="flex-1 w-full order-2 md:order-1">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header / Tabs */}
            <div className="border-b border-slate-800 flex overflow-x-auto bg-slate-950/40">
              {[
                { id: 'text', label: 'Study Guide', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
                { id: 'audio', label: 'Audio Lecture', icon: 'M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z' },
                { id: 'podcast', label: 'Insight Podcast', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
                { id: 'quiz', label: 'Verification', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-5 px-6 flex items-center justify-center gap-2 font-bold text-sm border-b-2 transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'border-indigo-600 text-indigo-400 bg-indigo-950/30' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Content */}
            <div className="p-8">
              {activeTab === 'text' && (
                <div className="prose prose-invert max-w-none">
                  <h1 className="text-3xl font-black text-white mb-8">{lesson.title}</h1>
                  <img 
                    src={`https://picsum.photos/seed/${encodeURIComponent(lesson.imagePrompt)}/1200/600`} 
                    alt={lesson.title} 
                    className="w-full h-80 object-cover rounded-3xl mb-10 shadow-2xl border border-slate-800"
                  />
                  <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-medium">
                    {lesson.content.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => setActiveTab('audio')}
                      className="px-8 py-4 bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 rounded-2xl font-bold hover:bg-indigo-900 transition-all flex items-center gap-3"
                    >
                      Listen to Lecture
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'audio' && (
                <div className="text-center py-16">
                  <div className="bg-indigo-950/50 border border-indigo-900/50 p-10 rounded-[3rem] inline-block mb-10 shadow-2xl">
                    <svg className="w-20 h-20 text-indigo-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4">Core Lecture</h3>
                  <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                    A professional academic overview covering the critical concepts of this topic with high-fidelity narration.
                  </p>
                  <AudioPlayer script={lesson.audioScript} voice="Kore" />
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => setActiveTab('podcast')}
                      className="px-8 py-3 text-slate-400 hover:text-white transition-all font-bold flex items-center gap-2"
                    >
                      Listen to Podcast Discussion
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'podcast' && (
                <div className="text-center py-16">
                  <div className="bg-purple-950/50 border border-purple-900/50 p-10 rounded-[3rem] inline-block mb-10 shadow-2xl">
                    <svg className="w-20 h-20 text-purple-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4">Deep-Dive Podcast</h3>
                  <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
                    An engaging, multi-perspective conversation exploring practical applications and advanced insights.
                  </p>
                  <AudioPlayer 
                    script={lesson.podcastScript || lesson.audioScript} 
                    voice="Puck" 
                  />
                  <div className="mt-12 flex justify-center">
                    <button 
                      onClick={() => setActiveTab('quiz')}
                      className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-500 transition-all shadow-xl"
                    >
                      Start Assessment
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <Quiz 
                  key={lesson.id} 
                  quiz={lesson.quiz} 
                  onSuccess={handleQuizSuccess}
                  nextLesson={nextLesson}
                  onContinueToNext={() => nextLesson && onNext(nextLesson)}
                  onBackToCurriculum={onBack}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="w-full md:w-80 order-1 md:order-2 space-y-6">
          <div className="glass-card p-6 rounded-[2rem] sticky top-24 border-slate-800 shadow-xl">
            <h4 className="font-black text-white text-sm uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Executive Summary</h4>
            <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-5 rounded-2xl italic border border-slate-800">
              "{lesson.summary}"
            </p>
            <div className="mt-8">
               <div className="flex justify-between text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">
                 <span>Mastery Progress</span>
                 <span className="text-indigo-400">{overallProgressPercent}%</span>
               </div>
               <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${overallProgressPercent}%` }} />
               </div>
            </div>
            {isCompleted && nextLesson && (
              <button 
                onClick={() => onNext(nextLesson)}
                className="w-full mt-8 py-4 bg-indigo-950/50 border border-indigo-500/30 text-indigo-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-900 transition-all"
              >
                Proceed to Next Topic
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
