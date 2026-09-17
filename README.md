# 🌐 SAP RESILIENT · Agentic Self-Adapting Supply-Chain Control Tower

> **A real-time geospatial digital twin and autonomous operations command center for global supply chains.**  
> *Inspired by the spatial-computing and telemetry interaction models of God's Eye View.*

---

## 🎯 Executive Overview

**SAP Resilient** transforms fragmented logistics spreadsheets into a living, connected **3D digital twin** of the entire global value chain:
$$\text{SUPPLIERS} \longrightarrow \text{FACTORIES} \longrightarrow \text{PORTS} \longrightarrow \text{VESSELS} \longrightarrow \text{TRANSIT LANES} \longrightarrow \text{WAREHOUSES} \longrightarrow \text{DEMAND CENTERS}$$

When an unexpected event strikes (port lockdown, canal blockage, extreme typhoon, supplier outage), the system:
1. **Senses** anomalies across real-time telemetry feeds.
2. **Propagates** multi-hop causal downstream consequences (delayed ships, raw material stockouts, factory downtime, demand shortfall).
3. **Synthesizes** alternative recovery strategies using **9 specialist cooperating AI agents**.
4. **Optimizes** candidate plans across multi-objective trade-offs (Cost, Speed, Risk, Carbon).
5. **Presents** human-in-the-loop decision cards with full reasoning inputs.
6. **Executes & Visualizes** dynamic network recovery in real time.

---

## 🏗️ Architecture & Technology Stack

- **3D Geospatial Engine**: [CesiumJS](https://cesium.com/platform/cesiumjs/) (v1.124) with tactical aerospace dark atmosphere, geodesic shipping corridors, and keyless global satellite imagery.
- **2D Topological Graph View**: Synchronized interactive DAG canvas (`Suppliers ➔ Factories ➔ Ports ➔ Warehouses ➔ Demand`) with drag, zoom, and entity inspection.
- **Frontend Architecture**: Pure Vanilla JavaScript (ESM) + Vite 6 — zero framework bloat, sub-second cold starts, and 60 FPS WebGL rendering.
- **Offline & Zero-Setup Determinism**: Runs 100% offline out-of-the-box without requiring paid API keys.

---

## 🤖 The 9 Specialist AI Agents

| Agent | Codename | Role & Responsibilities |
| :--- | :--- | :--- |
| **Agent 1** | **SENTINEL** | Continuous telemetry monitoring; anomaly and congestion detection. |
| **Agent 2** | **IMPACT ANALYST** | Multi-hop graph traversal; computes exposed assets, delayed shipments, and revenue at risk. |
| **Agent 3** | **SCENARIO ENGINEER** | Synthesizes candidate alternatives (rerouting, air freight, buffer transfers, second-sourcing). |
| **Agent 4** | **ROUTE OPTIMIZER** | Multi-objective heuristic evaluation balancing Cost, Delay, Operational Risk, and CO₂ emissions. |
| **Agent 5** | **INVENTORY AGENT** | Safety-stock buffer runway forecasting and inter-warehouse rebalancing. |
| **Agent 6** | **PROCUREMENT AGENT** | Second-source supplier qualification, lead times, and capacity allocation. |
| **Agent 7** | **COMPLIANCE AGENT** | Cabotage rules, customs pre-clearance permits, export regulations, and sanctions screening. |
| **Agent 8** | **RECOVERY AGENT** | Velocity curve tracking, ETA restoration, and network restabilization monitoring. |
| **Agent 9** | **GOVERNOR** | Supervisory review, conflict resolution, policy threshold enforcement, and Human Approval Card generation. |

---

## 🎛️ Human-in-the-Loop Governance

Consequential decisions are never executed silently:
- **Low Impact ($<\$25\text{k}$)**: Policy-gated auto-execution.
- **Medium Impact ($\$25\text{k} - \$100\text{k}$)**: Operations Supervisor approval.
- **High Impact ($>\$100\text{k}$)**: Operations Manager / Executive Director approval.

Every recommendation card exposes:
- **Action Title & Summary**
- **Why? Causal Explanation**
- **Trade-off Metrics**: Incremental Cost, ETA delta, Service Level improvement, Inventory risk aversion, Carbon footprint.
- **Reversibility Window & Assumptions**
- **Actions**: `APPROVE & EXECUTE`, `REJECT`, and `WHY?`.

---

## ⚡ Quick Start

### Prerequisites
- Node.js 20.x, 22.x, or 24.x
- npm 10+

### Installation & Launch
```bash
# Clone the repository
git clone https://github.com/ArindamJaiman/SAP-HACKFEST.git
cd SAP-HACKFEST

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite verifying determinism, cascade propagation, node knockout resilience, and multi-objective policy weights:
```bash
npm test
```

Build production bundle:
```bash
npm run build
```

---

## ⌨️ Tactical Keyboard Shortcuts

- `/` : Open Natural Language Command Bar
- `0` : Reset Camera to Full Global View
- `Esc` : Close Modals / Deselect Entity
