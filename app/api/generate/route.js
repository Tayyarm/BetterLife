import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
You are a supportive AI habit coach. For each bad habit, provide 3 specific recommendations.
Return your response in this exact JSON format:
{
  "recommendations": [
    {
      "title": "Short actionable title",
      "description": "Detailed explanation of the strategy"
    }
  ]
}

Your recommendations should:
1. Be practical and immediately actionable
2. Focus on positive replacement behaviors
3. Include specific triggers and strategies
4. Be encouraging and non-judgmental
5. Emphasize gradual progress

Avoid:
- Medical or professional health advice
- Extreme measures
- Shame or criticism
- Unrealistic expectations
`;

export async function POST(req) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        recommendations: [{
          title: "Configuration Error",
          description: "OpenAI API key is not configured."
        }]
      });
    }

    const openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    });
    
    const data = await req.text();

    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: data },
      ],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 1000
    });

    try {
      // Parse the response text as JSON
      const responseText = completion.choices[0].message.content;
      const parsedResponse = JSON.parse(responseText);
      
      // Ensure we always return an array of recommendations
      const recommendations = parsedResponse.recommendations || [];
      
      return NextResponse.json({
        recommendations: recommendations.length > 0 ? recommendations : [{
          title: "Default Recommendation",
          description: "Try replacing this habit with a positive alternative activity."
        }]
      });

    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      return NextResponse.json({
        recommendations: [{
          title: "General Advice",
          description: completion.choices[0].message.content
        }]
      });
    }

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      recommendations: [{
        title: "Error Loading Recommendations",
        description: "Unable to load recommendations at this time. Please try again later."
      }]
    });
  }
}