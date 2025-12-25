# 🚀 CI/CD Pipelines & Automation

## 📋 Available Workflows

### 1. 🔄 CI/CD Pipeline (`ci-cd.yml`)

**Triggers:** Push & PR to `portfolio` branch

- ✅ Code quality checks (ESLint, TypeScript, Prettier)
- 🏗️ Build verification
- 🛡️ Security & performance audit
- ✅ Deployment readiness check

### 2. 📦 Auto Update Dependencies (`auto-update-deps.yml`)

**Triggers:** Weekly (Mondays 9 AM UTC) + Manual

- 🔄 Updates npm packages automatically
- 🧪 Tests build after updates
- 📝 Creates PR with changes
- 🏷️ Auto-labels as `dependencies`

### 3. 🎨 Code Formatter (`auto-format.yml`)

**Triggers:** Push to `portfolio` branch + Manual

- 💅 Runs Prettier on all files
- 🔧 Auto-fixes ESLint issues
- 📤 Commits formatting changes automatically

### 4. 📊 Performance Monitor (`performance.yml`)

**Triggers:** Pull requests + Manual

- 🔦 Lighthouse CI scores
- 📦 Bundle size analysis
- 📈 Performance metrics
- 📊 Build size reports

### 5. 🏷️ Auto Label PRs (`auto-label.yml`)

**Triggers:** PR opened/updated

- 🎯 Labels by file paths (components, styles, etc.)
- 📏 Labels by PR size (xs, s, m, l, xl)
- 🤖 Automatic categorization

### 6. 👋 PR Welcome (`pr-welcome.yml`)

**Triggers:** New PRs

- 💬 Welcome message for contributors
- 📝 Checklist for reviews
- 💡 Helpful tips

## 🎯 Quick Start

### Manual Triggers

You can manually trigger workflows from GitHub Actions tab:

1. Go to **Actions** tab
2. Select a workflow
3. Click **Run workflow**
4. Choose `portfolio` branch

### Workflow Badges

Add these to your README.md:

```markdown
![CI/CD](https://github.com/fal3n-4ngel/fal3n-4ngel/actions/workflows/ci-cd.yml/badge.svg?branch=portfolio)
![Auto Update](https://github.com/fal3n-4ngel/fal3n-4ngel/actions/workflows/auto-update-deps.yml/badge.svg)
![Format](https://github.com/fal3n-4ngel/fal3n-4ngel/actions/workflows/auto-format.yml/badge.svg)
```

## 📊 What Gets Automated?

### On Every Push:

- ✅ Linting & type checking
- 🔨 Build verification
- 🎨 Code formatting
- 🛡️ Security audit

### Weekly (Mondays):

- 📦 Dependency updates
- 🔄 Automated PR creation

### On PRs:

- 🏷️ Auto-labeling
- 👋 Welcome messages
- 📊 Performance analysis
- 🔦 Lighthouse scores

## 🎨 Labels Created

- `components` - Component changes
- `ui` - UI component updates
- `styles` - CSS/styling changes
- `typescript` - TypeScript files
- `dependencies` - Package updates
- `size/xs` to `size/xl` - PR size indicators

## 🔧 Configuration Files

- `.github/workflows/` - All workflow definitions
- `.github/labeler.yml` - Auto-labeling rules

## 💡 Tips

1. **Enable GitHub Actions** in your repository settings
2. **Branch protection** rules work great with these workflows
3. **Status checks** can be made required for PRs
4. All workflows respect the `portfolio` branch only

---

🤖 **Note:** These workflows only affect the `portfolio` branch and won't touch `main`!
