const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Send a prompt to the AI Bot
// @route   POST /api/ai/chat
// @access  Private (Logged in users)
const chatWithAI = async (req, res) => {
    try {
        const { prompt, history } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ message: 'Prompt is required' });
        }

        // 1. Initialize the SDK with your secret key
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // 2. Select the model and give it the TechTown context
        const model = genAI.getGenerativeModel({ 
            model: 'gemini-1.5-flash',
            systemInstruction: "You are a Level-3 AI Customer Support Bot for TechTown, a premier electronics multi-vendor marketplace in Bangladesh. You help users with product questions, store policies, and general technical support. Keep answers concise, helpful, and polite. Never provide backend code to users."
        });

        let responseText;

        // 3. Generate response using multi-turn chat if history exists, otherwise single-turn
        if (history && Array.isArray(history) && history.length > 0) {
            // Format history to match Gemini's API expectations:
            // Role must be 'user' or 'model', parts must be [{ text: '...' }]
            const formattedHistory = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.parts?.[0]?.text || msg.text || '' }]
            }));

            const chat = model.startChat({
                history: formattedHistory
            });
            const result = await chat.sendMessage(prompt);
            responseText = result.response.text();
        } else {
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
        }

        // 4. Send it back to the React frontend
        res.status(200).json({ reply: responseText });
    } catch (error) {
        console.error('AI Error:', error.message);
        res.status(500).json({ message: 'AI failed to generate response' });
    }
};

module.exports = { chatWithAI };