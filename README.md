# Ai Iq Menjačnica

AI-powered currency exchange and trading platform — static website deployed on Vercel.

---

## 🚀 Deploying to Vercel (one-time setup, ~5 minutes)

### Option A — Vercel Dashboard (simplest, recommended)

1. Go to **[vercel.com/new](https://vercel.com/new)** and sign in.
2. Click **"Import Git Repository"** and select `spaja86/Ai-Iq-Menja-nica`.
3. In the project settings:
   - **Framework Preset**: `Other`
   - **Root Directory**: *(leave empty — `/`)*
   - **Build Command**: *(leave empty)*
   - **Output Directory**: `public`
4. Click **Deploy**. 🎉

Vercel will automatically redeploy every time you push to `main`.

---

### Option B — GitHub Actions (CI/CD workflow already included)

The file `.github/workflows/deploy.yml` is already set up.  
You only need to add **3 secrets** to the GitHub repository.

#### Step 1 — Get your Vercel Token

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens).
2. Click **"Create"**, name it (e.g. `github-actions`), and copy the token.

#### Step 2 — Get your Vercel Org ID and Project ID

1. Install Vercel CLI locally: `npm i -g vercel`
2. Run `vercel login` and log in.
3. Inside this project directory, run `vercel link` and follow the prompts.
4. Open the generated `.vercel/project.json` — it contains:
   ```json
   {
     "orgId": "YOUR_ORG_ID",
     "projectId": "YOUR_PROJECT_ID"
   }
   ```

#### Step 3 — Add secrets to GitHub

Go to your repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**, and add:

| Secret name          | Value                          |
|----------------------|--------------------------------|
| `VERCEL_TOKEN`       | Token from Step 1              |
| `VERCEL_ORG_ID`      | `orgId` from Step 2            |
| `VERCEL_PROJECT_ID`  | `projectId` from Step 2        |

#### Step 4 — Push to main

The workflow runs automatically on every push to `main` (production deploy) and on every pull request (preview deploy).

---

## 🗂️ Project structure

```
public/
├── index.html          # Home page
├── about.html          # About Us
├── services.html       # Services
├── contact.html        # Contact (with form)
├── favicon.svg         # Site icon
├── css/
│   └── styles.css      # Global design system
└── js/
    └── main.js         # Mobile nav + form validation
vercel.json             # Vercel configuration
.vercelignore           # Files excluded from deployment
.github/
└── workflows/
    └── deploy.yml      # Automatic deployment pipeline
```

---

## 📬 Contact

- [spajicn@yahoo.com](mailto:spajicn@yahoo.com)
- [spajicn@gmail.com](mailto:spajicn@gmail.com)
