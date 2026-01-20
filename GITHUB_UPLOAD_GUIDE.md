# GitHub Upload Guide - GPA Calculator

Complete step-by-step guide to upload your project to GitHub.

---

## Step 1: Create GitHub Account (if needed)

1. Go to [github.com](https://github.com)
2. Click "Sign up"
3. Enter email, create password, choose username
4. Verify email
5. Done!

---

## Step 2: Create a New Repository on GitHub

1. Log in to GitHub
2. Click **+** icon (top right) → **New repository**
3. Fill in:
   - **Repository name**: `GPA-Calculator`
   - **Description**: `A modern GPA calculator web app built with React and Vite`
   - **Public** or **Private** (choose what you prefer)
   - ⚠️ **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**

You'll see a page with setup instructions.

---

## Step 3: Configure Git on Your Computer (First Time Only)

Open PowerShell and run:

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Replace with your actual name and email.

---

## Step 4: Push Your Project to GitHub

In PowerShell, go to your project folder:

```powershell
cd "d:\React Projects\GPA-Calculator"
```

Then run these commands (one at a time):

```powershell
# Change main branch name
git branch -M main

# Add GitHub repository as remote origin
git remote add origin https://github.com/YOUR_USERNAME/GPA-Calculator.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

---

## Step 5: Verify Upload ✅

Go to your GitHub repository URL:
```
https://github.com/YOUR_USERNAME/GPA-Calculator
```

You should see:
- ✅ All your files uploaded
- ✅ README.md displayed
- ✅ Commits showing
- ✅ Code visible

---

## Example (Step-by-Step in Terminal)

```powershell
# 1. Configure git (first time only)
git config --global user.name "John Doe"
git config --global user.email "john@example.com"

# 2. Navigate to project
cd "d:\React Projects\GPA-Calculator"

# 3. Set branch name
git branch -M main

# 4. Add GitHub remote
git remote add origin https://github.com/johndoe/GPA-Calculator.git

# 5. Push to GitHub
git push -u origin main

# Done! 🎉
```

---

## Troubleshooting

### Error: "fatal: remote origin already exists"
```powershell
# Remove the old remote first
git remote remove origin

# Then add the new one
git remote add origin https://github.com/YOUR_USERNAME/GPA-Calculator.git
git push -u origin main
```

### Error: "Permission denied (publickey)"
You need to set up SSH keys:

**Option A: Use HTTPS (Easier)**
```powershell
# Use personal access token instead
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/GPA-Calculator.git
```

**Option B: Setup SSH Keys**
1. Generate SSH key (follow GitHub guide: https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
2. Add to GitHub account settings
3. Use SSH URL: `git@github.com:YOUR_USERNAME/GPA-Calculator.git`

### Error: "updates were rejected because the remote contains work"
```powershell
# Pull the remote changes first
git pull origin main

# Then push
git push -u origin main
```

---

## After Upload: Making Updates

Whenever you make changes:

```powershell
# Stage changes
git add .

# Commit with message
git commit -m "Your change description"

# Push to GitHub
git push
```

---

## Useful Git Commands

```powershell
# Check status
git status

# See commit history
git log --oneline

# See which remote is configured
git remote -v

# Change remote URL
git remote set-url origin https://github.com/YOUR_USERNAME/GPA-Calculator.git
```

---

## What Gets Uploaded?

✅ All source code  
✅ Configuration files  
✅ Documentation (README, etc.)  
✅ package.json & package-lock.json  

❌ `node_modules/` (ignored by .gitignore)  
❌ `dist/` (can be rebuilt)  
❌ `.git/` folder (Git metadata)  

---

## Next Steps

1. ✅ Create GitHub account
2. ✅ Create repository
3. ✅ Configure git user
4. ✅ Push project
5. 🔗 Share your GitHub URL with others
6. 🚀 Deploy from GitHub to Vercel/Netlify

---

## Share Your Repository

Once uploaded, share the link:
```
https://github.com/YOUR_USERNAME/GPA-Calculator
```

People can:
- View your code
- Clone it
- Leave issues/suggestions
- Fork and contribute

---

## Need Help?

- **GitHub Docs**: https://docs.github.com
- **Git Basics**: https://git-scm.com/book/en/v2
- **GitHub Desktop** (GUI alternative): https://desktop.github.com

---

**That's it! Your project is now on GitHub! 🎉**
