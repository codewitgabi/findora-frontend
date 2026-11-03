import { useEffect, useState } from "react";

interface TypewriterOptions {
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

export function useTypewriter(
  words: string[],
  { typingSpeed = 70, deletingSpeed = 40, pauseDuration = 1600 }: TypewriterOptions = {},
) {
  const [wordIndex, setWordIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const atWordEnd = !deleting && subIndex === currentWord.length;
    const atWordStart = deleting && subIndex === 0;
    const delay = atWordEnd
      ? pauseDuration
      : deleting
        ? deletingSpeed
        : typingSpeed;

    const timeout = setTimeout(() => {
      if (atWordEnd) {
        setDeleting(true);
      } else if (atWordStart) {
        setDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      } else {
        setSubIndex((prev) => prev + (deleting ? -1 : 1));
      }
    }, delay);

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return words[wordIndex].slice(0, subIndex);
}
