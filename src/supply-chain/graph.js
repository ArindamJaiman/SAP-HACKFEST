/**
 * SAP Resilient: Directed Supply Chain Graph & Topological Network
 */

export class SupplyChainGraph {
  constructor() {
    this.nodes = new Map(); // id -> node object
    this.edges = new Map(); // id -> edge object
    this.adjOut = new Map(); // id -> Set of edge objects
    this.adjIn = new Map();  // id -> Set of edge objects
  }

  addNode(node) {
    if (!node || !node.id) return;
    this.nodes.set(node.id, {
      ...node,
      inboundEdges: [],
      outboundEdges: []
    });
    if (!this.adjOut.has(node.id)) this.adjOut.set(node.id, new Set());
    if (!this.adjIn.has(node.id)) this.adjIn.set(node.id, new Set());
  }

  addEdge(edge) {
    if (!edge || !edge.id || !edge.from || !edge.to) return;
    this.edges.set(edge.id, edge);
    if (!this.adjOut.has(edge.from)) this.adjOut.set(edge.from, new Set());
    if (!this.adjIn.has(edge.to)) this.adjIn.set(edge.to, new Set());
    this.adjOut.get(edge.from).add(edge);
    this.adjIn.get(edge.to).add(edge);

    const fromNode = this.nodes.get(edge.from);
    if (fromNode) fromNode.outboundEdges.push(edge.id);
    const toNode = this.nodes.get(edge.to);
    if (toNode) toNode.inboundEdges.push(edge.id);
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getEdge(id) {
    return this.edges.get(id);
  }

  getOutboundEdges(nodeId) {
    return Array.from(this.adjOut.get(nodeId) || []);
  }

  getInboundEdges(nodeId) {
    return Array.from(this.adjIn.get(nodeId) || []);
  }

  getNeighbors(nodeId) {
    const outEdges = this.getOutboundEdges(nodeId).map(e => e.to);
    const inEdges = this.getInboundEdges(nodeId).map(e => e.from);
    return Array.from(new Set([...outEdges, ...inEdges]));
  }

  /**
   * Breadth-First Search to calculate multi-hop causal downstream propagation
   * @param {string} startNodeId - Epicenter of disruption
   * @param {number} maxHops - Propagation depth limit
   */
  getDownstreamCascade(startNodeId, maxHops = 4) {
    const visitedNodes = new Set();
    const visitedEdges = new Set();
    const cascadeLevels = []; // level 0, 1, 2, ...
    const queue = [{ nodeId: startNodeId, depth: 0, cause: 'DIRECT_DISRUPTION' }];
    visitedNodes.add(startNodeId);

    while (queue.length > 0) {
      const { nodeId, depth, cause } = queue.shift();
      if (!cascadeLevels[depth]) cascadeLevels[depth] = [];
      cascadeLevels[depth].push({ nodeId, cause });

      if (depth >= maxHops) continue;

      const outEdges = this.getOutboundEdges(nodeId);
      for (const edge of outEdges) {
        visitedEdges.add(edge.id);
        const nextNodeId = edge.to;
        if (!visitedNodes.has(nextNodeId)) {
          visitedNodes.add(nextNodeId);
          queue.push({
            nodeId: nextNodeId,
            depth: depth + 1,
            cause: `DOWNSTREAM_OF_${nodeId}`
          });
        }
      }
    }

    return {
      startNodeId,
      totalAffectedNodes: visitedNodes.size,
      affectedNodeIds: Array.from(visitedNodes),
      affectedEdgeIds: Array.from(visitedEdges),
      cascadeLevels
    };
  }

  /**
   * What-If Resilience Analysis: Simulate complete removal of a critical node
   */
  simulateNodeKnockout(targetNodeId) {
    const targetNode = this.nodes.get(targetNodeId);
    if (!targetNode) return null;

    const inEdges = this.getInboundEdges(targetNodeId);
    const outEdges = this.getOutboundEdges(targetNodeId);
    const cascade = this.getDownstreamCascade(targetNodeId, 5);

    // Compute alternative nodes of the same type across the network
    const alternatives = [];
    for (const [candidateId, candidateNode] of this.nodes.entries()) {
      if (candidateId !== targetNodeId && candidateNode.type === targetNode.type) {
        alternatives.push({
          candidateId,
          candidateName: candidateNode.name,
          spareCapacity: Math.round((candidateNode.capacity || 10000) * (1 - (candidateNode.utilization || 70)/100)),
          distanceDeltaKm: Math.round(calculateDistanceKm(targetNode.lat, targetNode.lon, candidateNode.lat, candidateNode.lon))
        });
      }
    }

    // Sort best alternatives by proximity and spare capacity
    alternatives.sort((a, b) => a.distanceDeltaKm - b.distanceDeltaKm);

    return {
      targetNodeId,
      targetName: targetNode.name,
      nodeType: targetNode.type,
      severedInboundFlows: inEdges.length,
      severedOutboundFlows: outEdges.length,
      downstreamCascade: cascade,
      topAlternatives: alternatives.slice(0, 3),
      resilienceScore: alternatives.length > 2 ? 'HIGH_REDUNDANCY' : (alternatives.length === 1 ? 'LOW_REDUNDANCY' : 'SINGLE_POINT_OF_FAILURE')
    };
  }
}

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function buildSupplyChainGraph(seedData) {
  const graph = new SupplyChainGraph();

  // Add all entities as nodes
  seedData.suppliers.forEach(s => graph.addNode(s));
  seedData.factories.forEach(f => graph.addNode(f));
  seedData.ports.forEach(p => graph.addNode(p));
  seedData.warehouses.forEach(w => graph.addNode(w));
  seedData.demandCenters.forEach(d => graph.addNode(d));

  // Build directed edges:
  // 1. Supplier -> Factory (Procurement)
  seedData.factories.forEach((factory, fIdx) => {
    // Connect 3-5 suppliers to each factory
    const numSuppliers = 3;
    for (let i = 0; i < numSuppliers; i++) {
      const supIdx = (fIdx * numSuppliers + i) % seedData.suppliers.length;
      const supplier = seedData.suppliers[supIdx];
      graph.addEdge({
        id: `EDGE-SUP-FAC-${supplier.id}-${factory.id}`,
        type: 'PROCUREMENT',
        from: supplier.id,
        to: factory.id,
        transitDays: randInt(4, 14),
        costUSD: randInt(15000, 65000),
        capacity: 10000,
        utilization: randInt(65, 92),
        reliability: supplier.reliabilityScore / 100,
        carbonKg: randInt(800, 3200)
      });
    }
  });

  // 2. Factory -> Port (Transport to Export Hub)
  seedData.factories.forEach(factory => {
    // Find nearest 2 ports
    const sortedPorts = [...seedData.ports].sort((a, b) => {
      const d1 = calculateDistanceKm(factory.lat, factory.lon, a.lat, a.lon);
      const d2 = calculateDistanceKm(factory.lat, factory.lon, b.lat, b.lon);
      return d1 - d2;
    });
    const port = sortedPorts[0];
    graph.addEdge({
      id: `EDGE-FAC-PORT-${factory.id}-${port.id}`,
      type: 'OUTBOUND_FREIGHT',
      from: factory.id,
      to: port.id,
      transitDays: randInt(1, 3),
      costUSD: randInt(5000, 18000),
      capacity: 15000,
      utilization: randInt(60, 85),
      reliability: 0.96,
      carbonKg: randInt(400, 1200)
    });
  });

  // 3. Port -> Port (Maritime Lanes from routes)
  seedData.routes.forEach(route => {
    graph.addEdge({
      id: `EDGE-${route.id}`,
      type: 'MARITIME_TRANSSHIPMENT',
      from: route.originId,
      to: route.destinationId,
      transitDays: route.transitDays,
      costUSD: route.costPerTEU * 200,
      capacity: route.capacityTEU,
      utilization: route.utilization,
      reliability: route.status === 'CONGESTED_WARNING' ? 0.72 : 0.94,
      carbonKg: route.carbonKgPerTEU * 200
    });
  });

  // 4. Port -> Warehouse (Inbound Distribution)
  seedData.warehouses.forEach(wh => {
    const nearestPort = [...seedData.ports].sort((a, b) => {
      const d1 = calculateDistanceKm(wh.lat, wh.lon, a.lat, a.lon);
      const d2 = calculateDistanceKm(wh.lat, wh.lon, b.lat, b.lon);
      return d1 - d2;
    })[0];
    graph.addEdge({
      id: `EDGE-PORT-WH-${nearestPort.id}-${wh.id}`,
      type: 'INLAND_DISTRIBUTION',
      from: nearestPort.id,
      to: wh.id,
      transitDays: randInt(1, 4),
      costUSD: randInt(8000, 24000),
      capacity: 12000,
      utilization: randInt(65, 88),
      reliability: nearestPort.id === 'PORT-SIN' ? 0.65 : 0.95,
      carbonKg: randInt(500, 1600)
    });
  });

  // 5. Warehouse -> Demand Center (Final Mile Delivery)
  seedData.demandCenters.forEach(dm => {
    const nearestWH = [...seedData.warehouses].sort((a, b) => {
      const d1 = calculateDistanceKm(dm.lat, dm.lon, a.lat, a.lon);
      const d2 = calculateDistanceKm(dm.lat, dm.lon, b.lat, b.lon);
      return d1 - d2;
    })[0];
    graph.addEdge({
      id: `EDGE-WH-DEM-${nearestWH.id}-${dm.id}`,
      type: 'LAST_MILE_FULFILLMENT',
      from: nearestWH.id,
      to: dm.id,
      transitDays: randInt(1, 2),
      costUSD: randInt(3000, 12000),
      capacity: 20000,
      utilization: randInt(70, 94),
      reliability: nearestWH.id === 'WH-17' ? 0.78 : 0.98,
      carbonKg: randInt(250, 900)
    });
  });

  return graph;
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}
