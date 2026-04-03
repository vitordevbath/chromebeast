(() => {
    const LOCAL_API_BASE = 'http://localhost:3000/api';
    const NETLIFY_FUNCTIONS_BASE = '/.netlify/functions';

    function getEnvironmentMode() {
        const { protocol, hostname, port } = window.location;

        if (protocol === 'file:') {
            return 'local-file';
        }

        const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
        if (isLocalHost && port !== '3000') {
            return 'local-dev';
        }

        return 'deployed';
    }

    function buildUrl(resource, id) {
        const normalizedId = id !== undefined ? `/${encodeURIComponent(id)}` : '';
        const mode = getEnvironmentMode();

        if (mode === 'local-file' || mode === 'local-dev') {
            return `${LOCAL_API_BASE}/${resource}${normalizedId}`;
        }

        return `${NETLIFY_FUNCTIONS_BASE}/${resource}${normalizedId}`;
    }

    async function request(resource, options = {}, id) {
        const response = await fetch(buildUrl(resource, id), options);
        const text = await response.text();
        const data = text ? JSON.parse(text) : null;

        if (!response.ok) {
            const error = new Error(data?.error || `REQUEST_FAILED_${response.status}`);
            error.status = response.status;
            error.payload = data;
            throw error;
        }

        return data;
    }

    window.ChromeBeastApi = {
        async sendContact(payload) {
            return request('contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        },

        async listMessages() {
            return request('messages', { method: 'GET' });
        },

        async deleteMessage(id) {
            return request('messages', { method: 'DELETE' }, id);
        }
    };
})();
