# Deploy Skillshop to Render

## 1. Push to GitHub

From the `skillshop` folder:

```powershell
git init
git add .
git commit -m "Initial Skillshop full-stack release"
```

Create an empty repository on GitHub (do NOT initialize with README), then:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/skillshop.git
git branch -M main
git push -u origin main
```

## 2. Create Render resources

1. Log in to [Render](https://render.com).
2. **Create a PostgreSQL database:**
   - New → PostgreSQL
   - Name: `skillshop-db`
   - Plan: Free
   - Region: Oregon (or closest to you)
   - Copy the **Internal Database URL** (not the public one).

3. **Create a Web Service:**
   - New → Web Service → Connect your GitHub repo `skillshop`
   - Runtime: Node
   - Build command: `npm install`
   - Start command: `npm start`
   - Plan: Free

## 3. Set environment variables

In the Render Web Service **Environment** tab, add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `SESSION_SECRET` | A long random string (Generate → Secret Key) |
| `BASE_URL` | `https://skillshop.onrender.com` (your Render URL) |
| `DATABASE_URL` | The **Internal Database URL** from step 2 |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | `https://skillshop.onrender.com/auth/google/callback` |

## 4. Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create OAuth 2.0 Client ID → Web application.
3. Add authorized redirect URI: `https://skillshop.onrender.com/auth/google/callback`
4. Copy Client ID and Client Secret into Render env vars.

## 5. Seed the database

Open the Render Web Service shell (or run locally with your `DATABASE_URL`):

```powershell
# Create tables
psql $DATABASE_URL -f db/schema.sql

# Import all 58 courses
npm run seed
```

## 6. Visit your site

Open `https://skillshop.onrender.com`. Sign up with email or Google, explore courses, earn badges, and print certificates.

## Local development

```powershell
cp .env.example .env
# fill in .env with a local PostgreSQL URL
npm install
psql $DATABASE_URL -f db/schema.sql
npm run seed
npm start
# open http://localhost:3000
```

## What changed from v1

- Real user accounts: email/password + Google OAuth
- PostgreSQL database for users, progress, and certificates
- Sessions stored in the database (connect-pg-simple)
- API-first frontend with localStorage fallback for offline preview
- SEO: meta tags, Open Graph, Twitter cards, canonical URLs, JSON-LD, sitemap.xml, robots.txt
- 58 courses (8 hand-crafted + 50 generated), each with 15 lessons and 12 quiz questions
- Fixed certificate template issued per user and stored in the database
