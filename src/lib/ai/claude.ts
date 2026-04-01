import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function analyzeDelegation(prompt: string): Promise<{
  should_delegate: boolean
  suggested_assignee: string | null
  reasoning: string
  confidence: number
}> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    return JSON.parse(text)
  } catch {
    return {
      should_delegate: false,
      suggested_assignee: null,
      reasoning: text,
      confidence: 0,
    }
  }
}
