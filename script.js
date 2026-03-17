document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const splash = document.getElementById('splash-container');
    const startBtn = document.getElementById('start-btn');
    const video = document.getElementById('intro-video');
    const mainContent = document.getElementById('main-content');
    const nav = document.querySelector('.hybrid-nav');

    // 1. DISPARO DA INTRO
    startBtn.onclick = () => {
        startBtn.style.display = 'none'; // Esconde o botão imediatamente
        
        // Tenta tocar o vídeo agressivamente
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Vídeo começou a tocar com sucesso
                console.log("Intro iniciada.");
            }).catch(error => {
                // Erro ao tocar vídeo (ex: falta de interação ou arquivo faltando)
                console.error("Erro ao iniciar vídeo:", error);
                triggerTransition(); // Pula direto para o site se o vídeo falhar
            });
        }
    };

    video.onended = () => {
        triggerTransition();
    };

    function triggerTransition() {
        // Ativa o Glitch por apenas 200ms (um flash rápido)
        body.classList.add('glitch-active');

        setTimeout(() => {
            body.classList.remove('glitch-active');
            splash.classList.add('fade-out');

            setTimeout(() => {
                splash.classList.add('hidden');
                mainContent.classList.remove('hidden');
                nav.classList.remove('hidden');
            }, 800);
        }, 200);
    }
    // 2. SISTEMA DE PLAYER DE JOGO
    window.loadGame = (url) => {
        const catalog = document.getElementById('catalog');
        const protocol = document.getElementById('protocol');
        const frame = document.getElementById('game-frame');
        
        // Esconde catálogo e mostra player
        catalog.classList.add('hidden');
        protocol.classList.remove('hidden');
        
        // Carrega o jogo no iframe
        frame.src = url;
        
        // Scroll para o topo da área do jogo
        window.scrollTo(0, protocol.offsetTop);
    };

    window.closeGame = () => {
        const catalog = document.getElementById('catalog');
        const protocol = document.getElementById('protocol');
        const frame = document.getElementById('game-frame');
        
        protocol.classList.add('hidden');
        catalog.classList.remove('hidden');
        frame.src = ""; // Limpa o iframe para parar o jogo
    };

    // 3. BUG REPORT Logic
    const bugForm = document.getElementById('bug-form');
    const formMsg = document.getElementById('form-msg');

    bugForm.onsubmit = async (e) => {
        e.preventDefault();
        formMsg.innerText = "TRANSMITTING PROTOCOL...";
        
        const data = {
            title: document.getElementById('bug-title').value,
            description: document.getElementById('bug-desc').value,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch('http://localhost:3000/api/bugs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                formMsg.style.color = "#00f2ff";
                formMsg.innerText = "ANOMALY REGISTERED.";
                bugForm.reset();
            }
        } catch (err) {
            formMsg.style.color = "#ff0055";
            formMsg.innerText = "CONNECTION FAILURE.";
        }
    };
});