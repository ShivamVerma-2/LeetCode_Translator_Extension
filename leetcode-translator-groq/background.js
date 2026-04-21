chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'translate') {
    handleTranslation(message).then(sendResponse).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});

async function handleTranslation({ text, lang, apiKey }) {
  const systemPrompt = `You are a technical translator specializing in programming and algorithm problems.

Your job is to translate LeetCode problem statements from English into ${lang.name} (${lang.native}).

Rules:
- Translate ALL natural language text accurately
- Keep ALL code, variable names, function names, numbers, and examples EXACTLY as-is
- Keep mathematical notation exactly as-is
- Preserve the full structure: title, description, examples, constraints
- Keep "Input:", "Output:", "Explanation:", "Constraints:", "Example 1:", etc. translated into ${lang.name}
- Output ONLY the translated problem. No preamble, no explanations.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
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

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq API error ${response.status}`);
  }

  const data = await response.json();
  const translation = data.choices?.[0]?.message?.content;

  if (!translation) throw new Error('Empty response from Groq');

  return { success: true, translation };
}
