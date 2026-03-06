import { useState, useEffect, useCallback } from 'react';

interface Quote {
  text: string;
  author: string;
}

const quotes: Quote[] = [
  {
    text: "El éxito es la suma de pequeños esfuerzos repetidos día tras día.",
    author: "Robert Collier"
  },
  {
    text: "Tu única limitación eres tú mismo.",
    author: "Anónimo"
  },
  {
    text: "La productividad no se trata de hacer más cosas, sino de hacer las cosas correctas.",
    author: "Tim Ferriss"
  },
  {
    text: "Un pequeño progreso cada día suma grandes resultados.",
    author: "Anónimo"
  },
  {
    text: "La diferencia entre lo ordinario y lo extraordinario es ese pequeño 'extra'.",
    author: "Jimmy Johnson"
  },
  {
    text: "No esperes el momento perfecto, toma el momento y hazlo perfecto.",
    author: "Anónimo"
  },
  {
    text: "El bienestar es el resultado de pequeñas decisiones conscientes cada día.",
    author: "Anónimo"
  },
  {
    text: "Cada día es una nueva oportunidad para ser mejor que ayer.",
    author: "Anónimo"
  },
  {
    text: "La felicidad no es un destino, es una forma de viajar.",
    author: "Roy Goodman"
  },
  {
    text: "Cuida tu cuerpo, es el único lugar que tienes para vivir.",
    author: "Jim Rohn"
  },
  {
    text: "La disciplina es el puente entre metas y logros.",
    author: "Jim Rohn"
  },
  {
    text: "No importa lo lento que vayas, mientras no te detengas.",
    author: "Confucio"
  },
  {
    text: "El conocimiento es poder, pero el conocimiento aplicado es poder supremo.",
    author: "Tony Robbins"
  },
  {
    text: "La motivación te hace empezar, el hábito te hace continuar.",
    author: "Jim Ryun"
  },
  {
    text: "Los sueños no funcionan a menos que tú lo hagas.",
    author: "John C. Maxwell"
  },
  {
    text: "El éxito no es definitivo, el fracaso no es fatal: lo que cuenta es el valor para continuar.",
    author: "Winston Churchill"
  },
  {
    text: "La única manera de hacer un gran trabajo es amar lo que haces.",
    author: "Steve Jobs"
  },
  {
    text: "El aprendizaje nunca agota la mente.",
    author: "Leonardo da Vinci"
  },
  {
    text: "La educación es el arma más poderosa que puedes usar para cambiar el mundo.",
    author: "Nelson Mandela"
  },
  {
    text: "No te compares con otros. Compárate con quien eras ayer.",
    author: "Anónimo"
  },
  {
    text: "El tiempo que disfrutas perdiendo no es tiempo perdido.",
    author: "Marthe Troly-Curtin"
  },
  {
    text: "La constancia es la virtud por la cual todas las otras virtudes dan fruto.",
    author: "Arturo Graf"
  },
  {
    text: "Un estudiante inteligente está siempre listo para reconocer y apreciar lo que ha aprendido de otros.",
    author: "Anónimo"
  },
  {
    text: "El futuro pertenece a aquellos que se preparan para él hoy.",
    author: "Anónimo"
  }
];

export function useMotivationalMessage() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(() => 
    Math.floor(Math.random() * quotes.length)
  );

  const currentQuote = quotes[currentQuoteIndex];

  const refreshMessage = useCallback(() => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * quotes.length);
    } while (newIndex === currentQuoteIndex && quotes.length > 1);
    
    setCurrentQuoteIndex(newIndex);
  }, [currentQuoteIndex]);

  useEffect(() => {
    // Auto-refresh every 15 minutes
    const interval = setInterval(refreshMessage, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshMessage]);

  return {
    message: currentQuote.text,
    author: currentQuote.author,
    refreshMessage
  };
}
