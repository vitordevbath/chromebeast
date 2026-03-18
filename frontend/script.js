document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const splash = document.getElementById('splash-container');
    const startBtn = document.getElementById('start-btn');
    const skipBtn = document.getElementById('skip-btn');
    const video = document.getElementById('intro-video');
    const mainContent = document.getElementById('main-content');
    const nav = document.querySelector('.hybrid-nav');

    // 1. DISPARO DA INTRO (PLAYER DE VÍDEO)
    startBtn.onclick = () => {
        startBtn.style.display = 'none'; 
        skipBtn.classList.remove('hidden'); // Mostra botão de skip
        
        const playPromise = video.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {}).catch(error => triggerTransition());
        }
    };

    // Lógica para Pular Intro (Botão ou Tecla ESC)
    const skipIntro = () => {
        video.pause();
        triggerTransition();
    };

    skipBtn.onclick = skipIntro;
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !splash.classList.contains('hidden')) {
            skipIntro();
        }
    });

    video.onended = () => triggerTransition();

    function triggerTransition() {
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

    // CONFIGURAÇÃO DINÂMICA DE API
    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const API_URL = isLocal ? "http://localhost:3000/api/contact" : "/.netlify/functions/contact";

    // 2. CONTACT FORM Logic
    const contactForm = document.getElementById('contact-form');
    const formMsg = document.getElementById('form-msg');

    if (contactForm) {
        contactForm.onsubmit = async (e) => {
            e.preventDefault();
            
            // Efeito visual de carregamento
            formMsg.innerText = ">> TRANSMITTING_ENCRYPTED_SIGNAL_";
            formMsg.style.color = "var(--cyber-neon)";
            
            const data = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-message').value,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    formMsg.style.color = "#00ff88";
                    formMsg.innerText = "SUCCESS: SIGNAL_STORED_IN_CORE.";
                    contactForm.reset();
                } else {
                    const errData = await response.json();
                    throw new Error(errData.error || "SERVER_REJECTION");
                }
            } catch (err) {
                formMsg.style.color = "var(--cyber-pink)";
                formMsg.innerText = "CRITICAL_ERROR: CONNECTION_LOST. [" + err.message + "]";
            }
        };
    }

    // 3. Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});