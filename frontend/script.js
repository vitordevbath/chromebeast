document.addEventListener('DOMContentLoaded', () => {
    const api = window.ApiChromeBeast;
    const corpo = document.body;
    const splash = document.getElementById('container-splash');
    const modalAutenticacao = document.getElementById('modal-autenticacao');
    const botaoAutenticar = document.getElementById('botao-autenticar');
    const botaoPular = document.getElementById('botao-pular');
    const conteudoPrincipal = document.getElementById('conteudo-principal');
    const nav = document.querySelector('.navegacao-hibrida');
    const terminal = document.getElementById('logs-terminal');

    if (!api) console.error('ApiChromeBeast não disponível.');

    // 1. CURSOR CUSTOMIZADO
    const cursor = document.getElementById('cursor-customizado');
    const cursorDesfoque = document.getElementById('cursor-desfoque');

    document.addEventListener('mousemove', (e) => {
        if (cursor && cursorDesfoque) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            cursorDesfoque.style.left = (e.clientX - 16) + 'px';
            cursorDesfoque.style.top = (e.clientY - 16) + 'px';
        }
    });

    const interativos = document.querySelectorAll('button, a, .card-vidro, input, textarea');
    interativos.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(2.5)';
            cursorDesfoque.style.transform = 'scale(1.8)';
            cursorDesfoque.style.borderColor = 'var(--rosa-ciber)';
        });
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursorDesfoque.style.transform = 'scale(1)';
            cursorDesfoque.style.borderColor = 'var(--neon-ciber)';
        });
    });

    // 2. LÓGICA DE AUTENTICAÇÃO E CADASTRO
    const abaEntrar = document.getElementById('aba-entrar');
    const abaCadastrar = document.getElementById('aba-cadastrar');
    const formEntrar = document.getElementById('form-entrar');
    const formCadastrar = document.getElementById('form-cadastrar');
    const botaoRegistrar = document.getElementById('botao-cadastrar');
    const msgCadastro = document.getElementById('msg-cadastro');

    abaEntrar.onclick = () => {
        abaEntrar.classList.add('ativo');
        abaCadastrar.classList.remove('ativo');
        formEntrar.classList.remove('oculto');
        formCadastrar.classList.add('oculto');
    };

    abaCadastrar.onclick = () => {
        abaCadastrar.classList.add('ativo');
        abaEntrar.classList.remove('ativo');
        formCadastrar.classList.remove('oculto');
        formEntrar.classList.add('oculto');
    };

    const verificarAutenticacao = () => {
        const logado = sessionStorage.getItem('chromebeast_autenticado');
        if (logado) {
            modalAutenticacao.style.display = 'none';
            splash.classList.remove('oculto');
            iniciarBoot();
        }
    };

    botaoRegistrar.onclick = () => {
        const usuario = document.getElementById('cad-usuario').value;
        const senha = document.getElementById('cad-senha').value;
        const confirma = document.getElementById('cad-senha-confirma').value;

        if (!usuario || !senha) {
            msgCadastro.innerText = "ERRO: CAMPOS_VAZIOS";
            msgCadastro.classList.remove('oculto');
            return;
        }

        if (senha !== confirma) {
            msgCadastro.innerText = "ERRO: SENHAS_NÃO_CONFEREM";
            msgCadastro.classList.remove('oculto');
            return;
        }

        const usuarios = JSON.parse(localStorage.getItem('chromebeast_usuarios') || "[]");
        if (usuarios.find(u => u.usuario === usuario)) {
            msgCadastro.innerText = "ERRO: USUÁRIO_JÁ_EXISTE";
            msgCadastro.classList.remove('oculto');
            return;
        }

        usuarios.push({ usuario, senha });
        localStorage.setItem('chromebeast_usuarios', JSON.stringify(usuarios));
        msgCadastro.style.color = "#00ff88";
        msgCadastro.innerText = "SUCESSO: IDENTIDADE_CRIADA. ENTRE_AGORA.";
        msgCadastro.classList.remove('oculto');
        setTimeout(() => abaEntrar.click(), 1500);
    };

    botaoAutenticar.onclick = () => {
        const usuario = document.getElementById('login-usuario').value;
        const senha = document.getElementById('login-senha').value;
        const erroLogin = document.getElementById('erro-login');

        const usuarios = JSON.parse(localStorage.getItem('chromebeast_usuarios') || "[]");
        const encontrado = usuarios.find(u => u.usuario === usuario && u.senha === senha);

        if (encontrado || (usuario === "admin" && senha === "admin")) {
            sessionStorage.setItem('chromebeast_autenticado', 'true');
            modalAutenticacao.classList.add('fade-out');
            setTimeout(() => {
                modalAutenticacao.style.display = 'none';
                splash.classList.remove('oculto');
                iniciarBoot();
            }, 800);
        } else {
            erroLogin.classList.remove('oculto');
            setTimeout(() => erroLogin.classList.add('oculto'), 3000);
        }
    };

    verificarAutenticacao();

    // 3. SISTEMA DE NAVEGAÇÃO SPA
    const secoes = document.querySelectorAll('.secao-conteudo');
    const linksNav = document.querySelectorAll('[data-link-nav]');
    const botoesInternos = document.querySelectorAll('.botao-interno');

    function trocarSecao(idAlvo) {
        const secaoAlvo = document.getElementById(idAlvo);
        if (!secaoAlvo) return;
        secoes.forEach(s => s.classList.remove('ativo'));
        secaoAlvo.classList.add('ativo');
    }

    linksNav.forEach(link => {
        link.onclick = (e) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                trocarSecao(href.substring(1));
            }
        };
    });

    botoesInternos.forEach(btn => {
        btn.onclick = () => trocarSecao(btn.getAttribute('data-alvo'));
    });

    let intervaloBios;

    function iniciarBoot() {
        terminal.style.display = 'flex'; 
        terminal.style.opacity = '1';
        splash.style.opacity = '1';
        splash.classList.remove('oculto');
        botaoPular.classList.remove('oculto');

        const mensagensLog = [
            " [!] ROBÔ_DO_SISTEMA: ATIVO",
            ">> DESCRIPTOGRAFANDO_NÚCLEO_GÓTICO... [100%]",
            ">> CARREGANDO_RECURSOS_NEON... [OK]",
            ">> SINCRONIZANDO_INTERFACE_DO_USUÁRIO... [OK]",
            ">> IGNORANDO_PROTOCOLOS_DE_SEGURANÇA...",
            ">> ESTABELECENDO_LINK_NEURAL... [ESTÁVEL]",
            ">> CARREGANDO_BANCO_DE_DADOS_DE_JOGOS... [OK]",
            ">> SISTEMA_PRONTO.",
            ">> BEM-VINDO_AO_CHROMEBEAST."
        ];

        let indexLog = 0;
        intervaloBios = setInterval(() => {
            if (indexLog < mensagensLog.length) {
                const linha = document.createElement('div');
                linha.className = 'log-line';
                if (indexLog === 0) linha.classList.add('highlight');
                linha.innerText = mensagensLog[indexLog];
                terminal.appendChild(linha);
                indexLog++;
            } else {
                clearInterval(intervaloBios);
                setTimeout(() => {
                    terminal.style.opacity = '0';
                    setTimeout(revelacaoFinal, 600);
                }, 1000);
            }
        }, 200);
    }

    const pularIntro = () => {
        if (intervaloBios) clearInterval(intervaloBios);
        terminal.style.opacity = '0';
        revelacaoFinal();
    };

    botaoPular.onclick = pularIntro;
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !splash.classList.contains('oculto')) pularIntro();
    });

    function revelacaoFinal() {
        splash.style.opacity = '0'; // FAZ O FUNDO PRETO SUMIR
        setTimeout(() => {
            splash.classList.add('oculto');
            terminal.style.display = 'none';
            botaoPular.style.display = 'none';
            
            conteudoPrincipal.classList.remove('oculto');
            nav.classList.remove('oculto');
            iniciarNave();
        }, 800);

        corpo.classList.add('glitch-active');
        setTimeout(() => corpo.classList.remove('glitch-active'), 500);
    }

    function iniciarNave() {
        const containerNave = document.getElementById('container-nave');
        const nave = document.getElementById('drone-nave');
        if (!nave || !containerNave) return;

        containerNave.classList.remove('oculto');
        gsap.set(nave, { x: -100, y: window.innerHeight / 2, rotation: 90 });

        function moverNave() {
            const novoX = Math.random() * (window.innerWidth - 100);
            const novoY = Math.random() * (window.innerHeight - 100);
            const atualX = gsap.getProperty(nave, "x");
            const atualY = gsap.getProperty(nave, "y");
            const angulo = Math.atan2(novoY - atualY, novoX - atualX) * (180 / Math.PI);

            const tl = gsap.timeline({ onComplete: moverNave });
            tl.to(nave, { rotation: angulo + 90, duration: 1, ease: "power2.inOut" })
              .to(nave, { x: novoX, y: novoY, duration: Math.random() * 3 + 4, ease: "sine.inOut" }, "-=0.5");
        }

        gsap.to(nave, { y: "+=20", repeat: -1, yoyo: true, duration: 2, ease: "sine.inOut" });
        moverNave();
    }

    // 4. FORMULÁRIO DE CONTATO
    const formularioContato = document.getElementById('formulario-contato');
    const msgFormulario = document.getElementById('msg-formulario');

    if (formularioContato) {
        formularioContato.onsubmit = async (e) => {
            e.preventDefault();
            msgFormulario.innerText = ">> TRANSMITINDO_SINAL_";
            
            const dados = {
                nome: document.getElementById('contato-nome').value,
                email: document.getElementById('contato-email').value,
                mensagem: document.getElementById('contato-mensagem').value,
                data_hora: new Date().toISOString()
            };

            try {
                await api.enviarContato(dados);
                msgFormulario.style.color = "#00ff88";
                msgFormulario.innerText = "SUCESSO: SINAL_ARMAZENADO.";
                formularioContato.reset();
            } catch (erro) {
                msgFormulario.style.color = "var(--rosa-ciber)";
                msgFormulario.innerText = `ERRO: ${erro.message || 'FALHA_NA_TRANSMISSÃO'}.`;
            }
        };
    }
});
