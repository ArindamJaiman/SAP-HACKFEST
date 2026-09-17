/**
 * SAP Resilient: Main Application Lifecycle Orchestrator
 * Fully wires Application Shell, Sidebar Navigation, 3D Digital Twin,
 * Hero Overview KPIs, Dedicated Operational Page Views, What-If Simulator,
 * and Multi-Agent Orchestration.
 */

import * as Cesium from 'cesium';
import { store } from './store.js';
import { eventBus } from './events.js';
import { createDigitalTwinViewer } from '../digital-twin/viewer.js';
import { SceneController } from '../digital-twin/sceneController.js';
import { EntityRenderer } from '../digital-twin/entityRenderer.js';
import { RouteRenderer } from '../digital-twin/routeRenderer.js';
import { PropagationOverlay } from '../digital-twin/propagationOverlay.js';
import { NetworkGraphView } from '../digital-twin/networkGraphView.js';

import { ExecutiveHud } from '../ui/hud.js';
import { SidebarNav } from '../ui/sidebarNav.js';
import { HeroOverview } from '../ui/heroOverview.js';
import { PageViewsManager } from '../ui/pageViews.js';
import { EntityDrawer } from '../ui/entityDrawer.js';
import { ApprovalCardsManager } from '../ui/approvalCards.js';
import { AgentFeedBox } from '../ui/agentFeed.js';
import { TimelineControls } from '../ui/timelineControls.js';
import { CommandBar } from '../ui/commandBar.js';
import { IncidentBanner } from '../ui/incidentBanner.js';
import { demoDirector } from '../ui/demoDirector.js';
import { orchestrator } from '../agents/orchestrator.js';

export async function bootstrapApplication() {
  console.info('[SAP Resilient] Bootstrapping Control Tower Engine...');

  // 1. Initialize Cesium Digital Twin Viewer
  const viewer = createDigitalTwinViewer('cesiumContainer');
  const sceneController = new SceneController(viewer);
  const entityRenderer = new EntityRenderer(viewer);
  const routeRenderer = new RouteRenderer(viewer);
  const propagationOverlay = new PropagationOverlay(viewer);
  const networkGraphView = new NetworkGraphView('network-graph-container');

  // 2. Render Seed Entities & Multimodal Logistics onto Globe
  const state = store.getState();
  entityRenderer.renderAllEntities(state.entities);
  routeRenderer.renderRoutes(state.entities.routes);

  // 3. Render initial causal propagation arcs from Singapore
  const sinPort = state.entities.ports.find(p => p.id === 'PORT-SIN');
  const atRiskWarehouses = state.entities.warehouses.filter(w => w.id === 'WH-17' || w.id === 'WH-24');
  if (sinPort && atRiskWarehouses.length > 0) {
    propagationOverlay.renderCausalArcs(sinPort, atRiskWarehouses);
  }

  // 4. Initialize Modular UI Architecture
  const hud = new ExecutiveHud('top-hud');
  const sidebarNav = new SidebarNav('left-panel');
  const heroOverview = new HeroOverview('center-viewport');
  const pageViews = new PageViewsManager('operational-views-container');
  const entityDrawer = new EntityDrawer('right-drawer');
  const approvalCards = new ApprovalCardsManager('approval-cards-container');
  const agentFeed = new AgentFeedBox('agent-feed-container');
  const timelineControls = new TimelineControls('bottom-dock');
  const commandBar = new CommandBar('command-bar-modal');
  const incidentBanner = new IncidentBanner('incident-banner-container');

  // 5. Connect Cesium Click Handler to Context Inspector (Section 20)
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.position);
    if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.properties) {
      const rawProps = pickedObject.id.properties.getValue(Cesium.JulianDate.now());
      store.selectEntity(rawProps);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

  // 6. Synchronize Store Changes to Visual 3D Layers
  store.subscribe((currState) => {
    // Layer toggles
    Object.keys(currState.layers).forEach(k => {
      entityRenderer.updateLayerVisibility(k, currState.layers[k]);
    });

    // View mode (3D / 2D / Graph)
    if (currState.ui.viewMode === 'GRAPH') {
      networkGraphView.activate();
    } else {
      networkGraphView.deactivate();
      if (currState.ui.viewMode === '2D') {
        sceneController.set2DMode();
      } else {
        sceneController.set3DMode();
      }
    }

    // Approved route visualization
    if (currState.simulation.recoveryStatus === 'IN_RECOVERY' || currState.simulation.recoveryStatus === 'RECOVERED') {
      routeRenderer.highlightRecoveryRoute(
        { lat: 1.264, lon: 103.840 },
        { lat: 3.000, lon: 101.400 },
        'AI REROUTE: SINGAPORE ➔ PORT KLANG'
      );
    }
  });

  // 7. Wire Global Debugging & Controller References
  window.__cesiumViewer = viewer;
  window.__appSceneController = sceneController;
  window.__appOrchestrator = orchestrator;
  window.__appDemoDirector = demoDirector;
  window.__appStore = store;
  window.__appEventBus = eventBus;

  // 8. Launch Multi-Agent Sensing Loop
  orchestrator.startSensingLoop();

  console.info('[SAP Resilient] Control Tower fully operational.');
}
