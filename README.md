# MEasyMate Products

Central repository structure for MEasyMate standalone Web/HTML products.

## Baseline

- Web-first
- One project = one main `index.html` where practical
- Shared MEasyMate brand assets live under `shared/brand/`
- Global MEasyMate notices live under `shared/notify/`
- Each project keeps its own `project-notice.js`
- User data must follow MEasyMate Web Data Safety Standard V1
- Shortcut icon must use the approved MEasyMate identity
- Shortcut name must use the approved Project Display Name

## Structure

```text
MEasyMate-Products/
├── shared/
│   ├── brand/
│   └── notify/
├── projects/
│   ├── contact-shift/
│   ├── report-pro/
│   ├── factory-daily/
│   └── money/
├── templates/
└── docs/
```

## Important

The actual `index.html` of each existing product is NOT copied into this starter until the latest source is inspected and verified.

Before migrating a real product, use the project-opening rule:

`เลขา เปิดโปรเจกต์ ตรวจทุกไฟล์ก่อนทำงาน`

Before customer release:

`เลขา ตรวจ Standard ก่อนขึ้น GitHub`
