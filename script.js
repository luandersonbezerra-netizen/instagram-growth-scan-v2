// VARIÁVEIS DE ESTADO
let currentScreen = 1;
let currentQuestionIndex = 0;
let userResponses = {}; 
let finalScore = 0;
let myChart = null;
let instagramHandle = ''; // ADICIONADO: Variável para armazenar o perfil

// Configuração do Diagnóstico
const questions = [
    { id: 1, title: "Estrutura", text: "Sua biografia (bio) e nome de usuário comunicam instantaneamente seu nicho, seu valor e quem você ajuda (público-alvo)?" },
    { id: 2, title: "Valor", text: "Pelo menos 70% do seu conteúdo recente é focado em entregar uma solução clara para o problema do seu público, não apenas em auto-promoção?" },
    { id: 3, title: "CTA", text: "Você utiliza CTAs claros e estratégicos (salvar, compartilhar, comentar, enviar) em todos os seus Reels e posts para engajar a audiência?" },
    { id: 4, title: "Formato", text: "Você posta Reels na frequência ideal (3-5 vezes por semana) e utiliza ganchos fortes nos primeiros 3 segundos para maximizar a retenção e o alcance?" },
    { id: 5, title: "Interação", text: "Você responde ativamente a comentários e DMs, e usa caixas de perguntas/enquetes nos Stories diariamente para construir relacionamento?" },
    { id: 6, title: "Identidade", text: "Seu perfil possui uma identidade visual, paleta de cores e tipografia consistentes que reforçam sua marca e são agradáveis de consumir?" }
];

const scoring = {
    'Sim': 3,
    'Parcial': 2,
    'Não': 1
};

const levels = [
    { score: 18, name: "VIRALIZAÇÃO MÁXIMA", class: "magnetic", desc: "Seu perfil está totalmente otimizado e pronto para a viralização. Foco em escala e consistência." },
    { score: 14, name: "CRESCIMENTO ESTRATÉGICO", class: "estrategico", desc: "Você tem uma base forte! Ajustes finos em CTA e retenção podem te levar ao próximo nível." },
    { score: 8, name: "CONTEÚDO DESALINHADO", class: "desalinhado", desc: "Você está postando, mas sem estratégia clara. É preciso alinhar nicho, valor e formato urgente." },
    { score: 0, name: "PERFIL INVISÍVEL", class: "invisivel", desc: "Seu perfil carece de elementos básicos de comunicação e atração. Pare de postar e comece a reestruturar!" }
];

// FUNÇÃO MODIFICADA PARA VALIDAR O PERFIL ANTES DE IR PARA O QUIZ
function validateAndGoToQuiz() {
    const handleInput = document.getElementById('instagramHandle');
    let handle = handleInput.value.trim();

    if (handle === "") {
        alert("Por favor, insira seu perfil do Instagram para começar a análise.");
        return;
    }
    
    // Limpa o @ se o usuário digitar (ex: @perfil -> perfil)
    instagramHandle = handle.startsWith('@') ? handle.substring(1) : handle;
    
    goToScreen(2);
}

function goToScreen(screenNumber) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`screen-${screenNumber}`).classList.add('active');

    if (screenNumber === 2) {
        renderQuestion(currentQuestionIndex);
    } else if (screenNumber === 3) {
        calculateResult();
    } else if (screenNumber === 4) {
        generateAiReport();
    }
}

function renderQuestion(index) {
    if (index >= questions.length) {
        goToScreen(3); 
        return;
    }
    const q = questions[index];
    document.getElementById('current-question-title').textContent = q.title.toUpperCase(); 
    const container = document.getElementById('questions-container');
    container.innerHTML = `
        <div class="question-item" data-question-id="${q.id}">
            <h3>${q.text}</h3>
            <div class="options-group">
                ${Object.keys(scoring).map(option => `
                    <button class="option-button" data-score="${scoring[option]}" onclick="selectOption(this, ${q.id})">${option}</button>
                `).join('')}
            </div>
        </div>
    `;
    const nextButton = document.querySelector('#screen-2 .cta-button');
    nextButton.textContent = (index === questions.length - 1) ? 'FINALIZAR DIAGNÓSTICO' : 'PRÓXIMA PERGUNTA';
}

function selectOption(button, questionId) {
    const score = parseInt(button.dataset.score);
    userResponses[questionId] = score;
    const optionsGroup = button.parentNode;
    optionsGroup.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    document.querySelector('#screen-2 .cta-button').disabled = false;
}

function nextQuestion() {
    // Garante que a resposta foi dada ou assume 1 (Não) para não travar
    const currentQ = questions[currentQuestionIndex];
    if (userResponses[currentQ.id] === undefined) {
        userResponses[currentQ.id] = 1;
    }
    currentQuestionIndex++;
    renderQuestion(currentQuestionIndex);
}

// FUNÇÃO DE RESULTADO - GERA O GRÁFICO
function calculateResult() {
    finalScore = Object.values(userResponses).reduce((sum, score) => sum + score, 0);
    document.getElementById('final-score').textContent = finalScore;
    
    let finalLevel = levels.find(l => finalScore >= l.score) || levels[levels.length - 1];
    if (finalScore === 18) { finalLevel = levels[0]; }
    else if (finalScore >= 14) { finalLevel = levels[1]; }
    else if (finalScore >= 8) { finalLevel = levels[2]; }
    else { finalLevel = levels[3]; }
    const levelBadge = document.getElementById('final-level');
    levelBadge.textContent = finalLevel.name;
    levelBadge.className = 'level-badge ' + finalLevel.class;
    document.getElementById('level-description').textContent = finalLevel.desc;

    // --- LÓGICA DO GRÁFICO DE RADAR ---

    if (myChart) {
        myChart.destroy();
    }

    const chartLabels = questions.map(q => q.title.toUpperCase());
    const chartData = questions.map(q => userResponses[q.id] || 1); 

    const ctx = document.getElementById('growthChart').getContext('2d');
    
    myChart = new Chart(ctx, {
        type: 'radar', 
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Seu Nível',
                data: chartData,
                fill: true,
                backgroundColor: 'rgba(0, 255, 255, 0.2)', 
                borderColor: 'rgb(0, 255, 255)', 
                pointBackgroundColor: 'rgb(0, 255, 255)', 
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(0, 255, 255)'
            }]
        },
        options: {
            responsive: true,
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.2)' 
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.2)' 
                    },
                    pointLabels: {
                        color: 'rgb(224, 224, 224)', 
                        font: {
                            family: "'Orbitron', sans-serif",
                            size: 10
                        }
                    },
                    ticks: {
                        color: 'rgb(224, 224, 224)', 
                        backdropColor: 'rgba(0, 0, 0, 0)', 
                        min: 0,
                        max: 3, 
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false 
                }
            }
        }
    });
}

// FUNÇÃO DA IA - MODIFICADA PARA INCLUIR O PERFIL
async function generateAiReport() {
    const reportContentDiv = document.getElementById('ai-report-text');
    reportContentDiv.innerHTML = '<p class="loading-text">Analisando suas respostas e gerando o plano de ação...</p><div class="spinner"></div>';

    const analysisData = questions.map(q => {
        const score = userResponses[q.id] || 1; 
        const responseText = Object.keys(scoring).find(key => scoring[key] === score);
        return `- ${q.title}: ${responseText} (${score} pts)`;
    }).join('\n');
    
    const userLevel = document.getElementById('final-level').textContent;
    const profileContext = instagramHandle ? `do perfil @${instagramHandle}` : 'do seu perfil (não fornecido)'; // ADICIONADO CONTEXTO

    const aiPrompt = `
        Com base nas seguintes respostas do usuário ${profileContext} (Pontuação Total: ${finalScore} / 18, Nível: ${userLevel}):
        ${analysisData}
        
        Gere um diagnóstico profissional e direto sobre o posicionamento e estratégia de viralização do perfil, explicando:
        1. **O que está travando o crescimento e a viralização** (Baseado nos 'Não' e 'Parcial').
        2. **Onde há falhas na narrativa e autoridade** (Baseado nos pontos fracos em 'Estrutura' e 'Valor').
        3. **O que pode ser ajustado nas próximas 48 horas** (Dicas práticas e imediatas: Bio, CTA, Ganchos).
        4. **Recomendação final estratégica** para atingir o nível de Viralização Máxima.
        
        Use linguagem consultiva, objetiva e elegante. Formate a resposta para HTML (use <p>, <strong>, <h3> e <ul>/<li>).
    `;

    try {
        const response = await fetch('/api/generateReport', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt: aiPrompt }), 
        });

        if (!response.ok) {
            throw new Error(`Erro da API: ${response.statusText}`);
        }

        const data = await response.json();
        const aiReport = data.report; 

        reportContentDiv.innerHTML = aiReport;

    } catch (error) {
        console.error("Erro ao gerar relatório de IA:", error);
        reportContentDiv.innerHTML = `<p class="loading-text" style="color: #ff0000;">Erro ao conectar com o serviço de IA. Tente novamente mais tarde.</p>`;
    }
}

function resetApp() {
    currentScreen = 1;
    currentQuestionIndex = 0;
    userResponses = {};
    finalScore = 0;
    instagramHandle = ''; // Limpa o perfil
    
    if (myChart) {
        myChart.destroy();
    }
    
    goToScreen(1);
    document.querySelector('#screen-2 .cta-button').disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    goToScreen(1);
    document.body.style.display = 'block';
    if(document.getElementById('app-container')) {
        document.getElementById('app-container').style.margin = '50px auto';
    }
});
