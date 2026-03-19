document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const splash = document.getElementById('splash-container');
    const startBtn = document.getElementById('start-btn');
    const skipBtn = document.getElementById('skip-btn');
    const video = document.getElementById('intro-video');
    const mainContent = document.getElementById('main-content');
    const nav = document.querySelector('.hybrid-nav');
    const terminal = document.getElementById('terminal-logs');
    
    const bgMusic = document.getElementById('bg-music');
    const clickSound = document.getElementById('click-sound');

    // 1. CURSOR CUSTOMIZADO
    const cursor = document.getElementById('custom-cursor');
    const cursorBlur = document.getElementById('cursor-blur');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursorBlur.style.left = (e.clientX - 16) + 'px';
        cursorBlur.style.top = (e.clientY - 16) + 'px';
    });

    // 2. DISPARO DA INTRO + SOM DE CLIQUE
    startBtn.onclick = () => {
        // Play Click Sound IMEDIATAMENTE
        if(clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => console.log("Click sound error:", e));
        }

        // Esconde botão e mostra o skip
        startBtn.style.display = 'none'; 
        skipBtn.classList.remove('hidden'); 

        // Inicia o vídeo
        const videoPromise = video.play();
        if (videoPromise !== undefined) {
            videoPromise.catch(error => {
                console.log("Video autoplay blocked or failed, jumping to boot.");
                startBootSequence();
            });
        }
    };

    // 3. SEQUÊNCIA DE BOOT (BIOS)
    function startBootSequence() {
        video.pause();
        video.style.display = 'none'; 
        skipBtn.style.display = 'none';
        terminal.style.display = 'flex'; 

        const logMessages = [
            " [!] CORE_SYSTEM: DEVELOPED_BY_BAT_SYS",
            ">> INITIALIZING_CHROMEBEAST_BIOS_V1.0.4",
            ">> WHITE_NEON_PALETTE... [LOADED]",
            ">> BEAR_MODULE_SYNC... [OK]",
            ">> MEMORY_DUMP_0x00FF... [OK]",
            ">> LOADING_GOTHIC_VISUAL_MODULES...",
            ">> SYNCHRONIZING_NEON_GRID... [OK]",
            ">> CONNECTING_LOCAL_DATABASE... [OK]",
            ">> BOOT_SEQUENCE_COMPLETE.",
            ">> WELCOME_OPERATOR."
        ];

        let logIndex = 0;
        const logInterval = setInterval(() => {
            if (logIndex < logMessages.length) {
                const line = document.createElement('div');
                line.className = 'log-line';
                // Adiciona classe de destaque para a primeira linha
                if (logIndex === 0) line.classList.add('highlight');
                
                line.innerText = logMessages[logIndex];
                terminal.appendChild(line);
                logIndex++;
            } else {
                clearInterval(logInterval);
                setTimeout(() => {
                    terminal.style.opacity = '0';
                    setTimeout(triggerFinalReveal, 500);
                }, 1000);
            }
        }, 200); // Velocidade rápida para parecer BIOS
    }

    const skipIntro = () => {
        startBootSequence();
    };

    skipBtn.onclick = skipIntro;
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !splash.classList.contains('hidden')) {
            skipIntro();
        }
    });

    video.onended = () => startBootSequence();

    function triggerFinalReveal() {
        if(bgMusic) {
            bgMusic.volume = 0.3;
            bgMusic.play().catch(e => console.log("Background music blocked."));
        }

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

    // 4. CONTACT FORM
    const contactForm = document.getElementById('contact-form');
    const formMsg = document.getElementById('form-msg');

    if (contactForm) {
        contactForm.onsubmit = async (e) => {
            e.preventDefault();
            formMsg.innerText = ">> TRANSMITTING_SIGNAL_";
            
            const data = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                message: document.getElementById('contact-message').value,
                timestamp: new Date().toISOString()
            };

            try {
                const response = await fetch("http://localhost:3000/api/contact", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    formMsg.style.color = "#00ff88";
                    formMsg.innerText = "SUCCESS: SIGNAL_STORED.";
                    contactForm.reset();
                }
            } catch (err) {
                formMsg.style.color = "var(--cyber-pink)";
                formMsg.innerText = "ERROR: LOCAL_SERVER_OFFLINE.";
            }
        };
    }
});