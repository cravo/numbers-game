# Numbers Game

[![CI](https://github.com/cravo/numbers-game/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/cravo/numbers-game/actions/workflows/ci.yml?query=branch%3Amain)

Simple Flask app served with Gunicorn and containerized with Docker Compose.

## Features

- Production WSGI server with Gunicorn
- Docker Compose service with healthcheck
- Resource and log safety limits
- CI workflow that builds, waits for healthy status, and runs a smoke test

## Quick Start

### Requirements

- Docker Desktop (or Docker Engine + Compose)

### Run

```bash
docker compose up -d --build
```

Open:

- http://localhost:3210

### Check Status

```bash
docker compose ps
docker inspect --format "{{.State.Health.Status}}" numbers-game-server
```

### View Logs

```bash
docker compose logs -f --tail 200
```

### Stop

```bash
docker compose down
```

## Configuration

Compose reads values from .env.

Current variables:

- HOST_PORT: host port exposed on localhost (default 3210)
- HOST: app bind host inside container (default 0.0.0.0)
- PORT: app port inside container (default 5000)
- GUNICORN_WORKERS: number of Gunicorn workers (default 2)
- FLASK_DEBUG: used only when running server.py directly (default false)

## CI

GitHub Actions workflow file:

- .github/workflows/ci.yml

It performs:

1. docker compose up -d --build
2. Wait for container healthcheck to become healthy
3. Smoke test against http://localhost:3210
4. Print logs on failure
5. Always clean up containers

If the badge does not render immediately, push this commit and wait for the first CI run to complete.
