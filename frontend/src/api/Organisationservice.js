import { privateFetch } from '../utils/apiClient';

const BASE = '/api/organisations';

export async function getMyOrg() {
    const res = await privateFetch(BASE + '/me');
    if (!res) return null;
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load organisation');
    return json.data;
}

export async function createOrg(name) {
    const res = await privateFetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    if (!res) return null;
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to create organisation');
    return json.data;
}

export async function getMembers() {
    const res = await privateFetch(BASE + '/members');
    if (!res) return [];
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load members');
    return json.data;
}

export async function inviteMember(email, role) {
    const res = await privateFetch(BASE + '/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
    });
    if (!res) return null;
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to send invite');
    return json.data;
}

export async function removeMember(accountId) {
    const res = await privateFetch(`${BASE}/members/${accountId}`, { method: 'DELETE' });
    if (!res) return;
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to remove member');
}

export async function getTeams() {
    const res = await privateFetch(BASE + '/teams');
    if (!res) return [];
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to load teams');
    return json.data;
}

export async function createTeam(name, description) {
    const res = await privateFetch(BASE + '/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
    });
    if (!res) return null;
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to create team');
    return json.data;
}

export async function addTeamMember(teamId, accountId, role) {
    const res = await privateFetch(`${BASE}/teams/${teamId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId, role }),
    });
    if (!res) return null;
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to add team member');
    return json.data;
}

export async function removeTeamMember(teamId, accountId) {
    const res = await privateFetch(`${BASE}/teams/${teamId}/members/${accountId}`, {
        method: 'DELETE',
    });
    if (!res) return;
    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || 'Failed to remove team member');
}
