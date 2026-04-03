document.addEventListener('DOMContentLoaded', () => {
    const api = window.ChromeBeastApi;
    const body = document.body;
    const splash = document.getElementById('splash-container');
    const loginModal = document.getElementById('login-modal');
    const authBtn = document.getElementById('auth-btn');
    const skipBtn = document.getElementById('skip-btn');
    const video = document.getElementById('intro-video');
    const mainContent = document.getElementById('main-content');
    const nav = document.querySelector('.hybrid-nav');
    const terminal = document.getElementById('terminal-logs');
    
    const bgMusic = document.getElementById('bg-music');
    const clickSound = document.getElementById('click-sound');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const playCard = document.querySelector('[data-play-card]');
    const galleryItems = document.querySelectorAll('[data-gallery-item]');

    if (!api) {
        console.error('ChromeBeastApi is not available.');
    }

    // 1. CURSOR CUSTOMIZADO
    const cursor = document.getElementById('custom-cursor');
    const cursorBlur = document.getElementById('cursor-blur');

    document.addEventListener('mousemove', (e) => {
        if (cursor && cursorBlur) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursorBlur.style.left = (e.clientX - 16) + 'px';
            cursorBlur.style.top = (e.clientY - 16) + 'px';
        }
    });

    // 2. AUTHENTICATION LOGIC
    authBtn.onclick = () => {
        const user = document.getElementById('login-user').value;
        const pass = document.getElementById('login-pass').value;
        const errorMsg = document.getElementById('login-error');

        if(clickSound) {
            clickSound.currentTime = 0;
            clickSound.play().catch(() => {});
        }

        // Simulação de Login (Aceita qualquer coisa preenchida)
        if (user && pass) {
            loginModal.classList.add('fade-out');
            setTimeout(() => {
                loginModal.style.display = 'none';
                splash.classList.remove('hidden');
                startIntro();
            }, 800);
        } else {
            errorMsg.classList.remove('hidden');
            setTimeout(() => errorMsg.classList.add('hidden'), 3000);
        }
    };

    function startIntro() {
        skipBtn.classList.remove('hidden'); 
        const videoPromise = video ? video.play() : null;
        if (videoPromise !== undefined) {
            videoPromise.catch(error => {
                console.log("Video autoplay blocked, jumping to boot.");
                startBootSequence();
            });
        }
    }

    let biosInterval;

    // 3. SEQUÊNCIA DE BOOT (BIOS)
    function startBootSequence() {
        if (video) {
            video.pause();
            video.style.display = 'none';
        }
        // O botão skip continua visível aqui
        terminal.style.display = 'flex'; 

        const logMessages = [
            " [!] SYSTEM_BOT: ACTIVE",
            ">> DECRYPTING_GOTHIC_CORE... [100%]",
            ">> LOADING_NEON_ASSETS... [DONE]",
            ">> SYNCING_USER_INTERFACE... [OK]",
            ">> BYPASSING_SECURITY_PROTOCOLS...",
            ">> ESTABLISHING_NEURAL_LINK... [STABLE]",
            ">> LOADING_GAMES_DATABASE... [OK]",
            ">> OPTIMIZING_VISUAL_RENDERER...",
            ">> SYSTEM_READY_FOR_OPERATOR.",
            ">> WELCOME_TO_CHROMEBEAST."
        ];

        let logIndex = 0;
        biosInterval = setInterval(() => {
            if (logIndex < logMessages.length) {
                const line = document.createElement('div');
                line.className = 'log-line';
                if (logIndex === 0) line.classList.add('highlight');
                line.innerText = logMessages[logIndex];
                terminal.appendChild(line);
                logIndex++;
            } else {
                clearInterval(biosInterval);
                setTimeout(() => {
                    terminal.style.opacity = '0';
                    setTimeout(triggerFinalReveal, 500);
                }, 1000);
            }
        }, 200);
    }

    const skipIntro = () => {
        if (video) video.pause();
        if (biosInterval) clearInterval(biosInterval); // Para a BIOS se estiver rodando
        triggerFinalReveal();
    };

    skipBtn.onclick = skipIntro;
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !splash.classList.contains('hidden')) {
            skipIntro();
        }
    });

    if (video) {
        video.onended = () => startBootSequence();
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(() => {});
            }
        });
    });

    if (playCard) {
        playCard.addEventListener('click', (event) => {
            event.preventDefault();
            const formMsg = document.getElementById('form-msg');
            if (formMsg) {
                formMsg.style.color = 'var(--cyber-neon)';
                formMsg.innerText = 'INFO: GAME_MODULE_NOT_INSTALLED.';
            }
        });
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const formMsg = document.getElementById('form-msg');
            if (formMsg) {
                formMsg.style.color = 'var(--cyber-neon)';
                formMsg.innerText = `INFO: GALLERY_ASSET_${index + 1}_PENDING_UPLOAD.`;
            }
        });
    });

    function triggerFinalReveal() {
        // Limpeza absoluta de elementos da intro
        if (video) video.style.display = 'none';
        if (terminal) terminal.style.display = 'none';
        if (skipBtn) skipBtn.style.display = 'none';
        
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
                document.getElementById('scroll-arrows').classList.remove('hidden');
                
                initSpaceship();
            }, 800);
        }, 200);
    }

    // 6. SPACESHIP DRONE LOGIC (GSAP)
    function initSpaceship() {
        const shipContainer = document.getElementById('spaceship-container');
        const ship = document.getElementById('spaceship-drone');
        if (!ship || !shipContainer) return;

        shipContainer.classList.remove('hidden');
        
        // Posição inicial fora da tela
        gsap.set(ship, { x: -100, y: window.innerHeight / 2, rotation: 90 });

        function moveShip() {
            const newX = Math.random() * (window.innerWidth - 100);
            const newY = Math.random() * (window.innerHeight - 100);
            
            // Calcula o ângulo para a nave "olhar" para o destino
            const currentX = gsap.getProperty(ship, "x");
            const currentY = gsap.getProperty(ship, "y");
            const angle = Math.atan2(newY - currentY, newX - currentX) * (180 / Math.PI);

            // Timeline para rotação e movimento
            const tl = gsap.timeline({ onComplete: moveShip });
            
            tl.to(ship, {
                rotation: angle + 90, // +90 porque a imagem costuma estar virada para cima
                duration: 1,
                ease: "power2.inOut"
            })
            .to(ship, {
                x: newX,
                y: newY,
                duration: Math.random() * 3 + 4, // Entre 4 e 7 segundos para suavidade
                ease: "sine.inOut"
            }, "-=0.5"); // Começa a mover um pouco antes de terminar de rotacionar
        }

        // Efeito de flutuação constante (Hovering)
        gsap.to(ship, {
            y: "+=20",
            repeat: -1,
            yoyo: true,
            duration: 2,
            ease: "sine.inOut"
        });

        moveShip();
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
                await api.sendContact(data);
                formMsg.style.color = "#00ff88";
                formMsg.innerText = "SUCCESS: SIGNAL_STORED.";
                contactForm.reset();
            } catch (err) {
                formMsg.style.color = "var(--cyber-pink)";
                formMsg.innerText = `ERROR: ${err.message || 'SIGNAL_TRANSMISSION_FAILED'}.`;
            }
        };
    }

    // 5. PROFESSIONAL UX ENHANCEMENTS (Scroll & Reveal)
    const scrollProgress = document.getElementById('scroll-progress');
    const scrollDown = document.getElementById('scroll-down');
    const scrollUp = document.getElementById('scroll-up');
    const sections = document.querySelectorAll('section');

    // Reveal on Scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.classList.add('reveal');
        revealObserver.observe(section);
    });

    window.addEventListener('scroll', () => {
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        
        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }

        // Toggle Nav Background
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Arrow Visibility Logic
        if (progress > 80) {
            scrollDown.classList.add('hidden');
            scrollUp.classList.remove('hidden');
        } else if (progress < 10) {
            scrollDown.classList.remove('hidden');
            scrollUp.classList.add('hidden');
        } else {
            scrollDown.classList.remove('hidden');
            scrollUp.classList.remove('hidden');
        }
    });

    // Arrow Click Events
    scrollDown.onclick = () => {
        const nextSection = Array.from(sections).find(s => s.getBoundingClientRect().top > 10);
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    scrollUp.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cursor Interactions
    const interactiveElements = document.querySelectorAll('a, button, .glass-card, .scroll-arrow');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2)';
            cursorBlur.style.transform = 'scale(1.5)';
            cursorBlur.style.borderColor = 'var(--cyber-pink)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursorBlur.style.transform = 'scale(1)';
            cursorBlur.style.borderColor = 'var(--cyber-neon)';
        });
    });
});
