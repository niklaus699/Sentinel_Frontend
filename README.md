# 🛡️ Project: Aetheris Sentinel
## Enterprise-Grade Vulnerability Management & Threat Intelligence

**Aetheris Sentinel** is a high-performance security orchestration platform designed to solve the "Data-to-Action" gap in modern DevSecOps. Rather than a simple CRUD application, Sentinel is a distributed system engineered for high-throughput data ingestion, strict multi-tenant isolation, and real-time risk observability.

---

## 🏗️ Architecture Overview

The system utilizes a distributed cloud topology to ensure scalability and high availability:
* **Backend & Workers:** Python/Django hosted on **Railway**, handling heavy lifting for ingestion and risk calculations.
* **Frontend:** React/Next.js hosted on **Vercel**, optimized for low-latency dashboarding and complex data visualization.
* **Data & State:** **Supabase** (PostgreSQL) for relational integrity and **Upstash** (Redis) for high-speed task queuing and caching.

---

## 🛠️ Engineering Deep-Dive: Senior-Level Features

### 1. Multi-tenant RBAC with PostgreSQL Row-Level Security (RLS)
Isolation is enforced at the database layer, not just the application logic. A custom Django middleware injects the tenant ID into the session context:
`SET app.current_tenant = '{id}'`
Postgres RLS policies then automatically filter every query.
* **Business Problem Solved:** Prevents catastrophic data leakage between customers, ensuring that a developer mistake in the frontend or API cannot expose one tenant's vulnerabilities to another.

### 2. Async Vulnerability Ingestion Pipeline (Celery + Redis)
A Celery Beat scheduler pulls from NVD, OSV.dev, and GitHub Advisory feeds. Each finding passes through an enrichment chain: 
* **CVSS Normalization** → **Affected Package Matching** → **Asset Correlation** → **Severity Recalculation** (based on specific exposure).
Results are published via **Django Channels** for instant WebSocket updates.
* **Business Problem Solved:** Security teams require threat intel in minutes. This pipeline removes the need for manual refreshes or overnight batch processing.

### 3. Risk Score Trending & Anomaly Detection
Each asset accumulates a time-series risk score stored in a **Postgres Materialized View**. A lightweight statistical model (rolling 14-day Z-score implemented in NumPy) flags anomalous spikes in risk density.
* **Business Problem Solved:** Static dashboards only show the *now*. Trending allows leadership to observe whether the security posture is improving or degrading over time, enabling data-driven resource allocation.

### 4. Automated PDF Compliance Reports (Celery + WeasyPrint)
Triggered via API or schedule, Celery tasks render Django templates into professional, audit-ready PDFs. Reports include vulnerability summaries and SVG risk charts, signed with a timestamp hash and served via S3 pre-signed URLs.
* **Business Problem Solved:** Automates the grueling 2-hour manual process of preparing documentation for auditors (SOC2/ISO 27001) into a background task.

---

## 🌟 The "Wow Factor": Real-Time Attack Surface Map
Sentinel features a **D3-powered force graph** that visualizes monitored assets as nodes. 
* **Real-Time Interactivity:** As WebSocket events arrive, nodes pulse and recolor based on risk severity.
* **Contextual Edges:** Network connectivity is mapped to show potential lateral movement paths.
* **Impact:** This transforms the project from a standard management tool into a living Security Operations Center (SOC) map, proving mastery of complex data visualization and real-time state management.

---

## 💻 Tech Stack Summary

| Layer | Technologies |
| :--- | :--- |
| **Language & Framework** | Python (Django), JavaScript (React/Next.js) |
| **Data Persistence** | PostgreSQL (Supabase), Materialized Views, RLS |
| **Async Processing** | Celery, Redis, Celery Beat |
| **Real-time** | WebSockets (Django Channels) |
| **Visualization** | Recharts, D3.js |
| **DevOps/Cloud** | Railway, Vercel, Upstash, S3 |
