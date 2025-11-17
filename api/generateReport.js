// /api/generateReport.js

// 1. Importar o SDK de IA do Google
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 2. Função principal (Handler) que a Vercel irá executar
export default async function handler(request, response) {
    // Apenas permitir requisições POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Método não permitido' });
    }

    try {
        // 3. Pegar a Chave de API das Variáveis de Ambiente (Segurança)
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error("Chave de API do Gemini não configurada");
        }
        
        // 4. Inicializar o cliente do Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel("gemini-1.5-flash"); // Modelo rápido

        // 5. Pegar o prompt que o frontend enviou
        const { prompt } = request.body;
        if (!prompt) {
            return response.status(400).json({ error: 'Prompt não fornecido' });
        }

        // 6. Gerar o conteúdo
        const generationConfig = {
            temperature: 0.7,
            topP: 1,
            topK: 1,
            maxOutputTokens: 2048,
            // Importante: Dizer para a IA gerar HTML
            responseMimeType: "text/html", 
        };
        
        const result = await model.generateContent(prompt, generationConfig);
        const aiResponse = result.response;
        const reportText = aiResponse.text();

        // 7. Enviar o relatório de volta para o frontend
        response.status(200).json({ report: reportText });

    } catch (error) {
        console.error("Erro na API do Gemini:", error);
        response.status(500).json({ error: 'Falha ao gerar o relatório de IA.' });
    }
}
