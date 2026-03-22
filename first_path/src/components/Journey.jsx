import { useCallback } from 'react';
import { Chapter } from './Chapter';
import { chapterData } from '../data/chapters';

export const Journey = ({ branch, accentColor, answers, onAnswer, onComplete }) => {
  const chapters = chapterData[branch] || [];

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
