export function useGreeting() {
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour <= 14) {
      return {
        text: 'Buenos días',
        emoji: '☀️',
        period: 'morning'
      };
    } else if (hour > 14 && hour <= 19) {
      return {
        text: 'Buenas tardes',
        emoji: '🌤️',
        period: 'afternoon'
      };
    } else {
      return {
        text: 'Buenas noches',
        emoji: '🌙',
        period: 'night'
      };
    }
  };

  return getGreeting();
}
