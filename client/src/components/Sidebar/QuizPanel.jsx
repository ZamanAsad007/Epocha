import React, { useState, useEffect } from 'react';
import useMapStore from '../../store/mapStore';
import LoadingSpinner from '../UI/LoadingSpinner';
import { api } from '../../utils/api.js';

const QuizPanel = ({ placeId, onBack }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  const { isGuest } = useMapStore();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get(`/api/quiz/${placeId}`);
        setQuestions(response.data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [placeId]);

  const handleAnswer = (optionKey) => {
    if (selectedAnswer) return;

    setSelectedAnswer(optionKey);
    const correct = optionKey === questions[currentIndex].correctAnswer;
    setIsCorrect(correct);
    if (correct) setScore(prev => prev + 1);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        const finalScore = correct ? score + 1 : score;
        setShowResult(true);
        saveScore(finalScore);
      }
    }, 1500);
  };

  const saveScore = async (finalScore) => {
    if (isGuest) return;
    try {
      await api.post(`/api/quiz/${placeId}/score`, {
        score: finalScore,
        total: questions.length
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (questions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-text-muted italic">No quiz questions available for this location yet.</p>
        <button onClick={onBack} className="mt-4 text-primary uppercase text-xs font-bold tracking-widest">Go Back</button>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="text-center py-10 space-y-6">
        <h3 className="text-3xl font-heading text-primary">Mission Complete</h3>
        <div className="text-6xl font-mono">{score}/{questions.length}</div>
        <p className="text-text-secondary">
          {score === questions.length ? "Master of History!" : "Keep exploring, seeker."}
        </p>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setShowResult(false);
              setSelectedAnswer(null);
            }}
            className="w-full py-3 bg-primary text-background-panel font-bold rounded"
          >
            TRY AGAIN
          </button>
          <button onClick={onBack} className="w-full py-3 border border-border text-text-primary font-bold rounded">
            VIEW ARCHIVE
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <span className="font-mono text-xs text-text-muted uppercase tracking-widest">Archive Quiz</span>
        <span className="font-mono text-xs text-primary">{currentIndex + 1} / {questions.length}</span>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-heading text-text-primary leading-tight">
          {currentQuestion.question}
        </h2>

        <div className="grid gap-3">
          {currentQuestion.options.map((opt) => {
            const isSelected = selectedAnswer === opt.key;
            const isThisCorrect = opt.key === currentQuestion.correctAnswer;
            
            let buttonClass = "w-full p-4 rounded border border-border bg-background-card text-left transition-all duration-300 ";
            if (isSelected) {
              buttonClass += isCorrect ? "border-success bg-success/10 text-success " : "border-war bg-war/10 text-war ";
            } else if (selectedAnswer && isThisCorrect) {
              buttonClass += "border-success bg-success/10 text-success ";
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                disabled={!!selectedAnswer}
                className={buttonClass}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono opacity-40">{opt.key.toUpperCase()}</span>
                  <span className="font-sans text-sm">{opt.text}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-1 bg-background-card rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuizPanel;
