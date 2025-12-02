export const layoutMindMapNodes = (nodes, connections, rootNodeId = null) => {
  if (!nodes || nodes.length === 0) return [];

  const nodeMap = new Map(nodes.map(node => [node.id, { ...node, children: [], parentId: null }]));
  const childrenMap = new Map();

  // Build parent-child relationships
  connections.forEach(conn => {
    const sourceNode = nodeMap.get(conn.source_node_id);
    const targetNode = nodeMap.get(conn.target_node_id);
    if (sourceNode && targetNode) {
      sourceNode.children.push(targetNode);
      targetNode.parentId = sourceNode.id;

      if (!childrenMap.has(sourceNode.id)) {
        childrenMap.set(sourceNode.id, []);
      }
      childrenMap.get(sourceNode.id).push(targetNode.id);
    }
  });

  // Determine root nodes
  let roots = [];
  if (rootNodeId && nodeMap.has(rootNodeId)) {
    roots.push(nodeMap.get(rootNodeId));
  } else {
    roots = Array.from(nodeMap.values()).filter(node => node.parentId === null);
    if (roots.length === 0 && nodes.length > 0) {
      roots.push(nodeMap.get(nodes[0].id));
    }
  }

  const layoutSettings = {
    hGap: 220,
    vGap: 80,
  };

  // Calculate subtree height for each node
  const getSubtreeHeight = (node) => {
    const children = childrenMap.get(node.id) || [];
    if (children.length === 0) return layoutSettings.vGap;
    return children.reduce((sum, childId) => {
      return sum + getSubtreeHeight(nodeMap.get(childId));
    }, 0);
  };

  const layoutNode = (node, x, yStart) => {
    const children = (childrenMap.get(node.id) || []).map(id => nodeMap.get(id));
    
    if (children.length === 0) {
      node.position_x = x;
      node.position_y = yStart;
      return layoutSettings.vGap;
    }

    let currentY = yStart;
    children.forEach(child => {
      const childHeight = layoutNode(child, x + layoutSettings.hGap, currentY);
      currentY += childHeight;
    });

    // Center parent vertically among its children
    const firstChildY = children[0].position_y;
    const lastChildY = children[children.length - 1].position_y;
    node.position_x = x;
    node.position_y = (firstChildY + lastChildY) / 2;

    return currentY - yStart;
  };

  let currentY = 50;
  roots.forEach(root => {
    const height = layoutNode(root, 50, currentY);
    currentY += height + layoutSettings.vGap;
  });

  return Array.from(nodeMap.values()).map(node => ({
    ...node,
    position_x: node.position_x,
    position_y: node.position_y,
  }));
};