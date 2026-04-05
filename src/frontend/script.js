document.addEventListener('DOMContentLoaded', () => {
    const api = window.ApiChromebeast;
    const modalAutenticacao = document.getElementById('modal-autenticacao');
    const splash = document.getElementById('container-splash');
    const conteudoPrincipal = document.getElementById('conteudo-principal');
    const nav = document.querySelector('.navegacao-hibrida');

    const abaEntrar = document.getElementById('aba-entrar');
    const abaCadastrar = document.getElementById('aba-cadastrar');
    const formEntrar = document.getElementById('form-entrar');
    const formCadastrar = document.getElementById('form-cadastrar');
    const formVerificar = document.getElementById('form-verificar');
    const formRecuperar = document.getElementById('form-recuperar');

    const msgCadastro = document.getElementById('msg-cadastro');
    const msgVerificacao = document.getElementById('msg-verificacao');
    const msgLogin = document.getElementById('erro-login');
    const msgRecuperacao = document.getElementById('msg-recuperacao');
    const msgFormulario = document.getElementById('msg-formulario');
    const formularioContato = document.getElementById('formulario-contato');

    let emailTemporario = '';

    function limparMensagensAutenticacao() {
        [msgCadastro, msgVerificacao, msgLogin, msgRecuperacao].forEach((elemento) => {
            elemento.classList.add('oculto');
            elemento.innerText = '';
            elemento.style.color = '';
        });
    }

    function mostrarSomente(formularioAtivo) {
        [formEntrar, formCadastrar, formVerificar, formRecuperar].forEach((formulario) => {
            formulario.classList.toggle('oculto', formulario !== formularioAtivo);
        });
    }

    function mostrarAbaEntrar() {
        abaEntrar.classList.add('ativo');
        abaCadastrar.classList.remove('ativo');
        limparMensagensAutenticacao();
        mostrarSomente(formEntrar);
    }

    function mostrarAbaCadastrar() {
        abaCadastrar.classList.add('ativo');
        abaEntrar.classList.remove('ativo');
        limparMensagensAutenticacao();
        mostrarSomente(formCadastrar);
    }

    function mostrarRecuperacao() {
        abaEntrar.classList.remove('ativo');
        abaCadastrar.classList.remove('ativo');
        limparMensagensAutenticacao();
        mostrarSomente(formRecuperar);
    }

    function ativarSecao(target) {
        const secao = document.getElementById(target);
        if (!secao) {
            return;
        }

        document.querySelectorAll('.secao-conteudo').forEach((item) => item.classList.remove('ativo'));
        secao.classList.add('ativo');
    }

    function revelarSistema() {
        splash.classList.add('oculto');
        conteudoPrincipal.classList.remove('oculto');
        nav.classList.remove('oculto');
    }

    function entrarNoSistema(usuario) {
        sessionStorage.setItem('chromebeast_autenticado', 'true');
        sessionStorage.setItem('chromebeast_user', usuario);

        modalAutenticacao.classList.add('fade-out');
        setTimeout(() => {
            modalAutenticacao.style.display = 'none';
            splash.classList.remove('oculto');
            iniciarBoot();
        }, 800);
    }

    function iniciarBoot() {
        const terminal = document.getElementById('logs-terminal');
        terminal.innerHTML = '';
        terminal.style.display = 'flex';
        terminal.style.opacity = '1';
        splash.classList.remove('oculto');

        const mensagensLog = [
            ' [!] ROBO_DO_SISTEMA: ATIVO',
            '>> SINCRONIZANDO_NUCLEO_SQLITE... [OK]',
            '>> ESTABELECENDO_LINK_NEURAL... [ESTAVEL]',
            '>> CARREGANDO_RECURSOS_CHROMEBEAST... [OK]',
            '>> SISTEMA_PRONTO.',
            '>> BEM-VINDO_AO_CHROMEBEAST.'
        ];

        let indexLog = 0;
        const intervaloBios = setInterval(() => {
            if (indexLog < mensagensLog.length) {
                const linha = document.createElement('div');
                linha.className = 'log-line';
                linha.innerText = mensagensLog[indexLog];
                terminal.appendChild(linha);
                indexLog += 1;
                return;
            }

            clearInterval(intervaloBios);
            setTimeout(revelarSistema, 1000);
        }, 200);
    }

    function exibirCodigoDesenvolvimento(destino, resposta) {
        if (resposta?.codigo_desenvolvimento) {
            destino.innerText += ` CODIGO_DEV: ${resposta.codigo_desenvolvimento}`;
        }
    }

    abaEntrar.onclick = mostrarAbaEntrar;
    abaCadastrar.onclick = mostrarAbaCadastrar;
    document.getElementById('botao-esqueci-senha').onclick = mostrarRecuperacao;
    document.getElementById('botao-voltar-login').onclick = mostrarAbaEntrar;

    document.getElementById('botao-cadastrar').onclick = async () => {
        const usuario = document.getElementById('cad-usuario').value.trim();
        const email = document.getElementById('cad-email').value.trim();
        const senha = document.getElementById('cad-senha').value;

        limparMensagensAutenticacao();
        msgCadastro.classList.remove('oculto');
        msgCadastro.innerText = 'PROCESSANDO_IDENTIDADE...';

        try {
            const resposta = await api.registrar(usuario, email, senha);
            emailTemporario = email;
            msgCadastro.style.color = '#00ff88';
            msgCadastro.innerText = 'IDENTIDADE_CRIADA. VALIDACAO_REQUERIDA.';
            exibirCodigoDesenvolvimento(msgCadastro, resposta);
            mostrarSomente(formVerificar);
        } catch (erro) {
            msgCadastro.innerText = `ERRO: ${erro.message}`;
        }
    };

    document.getElementById('botao-verificar').onclick = async () => {
        const codigo = document.getElementById('cod-verificacao').value.trim();

        limparMensagensAutenticacao();
        msgVerificacao.classList.remove('oculto');

        try {
            await api.verificar(emailTemporario, codigo);
            msgVerificacao.style.color = '#00ff88';
            msgVerificacao.innerText = 'SUCESSO: IDENTIDADE_VALIDADA.';
            setTimeout(mostrarAbaEntrar, 1500);
        } catch (erro) {
            msgVerificacao.innerText = `ERRO: ${erro.message}`;
        }
    };

    document.getElementById('botao-autenticar').onclick = async () => {
        const usuario = document.getElementById('login-usuario').value.trim();
        const senha = document.getElementById('login-senha').value;

        limparMensagensAutenticacao();

        try {
            const resposta = await api.login(usuario, senha);
            entrarNoSistema(resposta.usuario);
        } catch (erro) {
            msgLogin.classList.remove('oculto');
            msgLogin.innerText = `ACESSO_NEGADO: ${erro.message}`;
        }
    };

    document.getElementById('botao-solicitar-reset').onclick = async () => {
        const email = document.getElementById('reset-email').value.trim();

        limparMensagensAutenticacao();
        msgRecuperacao.classList.remove('oculto');
        msgRecuperacao.style.color = '#ffffff';
        msgRecuperacao.innerText = 'SOLICITANDO_CODIGO_DE_RECUPERACAO...';

        try {
            const resposta = await api.esqueciSenha(email);
            emailTemporario = email;
            msgRecuperacao.style.color = '#00ff88';
            msgRecuperacao.innerText = resposta.mensagem;
            exibirCodigoDesenvolvimento(msgRecuperacao, resposta);
        } catch (erro) {
            msgRecuperacao.innerText = `ERRO: ${erro.message}`;
        }
    };

    document.getElementById('botao-redefinir-senha').onclick = async () => {
        const email = document.getElementById('reset-email').value.trim();
        const codigo = document.getElementById('reset-codigo').value.trim();
        const novaSenha = document.getElementById('reset-nova-senha').value;

        limparMensagensAutenticacao();
        msgRecuperacao.classList.remove('oculto');

        try {
            await api.redefinirSenha(email, codigo, novaSenha);
            msgRecuperacao.style.color = '#00ff88';
            msgRecuperacao.innerText = 'SENHA_REDEFINIDA. FACA_LOGIN_NOVAMENTE.';
            setTimeout(mostrarAbaEntrar, 1500);
        } catch (erro) {
            msgRecuperacao.innerText = `ERRO: ${erro.message}`;
        }
    };

    if (formularioContato) {
        formularioContato.addEventListener('submit', async (evento) => {
            evento.preventDefault();

            const nome = document.getElementById('contato-nome').value.trim();
            const email = document.getElementById('contato-email').value.trim();
            const mensagem = document.getElementById('contato-mensagem').value.trim();

            msgFormulario.style.color = '#ffffff';
            msgFormulario.innerText = 'TRANSMITINDO_SINAL...';

            try {
                await api.enviarContato({ nome, email, mensagem });
                formularioContato.reset();
                msgFormulario.style.color = '#00ff88';
                msgFormulario.innerText = 'SINAL_RECEBIDO_COM_SUCESSO.';
            } catch (erro) {
                msgFormulario.style.color = '#ff0055';
                msgFormulario.innerText = `ERRO: ${erro.message}`;
            }
        });
    }

    document.querySelectorAll('[data-link-nav]').forEach((link) => {
        link.onclick = (evento) => {
            evento.preventDefault();
            const target = link.getAttribute('href').replace('#', '');
            ativarSecao(target);
        };
    });

    document.querySelectorAll('[data-alvo]').forEach((botao) => {
        botao.addEventListener('click', () => {
            const target = botao.getAttribute('data-alvo');
            ativarSecao(target);
        });
    });

    if (sessionStorage.getItem('chromebeast_autenticado') === 'true') {
        modalAutenticacao.style.display = 'none';
        revelarSistema();
    }
});
