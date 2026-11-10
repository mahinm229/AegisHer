# AegisHer — Women's Safety Concept Simulator

AegisHer is a **front-end demonstration**, not a deployed safety service. It illustrates a possible interface for sensor-fusion risk scoring, sample safe-route visualization, a demo contact list, local browser audio, and a SHA-256 hash-linked event ledger.

## Critical safety limitation

**Do not rely on this prototype during an emergency.** It does not connect to a wearable, PPG sensor, microphone classifier, TinyML wake-word model, LoRaWAN gateway, streetlight, CCTV network, GPS receiver, SMS/WhatsApp provider, phone service, police control room, or emergency responder. Sensor inputs and route data are simulated or illustrative. The “SOS” control only changes local browser state. No notification or dispatch is sent.

The evidence ledger computes genuine SHA-256 digests and links each new entry to the previous entry. It is still held in browser memory, is not digitally signed or externally anchored, and can be modified by anyone controlling the page. It is not tamper-proof or legal evidence.

## Requirements

- Node.js 20 or newer
- A modern browser
- Internet access for the Tailwind CSS, Chart.js, and Google Fonts CDN assets referenced by `index.html`

## Run locally

```bash
npm start
```

Then open <http://127.0.0.1:4173>. Serving through localhost provides a secure context for the browser Web Crypto API. The app can also be hosted as a static site, provided the two local JavaScript files are kept next to `index.html`.

## Verification

```bash
npm test
npm run benchmark
```

The test suite checks SHA-256 standard vectors, hash-chain integrity, concurrent ledger writes, tamper detection, safe rendering of user-supplied contact strings, sensor-listener cleanup, mobile-oriented layout guards, and the root-level project scripts.
