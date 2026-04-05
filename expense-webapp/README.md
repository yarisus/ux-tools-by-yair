# Dinaria

## Overview
Dinaria is a personal finance web app focused on helping users track income, expenses, and monthly balance with a mobile-first experience.

## Architecture
- App location: [expense-webapp](/C:/Users/Yair-/ai-lab/expense-webapp)
- Funnel location: [expense-webapp/funnel-deploy](/C:/Users/Yair-/ai-lab/expense-webapp/funnel-deploy)

## Deployments
- Funnel: [https://dinaria-go.vercel.app](https://dinaria-go.vercel.app)
- App: [https://dinariafinanzas.vercel.app](https://dinariafinanzas.vercel.app)

## Routing Flow
- `/` -> `/entry.html`
- `/entry.html` detects device type
- Mobile -> `/landing.html`
- Desktop -> `/desktop.html`
- `/demo.html` is a separate preview page

## Important Rules
- Funnel source of truth is only [expense-webapp/funnel-deploy](/C:/Users/Yair-/ai-lab/expense-webapp/funnel-deploy)
- Do not edit archived files under [archive](/C:/Users/Yair-/ai-lab/archive)
- Do not confuse [expense-webapp/funnel-deploy/vercel.json](/C:/Users/Yair-/ai-lab/expense-webapp/funnel-deploy/vercel.json) with [expense-webapp/vercel.json](/C:/Users/Yair-/ai-lab/expense-webapp/vercel.json)
- Do not mix funnel files with app files

## Folder Structure
```text
expense-webapp/
|-- funnel-deploy/        # Funnel source of truth and deploy bundle
|-- index.html            # Real app entry
|-- app.js                # Real app logic
|-- manifest.webmanifest  # Real app manifest
|-- sw.js                 # Real app service worker
|-- assets/               # Shared assets
|-- design-system/        # Shared tokens and app styles
`-- vercel.json           # App deploy config

archive/
|-- dinariafinanzas-deploy/
`-- root-funnel-duplicates/
```

## Dev Workflow
- To edit the funnel, work only inside [expense-webapp/funnel-deploy](/C:/Users/Yair-/ai-lab/expense-webapp/funnel-deploy)
- To edit the real app, work in the root app files inside [expense-webapp](/C:/Users/Yair-/ai-lab/expense-webapp)

## Development Guardrails
- Funnel source of truth is only [expense-webapp/funnel-deploy](/C:/Users/Yair-/ai-lab/expense-webapp/funnel-deploy)
- Do not edit files under [archive](/C:/Users/Yair-/ai-lab/archive)
- Do not edit root duplicate funnel files if they reappear
- Do not change the wrong `vercel.json` by mistake
- App source of truth is [expense-webapp](/C:/Users/Yair-/ai-lab/expense-webapp)
- Before pushing funnel changes, validate `/`, `/entry.html`, `/landing.html`, `/desktop.html`, and `/demo.html`
- If changing routing, preserve `/` -> `entry.html`, mobile -> `landing.html`, and desktop -> `desktop.html`
