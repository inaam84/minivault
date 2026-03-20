const handleUnauthorised = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
};

export async function apiFetch(url, options = {}, config = {}) {
    const { requireAuth = true } = config;

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token;

    // Check token expiry before even making the request
    if (requireAuth && token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp * 1000 < Date.now()) {
                handleUnauthorised();
                return; // stop here
            }
        } catch (e) {
            handleUnauthorised();
            return;
        }
    }

    // Merge auth header into whatever options were passed
    const mergedOptions = {
        ...options,
        headers: {
            ...options.headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };

    const res = await fetch(url, mergedOptions);

    // Catch 401 from backend (e.g. token expired mid-session)
    if (requireAuth && res.status === 401) {
        handleUnauthorised();
        return;
    }

    return res;
}

export const publicFetch = (url, options = {}) =>
    apiFetch(url, options, { requireAuth: false });

export const privateFetch = (url, options = {}) =>
    apiFetch(url, options, { requireAuth: true });