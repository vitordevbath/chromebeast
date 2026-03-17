document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const splash = document.getElementById('splash-container');
    const startBtn = document.getElementById('start-btn');
    const video = document.getElementById('intro-video');
    const mainContent = document.getElementById('main-content');
    const nav = document.querySelector('.hybrid-nav');

    // 1. DISPARO DA INTRO (PLAYER DE VÍDEO)
    startBtn.onclick = () => {
        startBtn.style.display = 'none'; // Esconde botão de autorização
        
        // Tenta reproduzir a intro cinemática
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Intro iniciada com sucesso
            }).catch(error => {
                // Erro de vídeo: pula para a transição de glitch imediatamente
                triggerTransition(); 
            });
        }
    };

    video.onended = () => {
        triggerTransition();
    };

    function triggerTransition() {
        // Ativa o Mini-Glitch (Flash de 200ms)
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
    // CONFIGURAÇÃO DE ENDEREÇO DA API (REDE GLOBAL)
    const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
        ? "http://localhost:3000" 
        : "https://SUA_URL_DO_NGROK.ngrok-free.app"; // <--- COLOQUE SEU LINK DO NGROK AQUI

    // 2. CONTACT FORM Logic
    const contactForm = document.getElementById('contact-form');
    const formMsg = document.getElementById('form-msg');

    if (contactForm) {
        contactForm.onsubmit = async (e) => {
            e.preventDefault();
            formMsg.innerText = "TRANSMITTING_SIGNAL...";
            formMsg.style.color = "var(--cyber-neon)";
            
            const data = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-message').value,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch(`${API_BASE_URL}/api/contact`, {
                    method: 'POST',
                    mode: 'cors', // Força o modo CORS para evitar erros de segurança
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    formMsg.style.color = "#00ff88";
                    formMsg.innerText = "SIGNAL_RECEIVED. STAND BY.";
                    contactForm.reset();
                } else {
                    throw new Error("SERVER_REJECTION");
                }
            } catch (err) {
                formMsg.style.color = "var(--cyber-pink)";
                formMsg.innerText = "CONNECTION_FAILURE. RETRY_LATER.";
            }
        };
    }

    // 3. Smooth scroll for navigation (optional as CSS handles it, but good for older browsers)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});