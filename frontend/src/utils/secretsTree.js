/**
 * Builds a nested tree from a flat list of secret groups.
 *
 * Each group has a `path` like "Nonprod/km-backend/external-services".
 * The tree maps each path segment to its children (subfolders or leaf groups).
 *
 * Example output for path "Nonprod/km-backend":
 * {
 *   Nonprod: {
 *     __children: {
 *       'km-backend': {
 *         __children: {},
 *         __groups: [{ id, path, secrets, ... }]
 *       }
 *     },
 *     __groups: []
 *   }
 * }
 */
export function buildTree(groups = []) {
    const root = {};

    for (const group of groups) {
        const segments = group.path.split('/').filter(Boolean);
        let node = root;

        for (let i = 0; i < segments.length; i++) {
            const seg = segments[i];
            if (!node[seg]) {
                node[seg] = { __children: {}, __groups: [] };
            }
            if (i === segments.length - 1) {
                // Leaf — attach the group here
                node[seg].__groups.push(group);
            } else {
                node = node[seg].__children;
            }
        }
    }

    return root;
}

/**
 * Given the full tree and a path array (e.g. ['Nonprod', 'km-backend']),
 * returns the node at that path, or null if not found.
 */
export function getNodeAtPath(tree, pathSegments = []) {
    let node = tree;
    for (const seg of pathSegments) {
        if (!node[seg]) return null;
        // Move into children for next segment
        node = { ...node[seg].__children, __groups: node[seg].__groups };
    }
    return node;
}

/**
 * Returns top-level folder names from a tree node.
 */
export function getFolders(node) {
    return Object.keys(node).filter(k => k !== '__groups' && k !== '__children');
}

/**
 * Returns secrets groups attached directly to a node.
 */
export function getGroups(node) {
    return node.__groups || [];
}

/**
 * Counts total secrets across all groups recursively.
 */
export function countSecrets(groups = []) {
    return groups.reduce((sum, g) => sum + (g.secrets?.length || 0), 0);
}
