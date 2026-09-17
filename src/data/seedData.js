/**
 * SAP Resilient: Deterministic Global Supply Chain Seed Generator
 * Generates 150+ suppliers, 40+ factories, 30+ ports, 80+ warehouses,
 * 300+ vessels, 1000+ shipments, 50+ demand centers, 100+ routes, and 20 disruptions.
 */

// Mulberry32 PRNG for deterministic reproducible data
function createRng(seed = 1337) {
  let s = seed;
  return function() {
    s |= 0; s = s + 0x6D2B79F5 | 0;
    let t = Math.imul(s ^ s >>> 15, 1 | s);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const rng = createRng(424242);
function randFloat(min, max) { return min + rng() * (max - min); }
function randInt(min, max) { return Math.floor(randFloat(min, max + 1)); }
function randChoice(arr) { return arr[randInt(0, arr.length - 1)]; }

// Key Global Ports Anchor Table
export const MAJOR_PORTS = [
  { id: 'PORT-SIN', name: 'Port of Singapore', country: 'Singapore', lat: 1.264, lon: 103.840, throughput: 37.2, berths: 67 },
  { id: 'PORT-SHA', name: 'Port of Shanghai', country: 'China', lat: 31.230, lon: 121.473, throughput: 47.3, berths: 125 },
  { id: 'PORT-NGB', name: 'Port of Ningbo-Zhoushan', country: 'China', lat: 29.868, lon: 121.544, throughput: 31.0, berths: 88 },
  { id: 'PORT-SZX', name: 'Port of Shenzhen (Yantian)', country: 'China', lat: 22.580, lon: 114.280, throughput: 28.7, berths: 74 },
  { id: 'PORT-BUS', name: 'Port of Busan', country: 'South Korea', lat: 35.102, lon: 129.040, throughput: 22.7, berths: 52 },
  { id: 'PORT-HKG', name: 'Port of Hong Kong', country: 'Hong Kong', lat: 22.350, lon: 114.120, throughput: 17.8, berths: 48 },
  { id: 'PORT-KLG', name: 'Port Klang', country: 'Malaysia', lat: 3.000, lon: 101.400, throughput: 13.7, berths: 40 },
  { id: 'PORT-ROT', name: 'Port of Rotterdam', country: 'Netherlands', lat: 51.950, lon: 4.140, throughput: 15.3, berths: 92 },
  { id: 'PORT-ANT', name: 'Port of Antwerp-Bruges', country: 'Belgium', lat: 51.270, lon: 4.340, throughput: 13.5, berths: 68 },
  { id: 'PORT-HAM', name: 'Port of Hamburg', country: 'Germany', lat: 53.530, lon: 9.970, throughput: 8.7, berths: 44 },
  { id: 'PORT-DXB', name: 'Jebel Ali (Dubai)', country: 'UAE', lat: 25.010, lon: 55.060, throughput: 14.1, berths: 50 },
  { id: 'PORT-LAX', name: 'Port of Los Angeles', country: 'USA', lat: 33.740, lon: -118.260, throughput: 10.6, berths: 82 },
  { id: 'PORT-LGB', name: 'Port of Long Beach', country: 'USA', lat: 33.754, lon: -118.216, throughput: 9.1, berths: 70 },
  { id: 'PORT-NYC', name: 'Port of New York & New Jersey', country: 'USA', lat: 40.670, lon: -74.120, throughput: 8.9, berths: 58 },
  { id: 'PORT-SAV', name: 'Port of Savannah', country: 'USA', lat: 32.120, lon: -81.140, throughput: 5.8, berths: 36 },
  { id: 'PORT-CMB', name: 'Port of Colombo', country: 'Sri Lanka', lat: 6.950, lon: 79.850, throughput: 7.2, berths: 30 },
  { id: 'PORT-NSA', name: 'Jawaharlal Nehru Port (Nhava Sheva)', country: 'India', lat: 18.950, lon: 72.950, throughput: 5.6, berths: 28 },
  { id: 'PORT-MUN', name: 'Mundra Port', country: 'India', lat: 22.750, lon: 69.700, throughput: 6.6, berths: 24 },
  { id: 'PORT-TYO', name: 'Port of Tokyo', country: 'Japan', lat: 35.620, lon: 139.780, throughput: 4.8, berths: 32 },
  { id: 'PORT-YOK', name: 'Port of Yokohama', country: 'Japan', lat: 35.440, lon: 139.650, throughput: 3.0, berths: 26 },
  { id: 'PORT-TPE', name: 'Port of Kaohsiung', country: 'Taiwan', lat: 22.610, lon: 120.280, throughput: 9.5, berths: 42 },
  { id: 'PORT-SUEZ', name: 'Port Said (Suez Canal)', country: 'Egypt', lat: 31.260, lon: 32.310, throughput: 4.0, berths: 20 },
  { id: 'PORT-VLC', name: 'Port of Valencia', country: 'Spain', lat: 39.440, lon: -0.320, throughput: 5.4, berths: 34 },
  { id: 'PORT-FEL', name: 'Port of Felixstowe', country: 'UK', lat: 51.960, lon: 1.310, throughput: 3.8, berths: 22 },
  { id: 'PORT-SYD', name: 'Port Botany (Sydney)', country: 'Australia', lat: -33.970, lon: 151.210, throughput: 2.8, berths: 18 },
  { id: 'PORT-MEL', name: 'Port of Melbourne', country: 'Australia', lat: -37.830, lon: 144.910, throughput: 3.2, berths: 20 },
  { id: 'PORT-SSZ', name: 'Port of Santos', country: 'Brazil', lat: -23.950, lon: -46.300, throughput: 4.4, berths: 26 },
  { id: 'PORT-COL', name: 'Port of Manzanillo', country: 'Panama', lat: 9.360, lon: -79.880, throughput: 4.9, berths: 22 },
  { id: 'PORT-DUR', name: 'Port of Durban', country: 'South Africa', lat: -29.870, lon: 31.020, throughput: 2.7, berths: 16 },
  { id: 'PORT-VAN', name: 'Port of Vancouver', country: 'Canada', lat: 49.290, lon: -123.110, throughput: 3.6, berths: 28 },
];

// Major Industrial Clusters
export const INDUSTRIAL_REGIONS = [
  { name: 'East China Industrial Cluster', lat: 31.5, lon: 120.5, country: 'China' },
  { name: 'Pearl River Delta', lat: 23.0, lon: 113.3, country: 'China' },
  { name: 'Tokyo-Yokohama Keihin', lat: 35.5, lon: 139.7, country: 'Japan' },
  { name: 'Gyeonggi Tech Corridor', lat: 37.2, lon: 127.1, country: 'South Korea' },
  { name: 'Hsinchu Science Park', lat: 24.78, lon: 121.0, country: 'Taiwan' },
  { name: 'Penang Silicon Valley', lat: 5.35, lon: 100.3, country: 'Malaysia' },
  { name: 'Vietnam Industrial North', lat: 21.0, lon: 105.8, country: 'Vietnam' },
  { name: 'Bengaluru-Chennai Corridor', lat: 12.97, lon: 79.2, country: 'India' },
  { name: 'Maharashtra Auto Hub', lat: 18.52, lon: 73.85, country: 'India' },
  { name: 'Rhine-Ruhr Valley', lat: 51.45, lon: 7.01, country: 'Germany' },
  { name: 'Bavaria High-Tech Cluster', lat: 48.14, lon: 11.58, country: 'Germany' },
  { name: 'Northern Italy Manufacturing', lat: 45.46, lon: 9.19, country: 'Italy' },
  { name: 'Midlands UK Industrial', lat: 52.48, lon: -1.89, country: 'UK' },
  { name: 'US Midwest Rust Belt', lat: 41.87, lon: -87.62, country: 'USA' },
  { name: 'Texas Silicon Hills & Petro', lat: 30.26, lon: -97.74, country: 'USA' },
  { name: 'Silicon Valley & Bay Area', lat: 37.38, lon: -122.08, country: 'USA' },
  { name: 'Monterrey Manufacturing', lat: 25.68, lon: -100.31, country: 'Mexico' },
  { name: 'Sao Paulo Industrial', lat: -23.55, lon: -46.63, country: 'Brazil' },
];

export const RAW_MATERIALS = [
  'Semiconductors & Microcontrollers',
  'Lithium-ion Battery Cells',
  'Specialty Alloys & Steel',
  'Precision Sensors & Optics',
  'Copper & Rare Earths',
  'Aerospace Composites',
  'Pharma APIs & Biologics',
  'Polymers & Engineered Resins',
  'Industrial Drive Units & Motors',
  'Hydraulic Actuators & Valves'
];

export const FINISHED_PRODUCTS = [
  'Autonomous Mining Haulers',
  'Heavy Excavation Systems',
  'Electric Utility Trucks',
  'Industrial Robotics Arms',
  'Smart Grid Inverters',
  'Telecom Base Stations',
  'Medical Imaging Systems',
  'Commercial Jet Engines',
  'Automated Conveyors',
  'Turbine Generator Units'
];

export function generateSeedData() {
  const ports = MAJOR_PORTS.map((p, idx) => ({
    id: p.id,
    name: p.name,
    country: p.country,
    lat: p.lat,
    lon: p.lon,
    type: 'PORT',
    status: p.id === 'PORT-SIN' ? 'DISRUPTED' : (idx % 7 === 0 ? 'CONGESTED' : 'OPERATIONAL'),
    throughput: p.throughput,
    capacity: p.berths * 1000,
    berthUtilization: p.id === 'PORT-SIN' ? 94 : randInt(55, 88),
    vesselQueue: p.id === 'PORT-SIN' ? 43 : randInt(4, 22),
    customsDelay: p.id === 'PORT-SIN' ? 4.2 : randFloat(0.3, 1.8),
    weatherState: p.id === 'PORT-SIN' ? 'Severe Squall' : 'Clear',
    riskScore: p.id === 'PORT-SIN' ? 88 : randInt(10, 40),
    connectedEntities: []
  }));

  // 160 Suppliers
  const suppliers = [];
  for (let i = 1; i <= 160; i++) {
    const region = randChoice(INDUSTRIAL_REGIONS);
    const material = randChoice(RAW_MATERIALS);
    const relScore = randInt(72, 99);
    const isRisk = i % 18 === 0;
    suppliers.push({
      id: `SUP-${String(i).padStart(3, '0')}`,
      name: `${region.name.split(' ')[0]} ${material.split(' ')[0]} Corp ${i}`,
      type: 'SUPPLIER',
      country: region.country,
      lat: region.lat + randFloat(-1.8, 1.8),
      lon: region.lon + randFloat(-2.5, 2.5),
      category: material,
      material,
      capacity: randInt(10000, 50000),
      currentOutput: randInt(7500, 48000),
      reliabilityScore: isRisk ? relScore - 25 : relScore,
      riskScore: isRisk ? randInt(70, 92) : randInt(12, 38),
      financialRisk: isRisk ? 'HIGH' : 'LOW',
      geopoliticalRisk: region.country === 'China' || region.country === 'Taiwan' ? 'MEDIUM' : 'LOW',
      weatherExposure: 'LOW',
      leadTimeDays: randInt(14, 45),
      alternateSuppliers: [`SUP-${String(randInt(1, 160)).padStart(3, '0')}`, `SUP-${String(randInt(1, 160)).padStart(3, '0')}`],
      status: isRisk ? 'ELEVATED_RISK' : 'OPERATIONAL'
    });
  }

  // 45 Factories
  const factories = [];
  for (let i = 1; i <= 45; i++) {
    const region = randChoice(INDUSTRIAL_REGIONS);
    const product = randChoice(FINISHED_PRODUCTS);
    factories.push({
      id: `FAC-${String(i).padStart(2, '0')}`,
      name: `Gigafactory Plant ${String.fromCharCode(65 + (i % 26))}-${i} (${region.country})`,
      type: 'FACTORY',
      country: region.country,
      lat: region.lat + randFloat(-1.2, 1.2),
      lon: region.lon + randFloat(-1.5, 1.5),
      products: [product],
      productionCapacity: randInt(400, 1800),
      utilization: randInt(70, 96),
      inboundDependencies: [suppliers[randInt(0, 79)].id, suppliers[randInt(80, 159)].id],
      outboundDependencies: [],
      currentProduction: randInt(350, 1650),
      projectedProduction: randInt(320, 1650),
      downtimeRisk: i === 4 ? 'HIGH' : 'LOW',
      status: i === 4 ? 'WARNING' : 'OPERATIONAL',
      riskScore: i === 4 ? 76 : randInt(8, 35)
    });
  }

  // 85 Warehouses / Fulfillment Hubs
  const warehouses = [];
  for (let i = 1; i <= 85; i++) {
    const portOrRegion = i === 17 ? ports[0] : (i % 2 === 0 ? randChoice(ports) : randChoice(INDUSTRIAL_REGIONS));
    const safetyStock = randInt(4000, 15000);
    const currentStock = i === 17 ? Math.round(safetyStock * 0.72) : Math.round(safetyStock * randFloat(1.1, 2.5));
    const daysCover = i === 17 ? 4.8 : randFloat(12.0, 38.0);
    warehouses.push({
      id: `WH-${String(i).padStart(2, '0')}`,
      name: `Regional Logistics Hub WH-${i}`,
      type: 'WAREHOUSE',
      region: portOrRegion.country || 'Global',
      lat: portOrRegion.lat + randFloat(-0.8, 0.8),
      lon: portOrRegion.lon + randFloat(-1.0, 1.0),
      capacity: safetyStock * 3,
      utilization: randInt(65, 94),
      inventoryValue: currentStock * randInt(180, 450),
      safetyStock,
      currentStock,
      daysOfCover: parseFloat(daysCover.toFixed(1)),
      stockoutRisk: i === 17 ? 'CRITICAL' : (daysCover < 10 ? 'ELEVATED' : 'STABLE'),
      status: i === 17 ? 'CRITICAL_STOCKOUT_RISK' : 'OPERATIONAL',
      riskScore: i === 17 ? 89 : randInt(10, 35)
    });
  }

  // 52 Demand Centers
  const demandCenters = [];
  const MAJOR_MARKETS = [
    { name: 'Greater Tokyo Area', lat: 35.68, lon: 139.76, region: 'Asia-Pacific' },
    { name: 'Seoul Capital Area', lat: 37.56, lon: 126.97, region: 'Asia-Pacific' },
    { name: 'Shanghai Metropolitan', lat: 31.23, lon: 121.47, region: 'Asia-Pacific' },
    { name: 'Singapore Regional Hub', lat: 1.35, lon: 103.82, region: 'Southeast Asia' },
    { name: 'Mumbai Metropolitan', lat: 19.07, lon: 72.87, region: 'South Asia' },
    { name: 'Delhi NCR Hub', lat: 28.61, lon: 77.20, region: 'South Asia' },
    { name: 'Sydney-Melbourne Corridor', lat: -35.28, lon: 149.13, region: 'Oceania' },
    { name: 'Frankfurt-Rhine-Main', lat: 50.11, lon: 8.68, region: 'Europe' },
    { name: 'Greater London Area', lat: 51.50, lon: -0.12, region: 'Europe' },
    { name: 'Paris Île-de-France', lat: 48.85, lon: 2.35, region: 'Europe' },
    { name: 'Rotterdam-Antwerp Gateway', lat: 51.55, lon: 4.40, region: 'Europe' },
    { name: 'Chicago Industrial Zone', lat: 41.87, lon: -87.62, region: 'North America' },
    { name: 'New York Tri-State', lat: 40.71, lon: -74.00, region: 'North America' },
    { name: 'Southern California Logistics', lat: 34.05, lon: -118.24, region: 'North America' },
    { name: 'Texas Triangle (Dallas-Houston)', lat: 31.00, lon: -96.50, region: 'North America' },
    { name: 'São Paulo Metro', lat: -23.55, lon: -46.63, region: 'South America' },
    { name: 'Dubai-Abu Dhabi Hub', lat: 24.80, lon: 55.00, region: 'Middle East' }
  ];

  MAJOR_MARKETS.forEach((m, idx) => {
    const isDisrupted = m.name.includes('Singapore') || m.name.includes('Southern California');
    demandCenters.push({
      id: `DEM-${String(idx + 1).padStart(2, '0')}`,
      name: m.name,
      type: 'DEMAND_CENTER',
      region: m.region,
      lat: m.lat,
      lon: m.lon,
      demand: randInt(2500, 12000),
      forecast: randInt(2800, 13500),
      currentFulfillment: isDisrupted ? 88.4 : randFloat(96.5, 99.8),
      projectedShortfall: isDisrupted ? randInt(600, 1800) : 0,
      serviceLevel: isDisrupted ? 91.2 : randFloat(97.2, 99.5),
      status: isDisrupted ? 'DEGRADED_SERVICE' : 'HEALTHY',
      riskScore: isDisrupted ? 74 : randInt(8, 25)
    });
  });

  // 120 Intermodal Routes (Maritime Lanes, Rail, Highway, Air)
  const routes = [];
  let routeIdx = 1;
  // Maritime backbone between ports
  for (let i = 0; i < ports.length; i++) {
    for (let j = i + 1; j < ports.length; j++) {
      if ((i + j) % 5 === 0 && routes.length < 120) {
        const p1 = ports[i];
        const p2 = ports[j];
        const distKm = Math.round(calculateDistanceKm(p1.lat, p1.lon, p2.lat, p2.lon));
        const isSingaporeLane = p1.id === 'PORT-SIN' || p2.id === 'PORT-SIN';
        routes.push({
          id: `ROUTE-${String(routeIdx++).padStart(3, '0')}`,
          name: `${p1.name} ➔ ${p2.name}`,
          type: 'MARITIME_LANE',
          originId: p1.id,
          destinationId: p2.id,
          originLat: p1.lat,
          originLon: p1.lon,
          destLat: p2.lat,
          destLon: p2.lon,
          distanceKm: distKm,
          transitDays: parseFloat((distKm / 750).toFixed(1)),
          costPerTEU: Math.round(distKm * 0.42),
          capacityTEU: randInt(8000, 24000),
          utilization: isSingaporeLane ? 98 : randInt(65, 88),
          carbonKgPerTEU: Math.round(distKm * 0.08),
          status: isSingaporeLane ? 'CONGESTED_WARNING' : 'NORMAL',
          riskScore: isSingaporeLane ? 82 : randInt(8, 30)
        });

        // Add bidirectional return lane
        routes.push({
          id: `ROUTE-${String(routeIdx++).padStart(3, '0')}`,
          name: `${p2.name} ➔ ${p1.name}`,
          type: 'MARITIME_LANE',
          originId: p2.id,
          destinationId: p1.id,
          originLat: p2.lat,
          originLon: p2.lon,
          destLat: p1.lat,
          destLon: p1.lon,
          distanceKm: distKm,
          transitDays: parseFloat((distKm / 750).toFixed(1)),
          costPerTEU: Math.round(distKm * 0.42),
          capacityTEU: randInt(8000, 24000),
          utilization: isSingaporeLane ? 98 : randInt(65, 88),
          carbonKgPerTEU: Math.round(distKm * 0.08),
          status: isSingaporeLane ? 'CONGESTED_WARNING' : 'NORMAL',
          riskScore: isSingaporeLane ? 82 : randInt(8, 30)
        });
      }
    }
  }

  // 320 Active Vessels
  const vessels = [];
  const vesselNames = [
    'MV Horizon Voyager', 'Ever Zenith', 'Cosco Harmony', 'Maersk Constellation',
    'CMA CGM Triumphant', 'MSC Palantir', 'Hapag-Lloyd Express', 'ONE Brilliance',
    'Yang Ming Courage', 'ZIM Pacific Star', 'OOCL Polaris', 'HMM Starlight',
    'Nordic Titan', 'Pacific Pioneer', 'Atlantic Resilient', 'Aegean Vanguard'
  ];

  for (let i = 1; i <= 320; i++) {
    const route = randChoice(routes);
    const progress = randFloat(0.05, 0.95);
    const vLat = route.originLat + (route.destLat - route.originLat) * progress;
    const vLon = route.originLon + (route.destLon - route.originLon) * progress;
    const isSinBound = route.destinationId === 'PORT-SIN';
    const delayHours = isSinBound ? randInt(36, 96) : (i % 9 === 0 ? randInt(12, 36) : 0);

    vessels.push({
      id: `VESSEL-${String(i).padStart(3, '0')}`,
      name: `${vesselNames[i % vesselNames.length]} #${i}`,
      type: 'VESSEL',
      lat: parseFloat(vLat.toFixed(4)),
      lon: parseFloat(vLon.toFixed(4)),
      originId: route.originId,
      destinationId: route.destinationId,
      routeId: route.id,
      cargoTEU: randInt(3500, 18500),
      speedKnots: parseFloat(randFloat(14.5, 21.0).toFixed(1)),
      etaDays: parseFloat(((1 - progress) * route.transitDays + (delayHours / 24)).toFixed(1)),
      delayHours,
      status: delayHours > 24 ? 'DELAYED' : (delayHours > 0 ? 'SLOW_STEAM' : 'ON_SCHEDULE'),
      riskScore: delayHours > 24 ? 78 : (delayHours > 0 ? 45 : 12)
    });
  }

  // 1,000 Active Shipments
  const shipments = [];
  for (let i = 1; i <= 1000; i++) {
    const vessel = randChoice(vessels);
    const product = randChoice(FINISHED_PRODUCTS.concat(RAW_MATERIALS));
    const prio = i % 15 === 0 ? 'CRITICAL' : (i % 4 === 0 ? 'HIGH' : 'STANDARD');
    const delayDays = parseFloat((vessel.delayHours / 24).toFixed(1));
    shipments.push({
      id: `SHP-${String(i).padStart(4, '0')}`,
      type: 'SHIPMENT',
      product,
      quantity: randInt(50, 600),
      valueUSD: randInt(120000, 4800000),
      priority: prio,
      vesselId: vessel.id,
      originId: vessel.originId,
      destinationId: vessel.destinationId,
      currentLat: vessel.lat,
      currentLon: vessel.lon,
      delayDays,
      atRisk: delayDays > 1.5,
      status: delayDays > 2.0 ? 'CRITICAL_DELAY' : (delayDays > 0.5 ? 'DELAYED' : 'IN_TRANSIT'),
      riskScore: delayDays > 2.0 ? 86 : (delayDays > 0.5 ? 54 : 10)
    });
  }

  // 20 Seeded Global Disruptions
  const disruptions = [
    {
      id: 'DISR-01',
      title: 'Port of Singapore Severe Congestion & Berth Lockdown',
      type: 'PORT_CLOSURE',
      category: 'Logistics Bottleneck',
      lat: 1.264,
      lon: 103.840,
      severity: 'HIGH',
      radiusKm: 280,
      startTime: '2026-09-17T08:00:00Z',
      expectedDurationDays: 5,
      confidence: 0.94,
      affectedPortId: 'PORT-SIN',
      affectedVesselIds: vessels.filter(v => v.destinationId === 'PORT-SIN').map(v => v.id),
      affectedShipmentsCount: 47,
      estimatedRevenueExposureUSD: 142000000,
      downstreamWarehouseIds: ['WH-17', 'WH-24', 'WH-32'],
      summary: 'Extreme berth congestion compounded by monsoon squalls and labor shortages has forced a 5-day handling pause at Singapore terminals.'
    },
    {
      id: 'DISR-02',
      title: 'Suez Canal Sandstorm Transit Restriction',
      type: 'CANAL_BLOCKAGE',
      category: 'Geopolitical & Maritime',
      lat: 30.60,
      lon: 32.35,
      severity: 'HIGH',
      radiusKm: 350,
      startTime: '2026-09-16T14:30:00Z',
      expectedDurationDays: 4,
      confidence: 0.89,
      affectedPortId: 'PORT-SUEZ',
      affectedVesselIds: vessels.slice(0, 18).map(v => v.id),
      affectedShipmentsCount: 38,
      estimatedRevenueExposureUSD: 98000000,
      downstreamWarehouseIds: ['WH-04', 'WH-12'],
      summary: 'Zero-visibility sandstorm halted northbound convoys; 32 container vessels queued at Great Bitter Lake.'
    },
    {
      id: 'DISR-03',
      title: 'Hsinchu Semiconductor Fab Power Disturbance',
      type: 'SUPPLIER_SHUTDOWN',
      category: 'Production Outage',
      lat: 24.78,
      lon: 121.0,
      severity: 'CRITICAL',
      radiusKm: 90,
      startTime: '2026-09-17T02:15:00Z',
      expectedDurationDays: 7,
      confidence: 0.96,
      affectedSupplierIds: ['SUP-012', 'SUP-014'],
      affectedShipmentsCount: 22,
      estimatedRevenueExposureUSD: 210000000,
      downstreamFactoryIds: ['FAC-04', 'FAC-09'],
      summary: 'Grid frequency trip triggered automated shutdown in 300mm wafer lithography line; 14-day production backlog projected.'
    },
    {
      id: 'DISR-04',
      title: 'Indian Ocean Tropical Cyclone Asani Tracking Towards Bay of Bengal',
      type: 'SEVERE_WEATHER',
      category: 'MetOcean Hazard',
      lat: 8.50,
      lon: 86.20,
      severity: 'HIGH',
      radiusKm: 650,
      startTime: '2026-09-17T00:00:00Z',
      expectedDurationDays: 4.5,
      confidence: 0.91,
      affectedVesselIds: vessels.slice(19, 36).map(v => v.id),
      affectedShipmentsCount: 29,
      estimatedRevenueExposureUSD: 64000000,
      summary: 'Category 3 cyclone generating 9-meter swells; commercial maritime corridors south of Sri Lanka rerouting 450nm southward.'
    },
    {
      id: 'DISR-05',
      title: 'Panama Canal Draft Restriction & Booking Cap',
      type: 'TRANSIT_BOTTLENECK',
      category: 'Environmental',
      lat: 9.10,
      lon: -79.70,
      severity: 'MEDIUM',
      radiusKm: 200,
      startTime: '2026-09-15T12:00:00Z',
      expectedDurationDays: 14,
      confidence: 0.98,
      affectedPortId: 'PORT-COL',
      affectedVesselIds: vessels.slice(37, 50).map(v => v.id),
      affectedShipmentsCount: 19,
      estimatedRevenueExposureUSD: 41000000,
      summary: 'Gatun Lake reservoir level below 79.5ft limits maximum neo-panamax draft to 44ft, enforcing 20% cargo cut.'
    }
  ];

  return {
    ports,
    suppliers,
    factories,
    warehouses,
    demandCenters,
    routes,
    vessels,
    shipments,
    disruptions
  };
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
