# Agente Local UX Writing (es)

Agente local para auditar y proponer mejoras de UX Writing en espanol sobre tus proyectos.

## Archivos

- `ux-writing-prompt.md`: rol, criterios y formato de salida.
- `run-ux-writing-agent.ps1`: ejecutable local.
- `reports/`: carpeta de reportes generados.

## Uso rapido (PowerShell)

```powershell
cd C:\Users\Yair-\ai-lab\local-agents\ux-writing-es
.\run-ux-writing-agent.ps1
```

## Analizar otra carpeta

```powershell
.\run-ux-writing-agent.ps1 -TargetPath C:\Users\Yair-\ai-lab\partner-next-page
```

## Abrir reporte al terminar

```powershell
.\run-ux-writing-agent.ps1 -OpenReport
```

## Ver logs completos del analisis

```powershell
.\run-ux-writing-agent.ps1 -VerboseOutput
```

## Nota

Requiere `codex` disponible en PATH y sesion iniciada en Codex CLI.
