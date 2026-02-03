
import React, { useState, useEffect, useCallback } from 'react';
import { gemini } from './services/gemini';
import { Course, SkillLevel, CourseFormat, AgentState } from './types';
import { CourseView } from './components/CourseView';
import { AgentProgress } from './components/AgentProgress';

const AGENTS: AgentState[] = [
  { id: 'arch', name: 'Course Architect', status: 'idle', description: 'Structuring curriculum...' },
  { id: 'res', name: 'Researcher', status: 'idle', description: 'Gathering verified facts...' },
  { id: 'write', name: 'Content Writer', status: 'idle', description: 'Drafting lessons...' },
  { id: 'visual', name: 'Visual Sourcing', status: 'idle', description: 'Selecting relevant media...' },
  { id: 'audio', name: 'Audio Scripting', status: 'idle', description: 'Creating vocal experiences...' },
  { id: 'qa', name: 'Quality Audit', status: 'idle', description: 'Verifying accuracy...' },
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(SkillLevel.BEGINNER);
  const [isGenerating, setIsGenerating] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [agents, setAgents] = useState<AgentState[]>(AGENTS);
  const [library, setLibrary] = useState<Course[]>([]);

  // Load library from local storage
  useEffect(() => {
    const saved = localStorage.getItem('cleviq_library');
    if (saved) {
      try {
        setLibrary(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse library", e);
      }
    }
  }, []);

  const simulateAgents = useCallback(async () => {
    for (let i = 0; i < AGENTS.length; i++) {
      setAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: 'working' } : a));
      await new Promise(r => setTimeout(r, 1500));
      setAgents(prev => prev.map((a, idx) => idx === i ? { ...a, status: 'completed' } : a));
    }
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setCourse(null);
    setAgents(AGENTS);
    
    try {
      const [genRes] = await Promise.all([
        gemini.generateCourse(prompt, skillLevel),
        simulateAgents()
      ]);
      setCourse(genRes);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong during generation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToLibrary = (courseToSave: Course) => {
    const updatedLibrary = [courseToSave, ...library.filter(c => c.id !== courseToSave.id)];
    setLibrary(updatedLibrary);
    localStorage.setItem('cleviq_library', JSON.stringify(updatedLibrary));
  };

  const handleProgressUpdate = (updatedCourse: Course) => {
    setCourse(updatedCourse);
    saveToLibrary(updatedCourse);
  };

  const handleReset = () => {
    setCourse(null);
    setPrompt('');
  };

  const openFromLibrary = (c: Course) => {
    setCourse(c);
  };

  const isCourseFinished = (c: Course) => {
    const totalLessons = c.modules.flatMap(m => m.lessons).length;
    return (c.completedLessonIds?.length || 0) >= totalLessons;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 glass-card px-6 py-4 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2" onClick={handleReset} style={{ cursor: 'pointer' }}>
          <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900/20">C</div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">CLEVIQ</h1>
        </div>
        {course && (
          <button 
            onClick={handleReset}
            className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            + Create New
          </button>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        {!isGenerating && !course && (
          <div className="max-w-4xl mx-auto mt-12">
            <div className="text-center mb-12">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 animate-text-gradient">CLEVIQ — The Future of Learning</p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                What do you want to <span className="animate-text-gradient">master</span> today?
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                Transform any prompt into a complete, multimodal course with a Nigerian storytelling flair.
              </p>

              <form onSubmit={handleGenerate} className="space-y-6 text-left max-w-2xl mx-auto">
                <div className="relative">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., The history of Nigerian art, How blockchain works..."
                    className="w-full h-32 px-6 py-5 rounded-3xl border-2 border-slate-800 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-950/30 bg-slate-900 text-slate-100 font-medium text-lg resize-none shadow-xl transition-all placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Learning Level</label>
                    <select 
                      value={skillLevel}
                      onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
                      className="w-full p-4 rounded-2xl border-2 border-slate-800 bg-slate-900 text-slate-100 font-bold focus:border-indigo-600 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value={SkillLevel.BEGINNER} className="bg-slate-900">Beginner - Start from scratch</option>
                      <option value={SkillLevel.INTERMEDIATE} className="bg-slate-900">Intermediate - Deepen knowledge</option>
                      <option value={SkillLevel.ADVANCED} className="bg-slate-900">Advanced - Mastery focus</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
                    >
                      Generate Course
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Library Section */}
            {library.length > 0 && (
              <div className="mt-24">
                <h3 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                  My Saved Courses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {library.map((item) => {
                    const finished = isCourseFinished(item);
                    return (
                      <div key={item.id} className="glass-card p-6 rounded-[2rem] border border-slate-800/50 hover:border-indigo-500/50 transition-all group flex flex-col h-full shadow-lg">
                        <div className="flex-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-3 inline-block ${
                            finished ? 'bg-green-950/50 text-green-400 border border-green-900/50' : 'bg-indigo-950/50 text-indigo-400 border border-indigo-900/50'
                          }`}>
                            {finished ? 'Mastered 👑' : 'In Progress'}
                          </span>
                          <h4 className="text-lg font-bold text-white mb-2 line-clamp-2">{item.title}</h4>
                          <p className="text-sm text-slate-400 line-clamp-2 mb-6 leading-relaxed">{item.description}</p>
                        </div>
                        <button 
                          onClick={() => openFromLibrary(item)}
                          className={`w-full py-3 border-2 rounded-xl font-bold text-sm transition-all ${
                            finished 
                            ? 'border-green-600 text-green-400 hover:bg-green-600 hover:text-white' 
                            : 'border-slate-800 text-slate-300 hover:border-indigo-600 hover:text-indigo-400'
                          }`}
                        >
                          {finished ? 'Review Masterclass' : 'Resume Learning'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {isGenerating && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-black text-white animate-pulse-soft">CLEVIQ is Orchestrating...</h2>
              <p className="text-slate-400 font-medium">Multi-agent parallel execution in progress</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agents.map((agent) => (
                <AgentProgress key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        )}

        {course && (
          <CourseView 
            course={course} 
            onSave={() => saveToLibrary(course)} 
            onProgressUpdate={handleProgressUpdate}
          />
        )}
      </main>

      <footer className="py-12 text-center border-t border-slate-900 bg-slate-950/80 mt-auto">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Developed by Adeyinka Meduoye</p>
        <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">&copy; {new Date().getFullYear()} All Rights Reserved</p>
      </footer>
    </div>
  );
}
