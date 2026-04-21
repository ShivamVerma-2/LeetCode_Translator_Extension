chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'translate') {
    handleTranslation(message)
      .then(sendResponse)
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true;
  }
});

async function handleTranslation({ text, lang, apiKey }) {
  const systemPrompt = `You are a technical translator for competitive programming problems.

Translate the following LeetCode problem from English into ${lang.name} (${lang.native}).

Important rules:
- Translate all natural language text accurately and naturally
- Never translate code, variable names, function names, or array values
- Keep all numbers, examples, and constraints exactly as they appear
- Translate section headers like Input, Output, Explanation, Constraints, Example into ${lang.name}
- Output only the translated problem text, nothing else`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: text }
      ]
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || 'Groq API error ' + res.status);
  }

  const data = await res.json();
  const translation = data.choices?.[0]?.message?.content;

  if (!translation) throw new Error('Empty response from Groq');

  return { success: true, translation };
}
