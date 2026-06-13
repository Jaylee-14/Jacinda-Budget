# Jacinda's Budget Tracker

A personal fortnightly budget tracker built with React.

## Files in this project

```
jacinda-budget/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx       ← your budget app
│   └── index.js
├── package.json
└── README.md
```

## How to deploy to GitHub Pages

### Step 1 — Create a GitHub repository
1. Go to github.com and sign in
2. Click the **+** button → **New repository**
3. Name it `jacinda-budget`
4. Set it to **Private**
5. Click **Create repository**

### Step 2 — Upload your files
1. In your new repository, click **uploading an existing file**
2. Drag and drop ALL files from this folder (keep the folder structure)
3. Click **Commit changes**

### Step 3 — Turn on GitHub Pages
1. Go to your repository **Settings**
2. Click **Pages** in the left menu
3. Under **Source**, select **GitHub Actions**
4. Choose the **Static HTML** workflow or the **React** workflow

### Step 4 — Add the deploy workflow
Create a file at `.github/workflows/deploy.yml` with the contents from the deploy.yml file included in this project.

### Your app will be live at:
`https://YOUR-GITHUB-USERNAME.github.io/jacinda-budget`

## To update the app
Just edit `src/App.jsx` directly in GitHub and commit — it will redeploy automatically.
