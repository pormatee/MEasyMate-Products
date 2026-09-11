# MEasyMate Products Architecture V1

```text
MEasyMate-Products/
├── shared/
│   ├── brand/
│   │   ├── measymate-logo.jpg
│   │   ├── measymate-icon-192.png
│   │   └── measymate-icon-512.png
│   └── notify/
│       ├── measymate-notify-core.js
│       └── all-project-notice.js
├── projects/
│   ├── contact-shift/
│   │   ├── index.html              # after verified migration
│   │   └── project-notice.js
│   ├── report-pro/
│   ├── factory-daily/
│   └── money/
├── templates/
└── docs/
```

## Boundaries

This repository is for static/web HTML products and shared web assets.

Keep these systems separate:
- SECRETARY_MASTER
- PrachinLife / LocalLife
- Promotion Intelligence
- AIsure
- MEasyMate AI Hub

Backend/license/API code should remain in its own appropriate repository.
