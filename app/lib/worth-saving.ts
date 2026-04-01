export async function isWorthSaving(userMessage: string): Promise<boolean> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'qwen3:8b',
      stream: false,
      options: { temperature: 0 },
      messages: [
        {
          role: 'system',
          content: `You are a classifier. Answer only "yes" or "no", nothing else. No thinking, no explanation.
Answer "yes" if the message contains personal facts worth remembering:
- Name, birthday, age, location
- Preferences or favorites (food, movies, colors, music)
- Something the user explicitly wants you to remember

Answer "no" if the message is:
- A question
- A greeting or small talk
- A command or task request`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }),
  });

  const data = await response.json();
  const answer = data.message?.content?.trim().toLowerCase();
  console.log(`isWorthSaving("${userMessage}") → ${answer}`);
  return answer.includes('yes');
}