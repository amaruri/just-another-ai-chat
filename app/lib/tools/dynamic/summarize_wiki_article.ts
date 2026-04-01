
import { tool } from 'ai';
import { z } from 'zod';

// Auto-generated dynamic tool
export const summarize_wiki_article = tool({
  description: 'Fetches a random Wikipedia article, retrieves its title, and returns a summary.',
  inputSchema: z.object({}),
  execute: async (args) => {
    console.log('Hello from summarize_wiki_article');

    const response = await fetch('https://es.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=1&format=json');
    const data = await response.json();
    const title = data.query.random[0].title;
    const articleUrl = `https://es.wikipedia.org/wiki/${title}`;
    const articleResponse = await fetch(articleUrl);
    const articleData = await articleResponse.text();
    return articleData;
  },
});
