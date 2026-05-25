# 🚀 LLM API — FastAPI + DistilGPT2 on Kubernetes (K3s)

A lightweight LLM inference API built with **FastAPI** and **HuggingFace DistilGPT2**, containerized with **Docker** and deployed on **K3s** (via K3d) for local Kubernetes development.

## 📁 Project Structure

```
vllm-k8s/
├── api/
│   ├── __init__.py
│   └── routes.py          # API endpoints (/generate)
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI entrypoint + /health endpoint
│   └── model.py           # DistilGPT2 text generation pipeline
├── docker/
│   └── Dockerfile         # Multi-stage build with pre-baked model
├── k8s/
│   ├── deployment.yaml    # K8s Deployment with health probes
│   └── service.yaml       # NodePort Service (port 30007)
├── requirements.txt       # Pinned Python dependencies (CPU-only PyTorch)
├── .dockerignore
├── .gitignore
├── LICENSE
└── README.md
```

## ✨ Features

- **Text Generation** — Generate text using DistilGPT2 via a simple REST API
- **Health Checks** — Built-in `/health` endpoint for Kubernetes readiness/liveness probes
- **Optimized Docker Image** — CPU-only PyTorch (~200MB vs ~800MB), model pre-downloaded during build
- **Kubernetes Ready** — Resource limits, health probes, and NodePort service configured
- **K3s via K3d** — Lightweight Kubernetes running inside Docker containers

## 🛠️ Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v20+)
- [K3d](https://k3d.io/) (v5.x) — K3s in Docker
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

### Install K3d

**Windows (Chocolatey):**
```powershell
choco install k3d -y
```

**Windows (Direct Download):**
```powershell
Invoke-WebRequest -Uri "https://github.com/k3d-io/k3d/releases/latest/download/k3d-windows-amd64.exe" -OutFile "$env:USERPROFILE\bin\k3d.exe"
```

**macOS / Linux:**
```bash
curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
```

## 🚀 Quick Start

### 1. Create K3d Cluster

```bash
k3d cluster create llm-cluster --port "30007:30007@server:0"
```

### 2. Build Docker Image

```bash
docker build -f docker/Dockerfile -t llm-api:latest .
```

### 3. Import Image into K3d

```bash
k3d image import llm-api:latest -c llm-cluster
```

### 4. Deploy to Kubernetes

```bash
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

### 5. Verify Deployment

```bash
# Check pod status
kubectl get pods -l app=llm

# Wait for rollout
kubectl rollout status deployment/llm-app
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — returns `{"status": "ok"}` |
| `GET` | `/generate?prompt=<text>` | Generate text from a prompt |
| `GET` | `/docs` | Swagger UI (auto-generated) |

### Example Usage

**Health Check:**
```bash
curl http://localhost:30007/health
# {"status":"ok"}
```

**Text Generation:**
```bash
curl "http://localhost:30007/generate?prompt=Once%20upon%20a%20time"
# {"response":"Once upon a time, the world was a place of great beauty..."}
```

## 🔧 Development

### Rebuild & Redeploy After Code Changes

```bash
docker build -f docker/Dockerfile -t llm-api:latest .
k3d image import llm-api:latest -c llm-cluster
kubectl rollout restart deployment/llm-app
```

### View Pod Logs

```bash
kubectl logs -l app=llm --tail=50 -f
```

### Delete Cluster

```bash
k3d cluster delete llm-cluster
```

## ⚙️ Configuration

### Deployment (`k8s/deployment.yaml`)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `replicas` | `1` | Number of pod replicas |
| `resources.requests.memory` | `512Mi` | Minimum memory per pod |
| `resources.limits.memory` | `2Gi` | Maximum memory per pod |
| `resources.requests.cpu` | `250m` | Minimum CPU per pod |
| `resources.limits.cpu` | `1000m` | Maximum CPU per pod |

### Service (`k8s/service.yaml`)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `type` | `NodePort` | Service type |
| `nodePort` | `30007` | External port |
| `targetPort` | `8000` | Container port |

## 🧰 Tech Stack

| Component | Technology |
|-----------|------------|
| **API Framework** | FastAPI |
| **LLM Model** | DistilGPT2 (HuggingFace) |
| **ML Framework** | PyTorch (CPU) |
| **Containerization** | Docker |
| **Orchestration** | K3s (via K3d) |
| **Language** | Python 3.10 |

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
