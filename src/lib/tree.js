/**
 * Tree helpers — small pure functions for walking the file tree.
 */

/** Walk the tree depth-first and return the node with the given id (or null). */
export function findNode(tree, id) {
  if (tree.id === id) return tree;
  if (!tree.children) return null;
  for (const c of tree.children) {
    const found = findNode(c, id);
    if (found) return found;
  }
  return null;
}

/**
 * Returns the array of folder-name objects leading to the node with `id`,
 * not including the root and not including the node itself.
 *
 * For a file at the top level the result is `[]`.
 * If the id is not found, returns `null`.
 */
export function getPath(tree, id) {
  const dfs = (node, trail) => {
    if (node.id === id) return trail;
    if (!node.children) return null;
    for (const c of node.children) {
      const nextTrail = c.type === 'folder' ? [...trail, c.name] : trail;
      const found = dfs(c, c.id === id ? trail : nextTrail);
      if (found !== null) return c.id === id ? trail : found;
    }
    return null;
  };
  return dfs(tree, []);
}

/**
 * Tally folders and files in the tree. The root and any node with
 * `dynamic: 'readme'` are excluded so the README's own listing matches
 * what a user would see in the sidebar.
 */
export function countTree(tree) {
  let folders = 0;
  let files = 0;
  const walk = (n, depth) => {
    if (depth > 0) {
      if (n.type === 'folder') folders++;
      else if (!n.dynamic) files++;
    }
    if (n.children) n.children.forEach((c) => walk(c, depth + 1));
  };
  walk(tree, 0);
  return { folders, files };
}
