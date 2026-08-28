# Sentra Deployment Guide

This guide deploys the FastAPI backend to Render and the Next.js dashboard to
Vercel. GitHub Actions validates both applications before production changes
are deployed.

## 1. Push the deployment files

Commit the workflow, Dockerfiles, deployment configuration, and application
changes, then push them to the `main` branch:

```powershell
git add .github/workflows/ci-cd.yml Dockerfile.backend Dockerfile.frontend .dockerignore DEPLOYMENT.md README.md .env.example backend/app/main.py backend/app/db/database.py
git commit -m "add GitHub CI/CD and deployment configuration"
git push origin main
```

Open the repository's **Actions** tab and wait for both checks to pass:

- `Backend checks`
- `Frontend checks`

The same workflow publishes `backend` and `frontend` images under the
repository's **Packages** section. The Render and Vercel setup below builds from
the Git repository, so those images also serve as portable release artifacts.

## 2. Deploy the backend on Render

1. Sign in to Render and select **New > Web Service**.
2. Connect GitHub and select the `AegisPay` repository.
3. Use these settings:

   | Setting | Value |
   | --- | --- |
   | Name | `sentra-api` |
   | Branch | `main` |
   | Language | `Docker` |
   | Dockerfile path | `./Dockerfile.backend` |
   | Health check path | `/` |
   | Auto-deploy | `After CI Checks Pass` |

4. Add these environment variables under **Advanced**:

   | Variable | Value |
   | --- | --- |
   | `OPENROUTER_API_KEY` | Your OpenRouter API key |
   | `OPENROUTER_MODEL` | `nvidia/nemotron-3-super-120b-a12b:free` or another supported model |
   | `SENTRA_LOCAL_FALLBACK` | `true` |
   | `SENTRA_DB_PATH` | `/app/data/sentra.sqlite` |
   | `SENTRA_CORS_ORIGINS` | Temporarily use `http://localhost:3000`; replace it after the Vercel deployment |

5. If simulation history must survive restarts and deployments, attach a
   persistent disk with mount path `/app/data`. Without a disk, the application
   still works, but SQLite data is reset when the Render instance is replaced.
6. Create the service and wait for deployment to finish.
7. Copy the backend URL, for example `https://sentra-api.onrender.com`.

Verify the backend:

```text
https://sentra-api.onrender.com/
https://sentra-api.onrender.com/docs
```

The first URL should return `{"message":"Sentra backend is running"}`.

## 3. Deploy the frontend on Vercel

1. Sign in to Vercel and select **Add New > Project**.
2. Import the same `AegisPay` GitHub repository.
3. Set **Root Directory** to `frontend`.
4. Vercel should detect **Next.js** automatically. Keep the standard install and
   build commands from `frontend/package.json`.
5. Add this environment variable for Production, Preview, and Development:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SENTRA_API` | The Render backend URL without a trailing slash |

6. Select **Deploy** and copy the production URL, for example
   `https://sentra-dashboard.vercel.app`.

## 4. Allow the production frontend in CORS

Return to the Render backend's environment variables and replace
`SENTRA_CORS_ORIGINS` with the exact Vercel production URL:

```text
https://sentra-dashboard.vercel.app
```

For multiple domains, use a comma-separated list without paths:

```text
https://sentra-dashboard.vercel.app,https://sentra.example.com
```

Save the setting and redeploy the backend.

## 5. Verify the complete production flow

1. Open the Vercel dashboard URL.
2. Select **Generate Customers**.
3. Launch an attack with a small volume such as `10`.
4. Confirm the orchestration section shows either **Live LLM response** or
   **Deterministic fallback response**.
5. Confirm transactions and Blue Team cases appear.
6. Open the browser developer console only if the dashboard reports that the
   backend is unreachable. A CORS error usually means the deployed Vercel URL
   does not exactly match `SENTRA_CORS_ORIGINS`.

## 6. Normal release process

For everyday deployments:

1. Create a feature branch and open a pull request to `main`.
2. Wait for GitHub's backend and frontend checks.
3. Merge the pull request.
4. Render deploys the backend after the checks pass, and Vercel deploys the
   frontend from `main`.

To publish a named container release, create a version tag:

```powershell
git tag v1.0.0
git push origin v1.0.0
```

## Production notes

- Never commit `.env` or an actual OpenRouter API key.
- SQLite with a persistent disk supports only a single backend instance. Move
  to PostgreSQL before scaling the API horizontally.
- A Render persistent disk can introduce brief downtime during deployments.
- Set `SENTRA_LOCAL_FALLBACK=false` only when an LLM failure should stop a run
  instead of falling back to deterministic scenario generation.
