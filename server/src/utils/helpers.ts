export const generateTempPassword = (length = 12) => {
  // Separate character classes
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()';

  // Ensure at least one character from each required class
  const requiredChars = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  // Generate remaining characters
  const allChars = uppercase + lowercase + numbers + symbols;
  const remaining = Array.from({ length: length - 4 }, () => 
    allChars[Math.floor(Math.random() * allChars.length)]
  );

  // Combine and shuffle
  return shuffle([...requiredChars, ...remaining]).join('');
};

const shuffle = (array: string[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};