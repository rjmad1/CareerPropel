# Deployment Flow

This document details the multi-runtime deployment topology of the CareerPropel modular monolith codebase.

---

## Build and Deployment Target Routing

```mermaid
graph TD
    Repo[(GitHub Repository)] -->|Merge to main| CI[GitHub Actions: CI/CD Quality Plane]
    CI -->|Lint, AST, Semgrep, depcruise, madge, tests| Docker[Build Unified Docker Image]
    
    Docker -->|Deploy Web| Web[Web Cluster: AWS ECS Fargate / Vercel]
    Docker -->|Deploy Workers| Worker[Worker Cluster: ECS Fargate Worker Task]
    Docker -->|Deploy Scheduler| Scheduler[Scheduler: Single ECS Task]
    
    Web -->|Listen port 3000| ALB[Application Load Balancer]
```

---

## Production Entrypoint Scripts

- **Web Container Runtime Command**:
  ```bash
  npm run start:web
  ```
- **Worker Container Runtime Command**:
  ```bash
  npm run start:worker
  ```
- **Scheduler Container Runtime Command**:
  ```bash
  npm run start:scheduler
  ```
