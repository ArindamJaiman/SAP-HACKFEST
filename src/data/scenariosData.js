/**
 * SAP Resilient: Preloaded Benchmark Disruption Scenarios (Section 39)
 */

export const PRELOADED_SCENARIOS = [
  {
    id: 'SCENARIO-01',
    name: 'Singapore Port Closure (5-Day Handling Halt)',
    category: 'Port Closure',
    severity: 'CRITICAL',
    epicenter: { lat: 1.264, lon: 103.840, label: 'Port of Singapore (PSA)' },
    summary: 'Port of Singapore declares force majeure for 5 days due to intense squalls and automated crane terminal power synchronization failure.',
    timelineHours: 120,
    affectedNetwork: {
      ports: ['PORT-SIN'],
      vesselsCount: 47,
      shipmentsCount: 84,
      atRiskWarehouses: ['WH-17', 'WH-24', 'WH-32'],
      affectedFactories: ['FAC-04', 'FAC-07'],
      demandCenters: ['DEM-04', 'DEM-05']
    },
    baselineImpact: {
      avgDelayDays: 4.8,
      serviceLevelDrop: -8.4, // from 97.8% down to 89.4%
      safetyStockBreaches: 3,
      revenueExposureUSD: 142000000,
      carbonDeltaKg: 0
    },
    candidateOptions: [
      {
        id: 'OPT-A',
        title: 'Maritime Reroute via Port Klang & Colombo',
        strategy: 'Divert inbound container carriers to Port Klang (Malaysia) and Colombo (Sri Lanka) with bonded truck shuttle.',
        delayDeltaDays: 0.7,
        costUSD: 184000,
        serviceLevelProjected: 98.1,
        risk: 'MEDIUM',
        carbonDeltaKg: 4200,
        confidence: 0.88,
        approvalTier: 'OPERATIONS_MANAGER',
        reversibility: 'HIGH'
      },
      {
        id: 'OPT-B',
        title: 'High-Priority Air Freight Transshipment',
        strategy: 'Offload top 15% critical semiconductor shipments at Bangkok and charter 3x Boeing 777F cargo flights directly to Munich.',
        delayDeltaDays: -1.2, // 1.2 days faster than original schedule
        costUSD: 640000,
        serviceLevelProjected: 99.4,
        risk: 'LOW',
        carbonDeltaKg: 38500,
        confidence: 0.95,
        approvalTier: 'EXECUTIVE_DIRECTOR',
        reversibility: 'LOW'
      },
      {
        id: 'OPT-C',
        title: 'Regional Inventory Rebalance (WH-09 ➔ WH-17)',
        strategy: 'Execute emergency bonded cross-deck transfer of 2,400 battery subassemblies from Australian warehouse WH-09 to cover production gap.',
        delayDeltaDays: 0.3,
        costUSD: 92000,
        serviceLevelProjected: 97.6,
        risk: 'LOW',
        carbonDeltaKg: 1800,
        confidence: 0.91,
        approvalTier: 'OPERATIONS_MANAGER',
        reversibility: 'HIGH'
      },
      {
        id: 'OPT-D',
        title: 'Slow Steam & Absorb Delay (No-Action Baseline)',
        strategy: 'Maintain standard anchorage queue at Singapore outer roads; incur factory line-stops and SLA demurrage penalties.',
        delayDeltaDays: 5.2,
        costUSD: 2400000,
        serviceLevelProjected: 89.2,
        risk: 'CRITICAL',
        carbonDeltaKg: -2100,
        confidence: 0.99,
        approvalTier: 'REJECTED_BY_GOVERNOR',
        reversibility: 'NONE'
      }
    ]
  },
  {
    id: 'SCENARIO-02',
    name: 'Suez Canal Transit Restriction (Northbound Convoys Suspended)',
    category: 'Canal Disruption',
    severity: 'HIGH',
    epicenter: { lat: 30.60, lon: 32.35, label: 'Suez Canal (Great Bitter Lake)' },
    summary: 'Ultra-Large Container Vessel grounding combined with severe desert sandstorm suspends Suez transit for 96 hours.',
    timelineHours: 96,
    affectedNetwork: {
      ports: ['PORT-SUEZ', 'PORT-ROT', 'PORT-ANT'],
      vesselsCount: 38,
      shipmentsCount: 65,
      atRiskWarehouses: ['WH-04', 'WH-12'],
      affectedFactories: ['FAC-10', 'FAC-11'],
      demandCenters: ['DEM-08', 'DEM-10']
    },
    baselineImpact: {
      avgDelayDays: 6.2,
      serviceLevelDrop: -7.1,
      safetyStockBreaches: 2,
      revenueExposureUSD: 98000000,
      carbonDeltaKg: 0
    },
    candidateOptions: [
      {
        id: 'OPT-SUEZ-A',
        title: 'Cape of Good Hope Rerouting',
        strategy: 'Order 18 vessels south of Red Sea to immediately alter course around South Africa; increase engine load to 21 knots.',
        delayDeltaDays: 3.5,
        costUSD: 780000,
        serviceLevelProjected: 96.2,
        risk: 'MEDIUM',
        carbonDeltaKg: 64000,
        confidence: 0.92,
        approvalTier: 'EXECUTIVE_DIRECTOR',
        reversibility: 'LOW'
      },
      {
        id: 'OPT-SUEZ-B',
        title: 'Intermodal Rail Landbridge (China-Europe Express)',
        strategy: 'Divert Europe-bound high-value components to Xi\'an and Chongqing rail hubs via Malaszewicze terminal.',
        delayDeltaDays: 0.5,
        costUSD: 410000,
        serviceLevelProjected: 98.0,
        risk: 'LOW',
        carbonDeltaKg: 12000,
        confidence: 0.89,
        approvalTier: 'OPERATIONS_MANAGER',
        reversibility: 'MEDIUM'
      }
    ]
  },
  {
    id: 'SCENARIO-03',
    name: 'Major Semiconductor Supplier Shutdown (Hsinchu Wafer Fab)',
    category: 'Supplier Outage',
    severity: 'CRITICAL',
    epicenter: { lat: 24.78, lon: 121.0, label: 'Hsinchu Science Park Fab 14' },
    summary: 'Substation explosion disrupts cleanroom air filtration; wafer fabrication halted for minimum 7 days.',
    timelineHours: 168,
    affectedNetwork: {
      suppliers: ['SUP-012', 'SUP-014'],
      affectedFactories: ['FAC-04', 'FAC-09', 'FAC-14'],
      shipmentsCount: 32,
      atRiskWarehouses: ['WH-02', 'WH-18'],
      demandCenters: ['DEM-01', 'DEM-12']
    },
    baselineImpact: {
      avgDelayDays: 14.0,
      serviceLevelDrop: -12.5,
      safetyStockBreaches: 5,
      revenueExposureUSD: 210000000,
      carbonDeltaKg: 0
    },
    candidateOptions: [
      {
        id: 'OPT-FAB-A',
        title: 'Contract Second-Source Allocation (Korea & Dresden)',
        strategy: 'Activate pre-qualified dual-source master agreements with Gyeonggi Fab B and Dresden Microelectronics at 18% pricing premium.',
        delayDeltaDays: 2.1,
        costUSD: 390000,
        serviceLevelProjected: 97.1,
        risk: 'LOW',
        carbonDeltaKg: 2800,
        confidence: 0.94,
        approvalTier: 'VP_PROCUREMENT',
        reversibility: 'MEDIUM'
      }
    ]
  },
  {
    id: 'SCENARIO-04',
    name: '15% European Demand Spike (Heavy Industrial Equipment)',
    category: 'Demand Shock',
    severity: 'MEDIUM',
    epicenter: { lat: 50.11, lon: 8.68, label: 'Central European Distribution Grid' },
    summary: 'Unplanned renewable infrastructure projects trigger an abrupt 15% demand surge for electrical utility inverters and smart turbines.',
    timelineHours: 720,
    affectedNetwork: {
      demandCenters: ['DEM-08', 'DEM-09', 'DEM-10'],
      atRiskWarehouses: ['WH-04', 'WH-05', 'WH-06'],
      affectedFactories: ['FAC-10', 'FAC-12']
    },
    baselineImpact: {
      avgDelayDays: 0,
      serviceLevelDrop: -9.8,
      safetyStockBreaches: 4,
      revenueExposureUSD: 45000000,
      carbonDeltaKg: 0
    },
    candidateOptions: [
      {
        id: 'OPT-DEM-A',
        title: 'Overtime Factory Shifts & Buffer Allocation',
        strategy: 'Authorize 24/7 weekend shift at Rhine-Ruhr plant and release strategic reserve stock.',
        delayDeltaDays: 0,
        costUSD: 210000,
        serviceLevelProjected: 98.5,
        risk: 'LOW',
        carbonDeltaKg: 5100,
        confidence: 0.96,
        approvalTier: 'OPERATIONS_MANAGER',
        reversibility: 'HIGH'
      }
    ]
  },
  {
    id: 'SCENARIO-05',
    name: 'Category 3 Cyclone in Bay of Bengal (Indian Ocean Maritime Corridor)',
    category: 'Severe Weather',
    severity: 'HIGH',
    epicenter: { lat: 8.50, lon: 86.20, label: 'Bay of Bengal Storm Core' },
    summary: '9-meter wave heights and 120km/h sustained winds force southern corridor rerouting for 36 bulk and container vessels.',
    timelineHours: 108,
    affectedNetwork: {
      ports: ['PORT-CMB', 'PORT-NSA'],
      vesselsCount: 36,
      shipmentsCount: 42,
      atRiskWarehouses: ['WH-14', 'WH-16']
    },
    baselineImpact: {
      avgDelayDays: 2.8,
      serviceLevelDrop: -4.2,
      safetyStockBreaches: 1,
      revenueExposureUSD: 64000000,
      carbonDeltaKg: 0
    },
    candidateOptions: [
      {
        id: 'OPT-CYCLONE-A',
        title: 'Equatorial Deviation Route (5° South)',
        strategy: 'Optimize navigational course 400nm south of Sri Lanka to bypass storm radius while sustaining 17.5 knots.',
        delayDeltaDays: 0.6,
        costUSD: 88000,
        serviceLevelProjected: 97.9,
        risk: 'LOW',
        carbonDeltaKg: 7800,
        confidence: 0.97,
        approvalTier: 'OPERATIONS_DISPATCHER',
        reversibility: 'HIGH'
      }
    ]
  }
];
