// Configuração das perguntas da pesquisa
const surveyQuestions = [
    {
        id: 'comunicacao_1',
        text: 'A comunicação da liderança é clara e eficaz',
        category: 'comunicacao',
        weight: 0.3
    },
    {
        id: 'comunicacao_2', 
        text: 'Recebo feedback construtivo sobre meu desempenho',
        category: 'comunicacao',
        weight: 0.2
    },
    {
        id: 'lideranca_1',
        text: 'Meu gestor demonstra confiança em minha capacidade',
        category: 'lideranca',
        weight: 0.25
    },
    {
        id: 'lideranca_2',
        text: 'A liderança toma decisões de forma justa e transparente',
        category: 'lideranca',
        weight: 0.25
    },
    {
        id: 'lideranca_3',
        text: 'Sinto-me apoiado pela liderança em momentos desafiadores',
        category: 'lideranca',
        weight: 0.2
    },
    {
        id: 'ambiente_1',
        text: 'O ambiente de trabalho promove colaboração entre as equipes',
        category: 'ambiente',
        weight: 0.3
    },
    {
        id: 'ambiente_2',
        text: 'Sinto-me confortável para expressar minhas opiniões',
        category: 'ambiente',
        weight: 0.25
    },
    {
        id: 'ambiente_3',
        text: 'O equilíbrio entre vida pessoal e profissional é respeitado',
        category: 'ambiente',
        weight: 0.2
    },
    {
        id: 'desenvolvimento_1',
        text: 'Tenho oportunidades de crescimento e desenvolvimento',
        category: 'desenvolvimento',
        weight: 0.3
    },
    {
        id: 'desenvolvimento_2',
        text: 'Recebo treinamentos adequados para desempenhar minha função',
        category: 'desenvolvimento',
        weight: 0.25
    }
];

// Estado da aplicação
const appState = {
    currentResponses: {},
    allStoredResponses: [],
    isLoggedIn: false,
    currentStep: 0
};

// Elementos da interface
const uiElements = {
    feedbackSection: document.getElementById('feedback-section'),
    dashboardSection: document.getElementById('dashboard-section'),
    questionsContainer: document.getElementById('questions-container'),
    submitBtn: document.getElementById('submit-btn'),
    thankYouMessage: document.getElementById('thank-you-message'),
    newResponseBtn: document.getElementById('new-response-btn'),
    accessDashboardBtn: document.getElementById('access-dashboard-btn'),
    loginForm: document.getElementById('login-form'),
    resultsDashboard: document.getElementById('results-dashboard'),
    loginBtn: document.getElementById('login-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    loginError: document.getElementById('login-error'),
    dashboardUsername: document.getElementById('dashboard-username'),
    dashboardPassword: document.getElementById('dashboard-password'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    totalResponses: document.getElementById('total-responses'),
    exportBtn: document.getElementById('export-btn'),
    improvementText: document.getElementById('improvement'),
    goodPointsText: document.getElementById('good_points')
};

// Classe para gerenciar o armazenamento local
class DataManager {
    constructor() {
        this.storageKey = 'clima_organizacional_responses';
        this.loadData();
    }

    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            appState.allStoredResponses = stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            appState.allStoredResponses = [];
        }
    }

    saveResponse(response) {
        const responseWithTimestamp = {
            ...response,
            timestamp: new Date().toISOString(),
            id: Date.now().toString()
        };
        
        appState.allStoredResponses.push(responseWithTimestamp);
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(appState.allStoredResponses));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }

    exportData() {
        const dataStr = JSON.stringify(appState.allStoredResponses, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `clima_organizacional_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    clearData() {
        if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem(this.storageKey);
            appState.allStoredResponses = [];
            return true;
        }
        return false;
    }
}

// Classe para calcular métricas
class MetricsCalculator {
    static calculateCategoryAverage(category) {
        const categoryQuestions = surveyQuestions.filter(q => q.category === category);
        const responses = appState.allStoredResponses;
        
        if (responses.length === 0) return 0;
        
        let totalWeightedScore = 0;
        let totalWeight = 0;
        
        responses.forEach(response => {
            categoryQuestions.forEach(question => {
                const score = response.ratings[question.id];
                if (score) {
                    totalWeightedScore += score * question.weight;
                    totalWeight += question.weight;
                }
            });
        });
        
        return totalWeight > 0 ? (totalWeightedScore / totalWeight / responses.length) : 0;
    }
    
    static calculateOverallAverage() {
        const categories = ['comunicacao', 'lideranca', 'ambiente', 'desenvolvimento'];
        const categoryAverages = categories.map(cat => this.calculateCategoryAverage(cat));
        const validAverages = categoryAverages.filter(avg => avg > 0);
        
        return validAverages.length > 0 
            ? validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length 
            : 0;
    }
    
    static getEvolutionData() {
        const responses = appState.allStoredResponses.slice(-10); // Últimas 10 respostas
        return responses.map((response, index) => ({
            x: index + 1,
            y: this.calculateResponseAverage(response)
        }));
    }
    
    static calculateResponseAverage(response) {
        const ratings = Object.values(response.ratings);
        return ratings.length > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
            : 0;
    }
}

// Inicializar gerenciador de dados
const dataManager = new DataManager();

// Função para renderizar as perguntas
function renderQuestions() {
    uiElements.questionsContainer.innerHTML = '';
    
    surveyQuestions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'p-4 rounded-lg shadow-inner';
        questionDiv.style.backgroundColor = '#19234f';
        
        questionDiv.innerHTML = `
            <label class="block font-medium mb-3" style="color:#66c1b0;">
                ${index + 1}. ${question.text}
            </label>
            <div class="rating-scale">
                ${[1, 2, 3, 4, 5].map(value => `
                    <button type="button" 
                            class="rating-button" 
                            data-question="${question.id}" 
                            data-value="${value}"
                            title="${getRatingLabel(value)}">
                        ${value}
                    </button>
                `).join('')}
            </div>
            <div class="flex justify-between text-xs mt-2" style="color:#FFFFFF;">
                <span>Discordo totalmente</span>
                <span>Concordo totalmente</span>
            </div>
        `;
        
        uiElements.questionsContainer.appendChild(questionDiv);
    });
    
    // Adicionar event listeners para os botões de rating
    document.querySelectorAll('.rating-button').forEach(button => {
        button.addEventListener('click', handleRatingClick);
    });
}

function getRatingLabel(value) {
    const labels = {
        1: 'Discordo totalmente',
        2: 'Discordo',
        3: 'Neutro',
        4: 'Concordo',
        5: 'Concordo totalmente'
    };
    return labels[value];
}

function handleRatingClick(event) {
    const button = event.target;
    const questionId = button.dataset.question;
    const value = parseInt(button.dataset.value);
    
    // Remover seleção anterior da mesma pergunta
    document.querySelectorAll(`[data-question="${questionId}"]`).forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Adicionar seleção ao botão clicado
    button.classList.add('selected');
    
    // Salvar resposta no estado
    appState.currentResponses[questionId] = value;
    
    // Atualizar barra de progresso
    updateProgress();
}

function updateProgress() {
    const totalQuestions = surveyQuestions.length;
    const answeredQuestions = Object.keys(appState.currentResponses).length;
    const progress = (answeredQuestions / totalQuestions) * 100;
    
    uiElements.progressFill.style.width = `${progress}%`;
    uiElements.progressText.textContent = `${Math.round(progress)}%`;
}

function validateForm() {
    const totalQuestions = surveyQuestions.length;
    const answeredQuestions = Object.keys(appState.currentResponses).length;
    
    if (answeredQuestions < totalQuestions) {
        alert(`Por favor, responda todas as ${totalQuestions} perguntas antes de enviar.`);
        return false;
    }
    
    return true;
}

function submitFeedback() {
    if (!validateForm()) return;
    
    const response = {
        ratings: { ...appState.currentResponses },
        improvement: uiElements.improvementText.value.trim(),
        goodPoints: uiElements.goodPointsText.value.trim()
    };
    
    const success = dataManager.saveResponse(response);
    
    if (success) {
        // Mostrar mensagem de sucesso
        document.getElementById('feedback-form').classList.add('hidden');
        uiElements.thankYouMessage.classList.remove('hidden');
        
        // Limpar formulário
        appState.currentResponses = {};
        uiElements.improvementText.value = '';
        uiElements.goodPointsText.value = '';
        
        // Resetar progresso
        updateProgress();
        
        console.log('Resposta salva com sucesso!');
    } else {
        alert('Erro ao salvar resposta. Tente novamente.');
    }
}

function resetForm() {
    // Mostrar formulário e esconder mensagem de agradecimento
    document.getElementById('feedback-form').classList.remove('hidden');
    uiElements.thankYouMessage.classList.add('hidden');
    
    // Limpar seleções
    document.querySelectorAll('.rating-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Limpar estado
    appState.currentResponses = {};
    updateProgress();
}

function renderDashboard() {
    // Atualizar contador de respostas
    uiElements.totalResponses.textContent = `${appState.allStoredResponses.length} respostas`;
    
    // Calcular e exibir métricas
    const comunicacao = MetricsCalculator.calculateCategoryAverage('comunicacao');
    const lideranca = MetricsCalculator.calculateCategoryAverage('lideranca');
    const ambiente = MetricsCalculator.calculateCategoryAverage('ambiente');
    const desenvolvimento = MetricsCalculator.calculateCategoryAverage('desenvolvimento');
    const mediaGeral = MetricsCalculator.calculateOverallAverage();
    
    document.getElementById('comunicacao-value').textContent = comunicacao.toFixed(1);
    document.getElementById('lideranca-value').textContent = lideranca.toFixed(1);
    document.getElementById('ambiente-value').textContent = ambiente.toFixed(1);
    document.getElementById('desenvolvimento-value').textContent = desenvolvimento.toFixed(1);
    document.getElementById('media-geral').textContent = mediaGeral.toFixed(1);
    
    // Renderizar últimas respostas
    renderRecentResponses();
    
    // Renderizar gráfico de evolução
    renderEvolutionChart();
}

function renderRecentResponses() {
    const container = document.getElementById('recent-responses');
    const recentResponses = appState.allStoredResponses.slice(-5).reverse();
    
    if (recentResponses.length === 0) {
        container.innerHTML = '<p class="text-center" style="color:#19234f;">Nenhuma resposta ainda</p>';
        return;
    }
    
    container.innerHTML = recentResponses.map(response => {
        const date = new Date(response.timestamp).toLocaleDateString('pt-BR');
        const time = new Date(response.timestamp).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const average = MetricsCalculator.calculateResponseAverage(response);
        
        return `
            <div class="p-3 rounded-lg border" style="background-color: #f8fafc; border-color: #66c1b0;">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-medium" style="color:#19234f;">${date} às ${time}</span>
                    <span class="text-sm font-bold" style="color:#66c1b0;">Média: ${average.toFixed(1)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderEvolutionChart() {
    const canvas = document.getElementById('evolution-chart');
    const ctx = canvas.getContext('2d');
    const data = MetricsCalculator.getEvolutionData();
    
    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (data.length === 0) {
        ctx.fillStyle = '#19234f';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Dados insuficientes para gerar gráfico', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Configurações do gráfico
    const padding = 40;
    const chartWidth = canvas.width - 2 * padding;
    const chartHeight = canvas.height - 2 * padding;
    
    // Encontrar valores min/max
    const maxY = Math.max(...data.map(d => d.y), 5);
    const minY = Math.min(...data.map(d => d.y), 1);
    const maxX = data.length;
    
    // Função para converter coordenadas
    const scaleX = (x) => padding + (x - 1) * (chartWidth / (maxX - 1));
    const scaleY = (y) => padding + chartHeight - ((y - minY) / (maxY - minY)) * chartHeight;
    
    // Desenhar eixos
    ctx.strokeStyle = '#19234f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, canvas.height - padding);
    ctx.lineTo(canvas.width - padding, canvas.height - padding);
    ctx.stroke();
    
    // Desenhar linha do gráfico
    if (data.length > 1) {
        ctx.strokeStyle = '#66c1b0';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(scaleX(data[0].x), scaleY(data[0].y));
        
        for (let i = 1; i < data.length; i++) {
            ctx.lineTo(scaleX(data[i].x), scaleY(data[i].y));
        }
        ctx.stroke();
    }
    
    // Desenhar pontos
    ctx.fillStyle = '#66c1b0';
    data.forEach(point => {
        ctx.beginPath();
        ctx.arc(scaleX(point.x), scaleY(point.y), 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Adicionar labels
    ctx.fillStyle = '#19234f';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Evolução das Últimas Avaliações', canvas.width / 2, 20);
}

// Event Listeners
function setupEventListeners() {
    uiElements.submitBtn.addEventListener('click', submitFeedback);
    
    uiElements.newResponseBtn.addEventListener('click', resetForm);
    
    uiElements.accessDashboardBtn.addEventListener('click', () => {
        uiElements.feedbackSection.classList.add('hidden');
        uiElements.dashboardSection.classList.remove('hidden');
        uiElements.loginForm.classList.remove('hidden');
        uiElements.resultsDashboard.classList.add('hidden');
    });
    
    uiElements.loginBtn.addEventListener('click', () => {
        const username = uiElements.dashboardUsername.value;
        const password = uiElements.dashboardPassword.value;
        
        if (username === 'admin' && password === '123') {
            appState.isLoggedIn = true;
            uiElements.loginForm.classList.add('hidden');
            uiElements.resultsDashboard.classList.remove('hidden');
            uiElements.loginError.classList.add('hidden');
            renderDashboard();
        } else {
            uiElements.loginError.classList.remove('hidden');
        }
    });
    
    uiElements.logoutBtn.addEventListener('click', () => {
        appState.isLoggedIn = false;
        uiElements.dashboardSection.classList.add('hidden');
        uiElements.feedbackSection.classList.remove('hidden');
        resetForm();
    });
    
    uiElements.exportBtn.addEventListener('click', () => {
        dataManager.exportData();
    });
}

// Inicialização
function init() {
    renderQuestions();
    setupEventListeners();
    updateProgress();
    
    // Mostrar seção de feedback por padrão
    uiElements.feedbackSection.classList.remove('hidden');
    uiElements.dashboardSection.classList.add('hidden');
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', init);

