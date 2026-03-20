import { useEffect, useState } from 'react';
import { privateFetch } from '../utils/apiClient';

export function useSecrets() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token;

    const fetchSecrets = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await privateFetch('/api/secrets');
            if (!res) return;

            const json = await res.json();
            if (!res.ok || !json.success) {
                throw new Error(json.error?.message || 'Failed to load secrets');
            }
            setGroups(json.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSecrets(); }, []);

    return { groups, loading, error, refetch: fetchSecrets };
}

export async function fetchSecretById(id) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user?.token;

    const res = await privateFetch(`/api/secrets/${id}`);
    if (!res) return;

    const json = await res.json();
    if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to load secret');
    }
    return json.data;
}
