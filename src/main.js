/**
 * SAP Resilient: Application Entrypoint
 */

import './styles/main.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/animations.css';
import { bootstrapApplication } from './app/application.js';

window.addEventListener('DOMContentLoaded', () => {
  bootstrapApplication().catch(err => {
    console.error('[SAP Resilient Startup Failure]', err);
    alert(`Control Tower failed to initialize: ${err.message}`);
  });
});
