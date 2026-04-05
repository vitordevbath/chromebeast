(() => {
    const BASE_API_LOCAL = 'http://localhost:3000/api';
    const BASE_FUNCOES_NETLIFY = '/.netlify/functions';

    function obterModoAmbiente() {
        const { protocol, hostname, port } = window.location;
        if (protocol === 'file:') return 'arquivo-local';
        const ehLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
        if (ehLocalHost && port !== '3000') return 'dev-local';
        return 'producao';
    }

    function construirUrl(recurso, id) {
        const idNormalizado = id !== undefined ? `/${encodeURIComponent(id)}` : '';
        const modo = obterModoAmbiente();
        if (modo === 'arquivo-local' || modo === 'dev-local') {
            return `${BASE_API_LOCAL}/${recurso}${idNormalizado}`;
        }
        return `${BASE_FUNCOES_NETLIFY}/${recurso}${idNormalizado}`;
    }

    async function requisicao(recurso, opcoes = {}, id) {
        const resposta = await fetch(construirUrl(recurso, id), opcoes);
        const texto = await resposta.text();
        const dados = texto ? JSON.parse(texto) : null;

        if (!resposta.ok) {
            const erro = new Error(dados?.erro || `FALHA_NA_REQUISICAO_${resposta.status}`);
            erro.status = resposta.status;
            erro.dados = dados;
            throw erro;
        }
        return dados;
    }

    window.ApiChromeBeast = {
        async enviarContato(corpo) {
            return requisicao('contato', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpo)
            });
        },

        async listarMensagens() {
            return requisicao('mensagens', { method: 'GET' });
        },

        async excluirMensagem(id) {
            return requisicao('mensagens', { method: 'DELETE' }, id);
        }
    };
})();
