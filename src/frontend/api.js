(() => {
    const ADMIN_TOKEN_STORAGE_KEY = 'starcore_sentinel_admin_token';

    function buildLocalUrl(recurso, id) {
        const idNormalizado = id !== undefined ? `/${encodeURIComponent(id)}` : '';

        if (window.location.protocol === 'file:') {
            return `http://localhost:3000/api/${recurso}${idNormalizado}`;
        }

        return `/api/${recurso}${idNormalizado}`;
    }

    function getAdminToken() {
        return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || '';
    }

    function buildHeaders(extraHeaders = {}, includeAdminToken = false) {
        const headers = { ...extraHeaders };

        if (includeAdminToken) {
            const adminToken = getAdminToken();
            if (adminToken) {
                headers.Authorization = adminToken;
            }
        }

        return headers;
    }

    async function requisicao(recurso, opcoes = {}, id) {
        const url = buildLocalUrl(recurso, id);
        const resposta = await fetch(url, opcoes);
        const texto = await resposta.text();
        const dados = texto ? JSON.parse(texto) : null;

        if (!resposta.ok) {
            const erro = new Error(dados?.erro || dados?.error || `FALHA_${resposta.status}`);
            erro.status = resposta.status;
            erro.dados = dados;
            throw erro;
        }

        return dados;
    }

    window.ApiStarcoreSentinel = {
        definirTokenAdmin(token) {
            const tokenNormalizado = (token || '').trim();

            if (tokenNormalizado) {
                window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, tokenNormalizado);
            } else {
                window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
            }
        },
        obterTokenAdmin() {
            return getAdminToken();
        },
        async registrar(usuario, email, senha) {
            return requisicao('auth/registrar', {
                method: 'POST',
                headers: buildHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ usuario, email, senha })
            });
        },
        async verificar(email, codigo) {
            return requisicao('auth/verificar', {
                method: 'POST',
                headers: buildHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ email, codigo })
            });
        },
        async reenviarVerificacao(email) {
            return requisicao('auth/reenviar-verificacao', {
                method: 'POST',
                headers: buildHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ email })
            });
        },
        async login(usuario, senha) {
            return requisicao('auth/login', {
                method: 'POST',
                headers: buildHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ usuario, senha })
            });
        },
        async esqueciSenha(email) {
            return requisicao('auth/esqueci-senha', {
                method: 'POST',
                headers: buildHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ email })
            });
        },
        async redefinirSenha(email, codigo, novaSenha) {
            return requisicao('auth/redefinir-senha', {
                method: 'POST',
                headers: buildHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ email, codigo, novaSenha })
            });
        },
        async enviarContato(corpo) {
            return requisicao('contato', {
                method: 'POST',
                headers: buildHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify(corpo)
            });
        },
        async listarMensagens() {
            return requisicao('mensagens', {
                method: 'GET',
                headers: buildHeaders({}, true)
            });
        },
        async excluirMensagem(id) {
            return requisicao('mensagens', {
                method: 'DELETE',
                headers: buildHeaders({}, true)
            }, id);
        }
    };
})();
