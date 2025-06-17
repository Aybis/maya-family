// AI Service for processing receipts and extracting transaction data
// This file contains the integration logic for OpenAI and Google Gemini APIs

interface AIProcessingResult {
  amount: number;
  description: string;
  category: string;
  items: string[];
  merchant?: string;
  date?: string;
  confidence: number;
}

interface AIServiceConfig {
  provider: 'openai' | 'gemini';
  apiKey: string;
}

class AIService {
  private config: AIServiceConfig;

  constructor(config: AIServiceConfig) {
    this.config = config;
  }

  async processReceipt(imageData: string): Promise<AIProcessingResult> {
    switch (this.config.provider) {
      case 'openai':
        return this.processWithOpenAI(imageData);
      case 'gemini':
        return this.processWithGemini(imageData);
      default:
        throw new Error('Unsupported AI provider');
    }
  }

  private async processWithOpenAI(imageData: string): Promise<AIProcessingResult> {
    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      {
        "amount": number (total amount),
        "description": string (brief description of purchase),
        "category": string (one of: Food, Transportation, Bills, Entertainment, Healthcare, Education, Shopping, Others),
        "items": array of strings (list of purchased items),
        "merchant": string (store/merchant name),
        "date": string (date in YYYY-MM-DD format),
        "confidence": number (confidence score between 0-1)
      }
      
      Be accurate with numbers and categorization. If information is unclear, use reasonable defaults.
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 500,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return this.validateAndNormalizeResult(result);
    } catch (error) {
      console.error('OpenAI processing error:', error);
      throw new Error('Failed to process receipt with OpenAI');
    }
  }

  private async processWithGemini(imageData: string): Promise<AIProcessingResult> {
    const prompt = `
      Extract transaction details from this receipt image. Return only valid JSON with this exact structure:
      {
        "amount": number,
        "description": "brief description",
        "category": "Food|Transportation|Bills|Entertainment|Healthcare|Education|Shopping|Others",
        "items": ["item1", "item2"],
        "merchant": "store name",
        "date": "YYYY-MM-DD",
        "confidence": 0.85
      }
      
      Be precise with amounts and use appropriate categories. If date is unclear, use today's date.
    `;

    try {
      // Remove the data URL prefix for Gemini
      const base64Image = imageData.split(',')[1];

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${this.config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`);
      }

      const data = await response.json();
      const resultText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response (Gemini sometimes includes extra text)
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const result = JSON.parse(jsonMatch[0]);
      return this.validateAndNormalizeResult(result);
    } catch (error) {
      console.error('Gemini processing error:', error);
      throw new Error('Failed to process receipt with Gemini');
    }
  }

  private validateAndNormalizeResult(result: any): AIProcessingResult {
    // Validate and normalize the AI response
    const validCategories = ['Food', 'Transportation', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Shopping', 'Others'];
    
    return {
      amount: Math.max(0, Number(result.amount) || 0),
      description: String(result.description || 'Transaction'),
      category: validCategories.includes(result.category) ? result.category : 'Others',
      items: Array.isArray(result.items) ? result.items.map(String) : [],
      merchant: result.merchant ? String(result.merchant) : undefined,
      date: this.validateDate(result.date) || new Date().toISOString().split('T')[0],
      confidence: Math.min(1, Math.max(0, Number(result.confidence) || 0.5))
    };
  }

  private validateDate(dateString: string): string | null {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    
    return date.toISOString().split('T')[0];
  }
}

// Factory function to create AI service instance
export function createAIService(provider: 'openai' | 'gemini', apiKey: string): AIService {
  return new AIService({ provider, apiKey });
}

// Mock AI service for development/demo purposes
export class MockAIService {
  async processReceipt(imageData: string): Promise<AIProcessingResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate realistic mock data
    const mockResults = [
      {
        amount: 125000,
        description: 'Groceries from Supermarket',
        category: 'Food',
        items: ['Milk 1L', 'Bread', 'Eggs 12pcs', 'Rice 5kg'],
        merchant: 'Supermarket ABC',
        date: new Date().toISOString().split('T')[0],
        confidence: 0.92
      },
      {
        amount: 75000,
        description: 'Gas Station Purchase',
        category: 'Transportation',
        items: ['Gasoline', 'Car wash'],
        merchant: 'Shell Gas Station',
        date: new Date().toISOString().split('T')[0],
        confidence: 0.88
      },
      {
        amount: 250000,
        description: 'Pharmacy Purchase',
        category: 'Healthcare',
        items: ['Medicine', 'Vitamins', 'First aid kit'],
        merchant: 'Guardian Pharmacy',
        date: new Date().toISOString().split('T')[0],
        confidence: 0.95
      }
    ];

    return mockResults[Math.floor(Math.random() * mockResults.length)];
  }
}

export default AIService;