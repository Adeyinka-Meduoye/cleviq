
import React, { useState } from 'react';
import { QuizQuestion, Lesson } from '../types';

interface Props {
  quiz: QuizQuestion[];
  onSuccess?: () => void;
  nextLesson?: Lesson | null;
  onContinueToNext?: () => void;
  onBackToCurriculum?: () => void;
}

export const Quiz: React.FC<Props> = ({ quiz, onSuccess, nextLesson, onContinueToNext, onBackToCurriculum }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = quiz[currentIndex];

  const handleAnswerSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswerIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsFinished(true);
      if (score >= quiz.length / 2 && onSuccess) {
        onSuccess();
      }
    }
  };

  if (isFinished) {
    const passed = score >= quiz.length / 2;
    return (
      <div className="text-center py-16 animate-in fade-in slide-in-from-bottom-8">
        <div className={`inline-block p-12 rounded-[3rem] mb-10 shadow-2xl border ${
          passed ? 'bg-green-950/20 border-green-500/30' : 'bg-red-950/20 border-red-500/30'
        }`}>
          <span className="text-7xl mb-6 block">{passed ? '🏆' : '📚'}</span>
          <h3 className="text-4xl font-black text-white mb-2">
            {passed ? 'Lesson Complete!' : 'Keep Practicing'}
          </h3>
          <p className="text-slate-400 text-lg">You scored {score} out of {quiz.length}</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          {passed && nextLesson ? (
            <button 
              onClick={onContinueToNext}
              className="w-full md:flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 shadow-xl shadow-indigo-900/30 transition-all active:scale-95"
            >
              Continue to Next Lesson
            </button>
          ) : passed && !nextLesson ? (
            <button 
              onClick={onBackToCurriculum}
              className="w-full md:flex-1 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-500 shadow-xl shadow-green-900/30 transition-all active:scale-95"
            >
              Finish Course
            </button>
          ) : (
            <button 
              onClick={() => {
                setCurrentIndex(0);
                setIsFinished(false);
                setScore(0);
                setIsAnswered(false);
              }}
              className="w-full md:flex-1 py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-700 transition-all"
            >
              Try Again
            </button>
          )}
          
          <button 
            onClick={onBackToCurriculum}
            className="w-full md:flex-1 py-4 bg-slate-900 border border-slate-800 text-slate-400 font-black rounded-2xl hover:text-white transition-all"
          >
            Back to Curriculum
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="flex justify-between items-center mb-10">
        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">Question {currentIndex + 1} of {quiz.length}</span>
        <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }} />
        </div>
      </div>

      <h3 className="text-2xl font-black text-white mb-10 leading-relaxed">
        {currentQuestion.question}
      </h3>

      <div className="grid gap-5 mb-10">
        {currentQuestion.options.map((option, i) => {
          const isCorrect = i === currentQuestion.correctAnswerIndex;
          const isSelected = i === selectedAnswer;
          
          let cardClass = "p-6 rounded-2xl border-2 transition-all text-left font-bold text-lg ";
          if (!isAnswered) {
            cardClass += "bg-slate-900 border-slate-800 hover:border-indigo-600 hover:bg-slate-800/50 text-slate-300";
          } else if (isCorrect) {
            cardClass += "bg-green-900/30 border-green-500 text-green-200 shadow-lg shadow-green-900/20";
          } else if (isSelected && !isCorrect) {
            cardClass += "bg-red-900/30 border-red-500 text-red-200 shadow-lg shadow-red-900/20";
          } else {
            cardClass += "bg-slate-950/50 border-slate-900 text-slate-600";
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswerSelect(i)}
              disabled={isAnswered}
              className={cardClass}
            >
              <div className="flex items-center gap-6">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border-2 ${
                  isSelected 
                    ? 'bg-indigo-600 text-white border-indigo-600' 
                    : isAnswered ? 'bg-slate-800/50 text-slate-500 border-slate-800' : 'bg-slate-950 text-slate-300 border-slate-700'
                }`}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{option}</span>
              </div>
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className="animate-in fade-in slide-in-from-top-4">
          <div className={`p-8 rounded-[2rem] mb-10 ${selectedAnswer === currentQuestion.correctAnswerIndex ? 'bg-green-950/20 border border-green-900/50' : 'bg-slate-800/30 border border-slate-700/50'}`}>
            <div className="flex items-center gap-2 mb-4">
               <div className={`w-2 h-2 rounded-full ${selectedAnswer === currentQuestion.correctAnswerIndex ? 'bg-green-500' : 'bg-red-500'}`} />
               <p className="text-xs font-black text-slate-100 uppercase tracking-[0.2em]">Explanation</p>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed">{currentQuestion.explanation}</p>
          </div>
          <button
            onClick={handleNext}
            className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
          >
            {currentIndex === quiz.length - 1 ? 'Finish Assessment' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
};
