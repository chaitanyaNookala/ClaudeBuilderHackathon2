import { useState, useEffect, useCallback } from 'react';
import { Chapter } from './Chapter';
import { generateQuestions } from '../api/roadmap';

export const Journey = ({ branch, accentColor, answers, onAnswer, onComplete, profileData }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        if (!profileData) {
          const { chapterData } = await import('../data/chapters');
          setChapters(chapterData[branch] || []);
          return;
        }
        const questions = await generateQuestions(profileData, branch);
        if (Array.isArray(questions) && questions.length > 0) {
          setChapters(questions);
        } else {
          const { chapterData } = await import('../data/chapters');
          setChapters(chapterData[branch] || []);
        }
      } catch (err) {
        console.error('Failed to generate questions:', err);
        const { chapterData } = await import('../data/chapters');
        setChapters(chapterData[branch] || []);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, [branch, profileData]);

  useEffect(() => {
    if (loading || chapters.length === 0) return;
    const first = chapters[0];
    requestAnimationFrame(() => {
      document
        .querySelector(`[data-testid="chapter-${first.num}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [loading, chapters]);

  const handleAnswer = useCallback((chapterNum, question, answer) => {
    onAnswer(question, answer);
    setTimeout(() => {
      const nextIndex = chapters.findIndex(c => c.num === chapterNum) + 1;
      if (nextIndex < chapters.length) {
        const nextEl = document.querySelector(`[data-testid="chapter-${chapters[nextIndex].num}"]`);
        if (nextEl) nextEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        onComplete();
      }
    }, 600);
  }, [chapters, onAnswer, onComplete]);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center z-10 relative">
      <div className="flex gap-2 mb-4">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: accentColor, animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
      <p className="font-mono text-xs tracking-widest uppercase text-zinc-500">
        Crafting your personal journey...
      </p>
    </div>
  );

  return (
    <div data-testid="journey-container">
      {chapters.map((chapter) => (
        <Chapter
          key={chapter.num}
          num={chapter.num}
          scene={chapter.scene}
          story={chapter.story}
          question={chapter.question}
          options={chapter.options}
          accentColor={accentColor}
          selectedAnswer={answers[chapter.question]}
          onAnswer={(answer) => handleAnswer(chapter.num, chapter.question, answer)}
        />
      ))}
    </div>
  );
};
