# Nexiliance — Proactive CRA Readiness Platform

Nexiliance is a lightweight, frontend-driven readiness dashboard designed to help manufacturers and developers assess their compliance with the European Cyber Resilience Act (CRA).

## 🚀 Key Features

- **Interactive CRA Assessment** — Answer a customized subset of key compliance questions mapped to CRA pillars (Security by Design, Secure by Default, SBOM, Conformity Assessment, Vulnerability Disclosure, and Support Period).
- **CRA Readiness Radar** — Visualizes readiness scores across all pillars using a dynamic radar chart powered by Chart.js.
- **Live Manifest Scanner & SBOM Generator** — Upload package manifests (such as `package.json`, `requirements.txt`, or `pom.xml`) to list software dependencies and query the OSV database for known CVEs. Download a CycloneDX-compliant SBOM.
- **Vulnerability Tracker & ENISA reporting** — Simulated tracking of active vulnerabilities to help team members align with the CRA's strict 24-hour mandatory reporting duty.
- **PDF Report Export** — Generates print-ready audit reports directly from your browser.
- **Modern Premium Light Design** — Designed with clear, professional aesthetics, smooth gradients, and glassmorphism elements.

## 🛠️ Tech Stack

- **Core**: HTML5, Vanilla JavaScript (no framework dependencies)
- **Styling**: Modern CSS3 using variable-based theme tokens (optimized for light theme)
- **Libraries**: Chart.js (for radar diagrams)
- **Integrations**: OSV.dev REST API (for live vulnerability lookup)

## 📦 Running Locally

Since the application uses browser-native APIs and modular JavaScript, you can run it using any simple local HTTP server:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (npx)
npx http-server -p 8000
```

Once running, navigate to `http://localhost:8000` in your web browser.
