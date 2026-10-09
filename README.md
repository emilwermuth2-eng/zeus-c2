# ⚡ Zeus C2

Unified OSINT + C2 operator console.

**Gods Eye View** (3D intelligence map) fused with **Havoc C2** (operator console + beacon manager) in a single web UI.

---

## Architecture

```
┌────────────────────────────────────────────┐
│                Browser (Vite)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  OSINT   │  │ C2 Console│  │ Beacons  │ │
│  │ (Cesium) │  │ (xterm)  │  │  (table) │ │
│  └──────────┘  └─────┬────┘  └────┬─────┘ │
└────────────────────────┼──────────┼────────┘
                         │ WS /ws/havoc
              ┌──────────▼──────────▼────────┐
              │    Zeus Node.js proxy         │
              │    server/providers/havoc.js  │
              └──────────────┬───────────────┘
                             │ WS :40056
              ┌──────────────▼───────────────┐
              │    Havoc Teamserver (Go)      │
              └───────────────────────────────┘
```

---

## Quick Start

```bash
git clone https://github.com/YOUR_ORG/zeus-c2.git
cd zeus-c2
node scripts/setup.js          # clones Gods Eye View + installs deps
cp .env.example .env           # fill in API keys + Havoc creds
./havoc/teamserver             # start Havoc teamserver separately
npm run dev                    # start Zeus (http://localhost:4173)
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `HAVOC_HOST` | `127.0.0.1` | Havoc teamserver host |
| `HAVOC_PORT` | `40056` | Havoc teamserver WS port |
| `HAVOC_OPERATOR` | `operator` | Operator username |
| `HAVOC_PASSWORD` | `password` | Operator password |
| `CESIUM_ION` | — | Cesium ion token (3D tiles) |
| `GOOGLE_MAPS_API_KEY` | — | Google Maps API key |
| `OPENAI_API_KEY` | — | OpenAI key (voice assistant) |

---

## UI Panels

| Panel | Key | Description |
|---|---|---|
| **OSINT** | `Tab 1` | Gods Eye View 3D intelligence map |
| **C2 Console** | `Tab 2` | xterm terminal — beacon output + task dispatch |
| **Beacons** | `Tab 3` | Active beacon table with session metadata |

---

## Project Structure

```
zeus-c2/
├── index.html                        # App shell
├── style.css                         # Global + panel styles
├── vite.config.js                    # Vite + WS proxy config
├── src/
│   ├── main.js                       # Bootstrap, tab nav, service wiring
│   ├── app/osint.js                  # CesiumJS map init
│   ├── services/c2service.js         # WS client, beacon state, event bus
│   └── ui/panels/c2console/
│       ├── index.js                  # C2 Console panel
│       ├── terminal.js               # xterm.js wrapper
│       ├── taskbar.js                # Command input + quick-task buttons
│       ├── beacons.js                # Beacon list panel
│       └── c2console.css            # Panel styles
└── server/
    ├── index.js                      # Express + WS upgrade router
    └── providers/havoc.js            # Havoc WS proxy + frame translation
```

---

## Adding Intel Layers (Gods Eye View)

Zeus C2 inherits the full Gods Eye View layer system. To add a new OSINT layer:

1. Create `src/layers/<family>/` — source, record, controller, renderer modules
2. Register in `src/app/catalog.js`
3. Add env key in `.env.example` if the layer needs an API key

See `gods-eye-view/CONTRIBUTING.md` for the full layer contract.

---

## License

Zeus C2 integration code: MIT  
Gods Eye View: see `gods-eye-view/LICENSE`  
Havoc: see Havoc LICENSE
