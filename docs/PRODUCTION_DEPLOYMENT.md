> TODO: Merge it inside Readme.md

# 🚀 ChatNotes Production Deployment Guide

Complete guide for deploying ChatNotes to production using GitHub Actions CI/CD.

## 📋 Overview

This deployment uses:

- **GitHub Actions** for automated CI/CD
- **Vercel** for hosting and serverless functions
- **Supabase** for database and authentication
- **OpenAI** for AI-powered features

## ✅ Pre-Deployment Requirements

### 📋 Accounts & Services

- [ ] **GitHub Repository** - Code pushed to main branch
- [x] **Supabase Account** - Create production project
- [x] **OpenAI Account** - Obtain API key with GPT-4o access
- [x] **Vercel Account** - Connected to GitHub repository
- [ ] **Domain Name** - Optional but recommended

### 🔑 API Keys & Credentials

- [x] **Supabase URL** - Production project URL
- [x] **Supabase Service Role Key** - Full database access
- [x] **Supabase Anon Key** - Public frontend access
- [x] **OpenAI API Key** - GPT-4o enabled key
- [x] **Vercel Token** - For GitHub Actions deployment

---

## 🗄️ Step 1: Database Setup

### 1.1 Create Production Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization
4. Set project name: `chat-notes-production`
5. Generate a strong database password
6. Select region closest to your users
7. Click "Create new project"

### 1.2 Get Database Credentials

After project initialization:

1. Go to **Settings → API**
2. Copy these values:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 Database Migration (Automated)

Database migrations are automatically deployed by the GitHub Actions workflow. You don't need to manually apply migrations - they will be deployed automatically when you push to the main branch.

Expected tables after deployment: `categories`, `notes`, `task_completions`, `llm_costs`

---

## 🤖 Step 2: OpenAI Setup

### 2.1 Get Production API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Navigate to **API Keys**
3. Click "Create new secret key"
4. Name it: `ChatNotes Production`
5. Copy the key (starts with `sk-`)

### 2.2 Set Usage Limits (Recommended)

1. Go to **Settings → Limits**
2. Set monthly usage limit (e.g., $50)
3. Enable email notifications at 80% usage

---

## ⚙️ Step 3: GitHub Actions Setup

### 3.1 Get Vercel Credentials

```bash
# Install Vercel CLI
npm install -g vercel

# Login and link project
vercel login
vercel link

# Get project information
cat .vercel/project.json
```

Note down:

- `projectId` → `VERCEL_PROJECT_ID`
- `orgId` → `VERCEL_ORG_ID`

### 3.2 Generate Vercel Token

1. Go to [Vercel Settings](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it: `GitHub Actions`
4. Copy the token → `VERCEL_TOKEN`

### 3.3 Configure GitHub Secrets

Go to your repository **Settings → Secrets and variables → Actions**

Add these secrets:

```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_ORG_ID=your_org_id_here
VERCEL_PROJECT_ID=your_project_id_here
SUPABASE_ACCESS_TOKEN=your_supabase_access_token_here
SUPABASE_PROJECT_REF=your_supabase_project_ref_here
SUPABASE_DB_PASSWORD=your_database_password_here
CODECOV_TOKEN=your_codecov_token_here (optional)
```

**To get Supabase credentials:**

1. **Access Token**: Go to [Supabase Account](https://app.supabase.com/account/tokens) → Generate new token
2. **Project Ref**: Go to Project Settings → General → Reference ID (e.g., `abcdefghijklmnop`)
3. **Database Password**: The password you set when creating the Supabase project

### 3.4 Configure Vercel Environment Variables

In your Vercel project dashboard **Settings → Environment Variables**:

**Production Environment:**

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_KEY=sk-your_openai_api_key
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
NODE_ENV=production
```

**Important**: Set all variables for **Production**, **Preview**, and **Development** environments.

---

## 🚀 Step 4: Automated Deployment

### 4.1 GitHub Actions Workflows

The repository includes two workflows:

**CI Workflow** (`.github/workflows/ci.yml`):

- Runs on every push and pull request
- Performs linting, testing, building
- Runs accessibility and E2E tests
- Uploads coverage reports

**Deploy Workflow** (`.github/workflows/deploy.yml`):

- Runs on push to main branch
- Performs quality checks
- Deploys database migrations to Supabase
- Deploys to Vercel production
- Runs health checks and API tests
- Performs Lighthouse performance audits

### 4.2 Trigger Deployment

```bash
# Push to main branch to trigger deployment
git push origin main

# Or manually trigger via GitHub UI
# Go to Actions → Deploy → Run workflow
```

### 4.3 Monitor Deployment

1. **GitHub Actions**: Monitor workflow progress in Actions tab
2. **Vercel Dashboard**: View deployment logs and status
3. **Health Check**: Verify `/api/health` endpoint responds correctly

---

## 🔍 Step 5: Verify Deployment

### 5.1 Automated Checks

The GitHub Actions workflow automatically:

- ✅ Runs quality checks (lint, test, build)
- ✅ Deploys database migrations to Supabase
- ✅ Deploys to Vercel
- ✅ Performs health check
- ✅ Tests API endpoints
- ✅ Runs Lighthouse performance audit

### 5.2 Manual Verification

Visit your deployment URL and test:

**Health Check:**

```
https://your-app.vercel.app/api/health
```

Expected response:

```json
{
  "status": "healthy",
  "timestamp": "2024-12-25T10:00:00.000Z",
  "version": "abc123",
  "services": {
    "database": "healthy",
    "openai": "healthy"
  },
  "uptime": 45
}
```

**Core Functionality:**

- [ ] **Note Creation** - Create a test note
- [ ] **AI Classification** - Verify auto-categorization works
- [ ] **Due Date Extraction** - Test with "Buy groceries tomorrow"
- [ ] **Search Functionality** - Search for created notes
- [ ] **Type Changes** - Change note category
- [ ] **Cost Tracking** - Check `/api/llm-costs` endpoint
- [ ] **Mobile Responsive** - Test on mobile device

### 5.3 Performance Verification

The deployment workflow automatically runs Lighthouse audits.

Target scores:

- Performance: > 90
- Accessibility: > 95
- Best Practices: > 90
- SEO: > 90

---

## 🌐 Step 6: Custom Domain (Optional)

### 6.1 Add Domain in Vercel

1. Go to Project → Settings → Domains
2. Add your domain (e.g., `chatnotes.your-domain.com`)
3. Follow DNS configuration instructions

### 6.2 Configure DNS

**For subdomain (recommended):**

```
Type: CNAME
Name: chatnotes
Value: your-project.vercel.app
```

**For apex domain:**

```
Type: A
Name: @
Value: 76.76.19.61
```

Wait 5-10 minutes and verify HTTPS works correctly.

---

## 📊 Step 7: Monitoring Setup

### 7.1 Built-in Monitoring

GitHub Actions provides:

- Deployment status notifications
- Health check monitoring
- Performance audit reports
- Error detection and reporting

### 7.2 Additional Monitoring (Recommended)

**Uptime Monitoring:**

- **Uptime Robot** (free): Monitor `/api/health`
- **Pingdom**: Advanced monitoring
- **StatusCake**: Alternative option

**Cost Monitoring:**

1. **OpenAI Usage Alerts** - Set monthly limits
2. **Vercel Usage Tracking** - Monitor function invocations
3. **Supabase Monitoring** - Database usage tracking
4. **Cost Dashboard** - Use `/api/llm-costs` endpoint

### 7.3 Alert Setup

Configure alerts for:

- [ ] **Deployment Failures** - GitHub Actions notifications
- [ ] **Health Check Failures** - External monitoring service
- [ ] **High Error Rates** - Vercel function alerts
- [ ] **Cost Overages** - OpenAI and Vercel usage alerts

---

## 🔐 Step 8: Security Configuration

### 8.1 Environment Security

- [ ] **Secrets Management** - All sensitive data in GitHub Secrets/Vercel Environment Variables
- [ ] **Key Rotation Plan** - Calendar reminder for quarterly rotation
- [ ] **Access Control** - Limit team access to production keys
- [ ] **Branch Protection** - Require PR reviews for main branch

### 8.2 Production Security

- [ ] **HTTPS Enforced** - Automatic via Vercel
- [ ] **Security Headers** - Configured in `vercel.json`
- [ ] **API Rate Limiting** - Vercel Edge Functions provide basic protection
- [ ] **Database Security** - Service role key usage, regular access review

---

## 🔄 Step 9: Backup & Recovery

### 9.1 Automated Backups

- [ ] **Database Backups** - Supabase automatic daily backups
- [ ] **Code Backups** - GitHub repository with release tags
- [ ] **Environment Backup** - Document all environment variables
- [ ] **Deployment History** - Vercel maintains deployment history

### 9.2 Recovery Procedures

**Rollback Deployment:**

1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "Promote to Production"

**Database Recovery:**

1. Go to Supabase Dashboard → Settings → Database
2. Use point-in-time recovery or restore from backup

**Emergency Procedures:**

- **High Error Rates**: Check GitHub Actions logs and Vercel function logs
- **Database Issues**: Verify Supabase connection and credentials
- **High Costs**: Remove OPENAI_KEY temporarily to disable AI features
- **Performance Issues**: Review Lighthouse reports and optimize

---

## 📋 Post-Deployment Checklist

### ✅ Immediate Actions (Day 1)

- [ ] Verify automated deployment completed successfully
- [ ] Check all GitHub Actions workflows pass
- [ ] Test core functionality manually
- [ ] Monitor error logs for 24 hours
- [ ] Verify health checks are working
- [ ] Set up external monitoring

### ✅ Short Term (Week 1)

- [ ] Monitor GitHub Actions workflow reliability
- [ ] Track AI usage costs via `/api/llm-costs`
- [ ] Review Lighthouse performance reports
- [ ] Test rollback procedures
- [ ] Document any production issues
- [ ] Verify backup systems working

### ✅ Long Term (Month 1)

- [ ] Review deployment workflow efficiency
- [ ] Analyze usage patterns and costs
- [ ] Optimize based on real user data
- [ ] Plan scaling improvements
- [ ] Update documentation based on learnings
- [ ] Schedule regular security reviews

---

## 💰 Cost Monitoring

### Expected Monthly Costs

**Vercel (Pro Plan - $20/month):**

- 1M function invocations
- 100GB bandwidth
- Advanced analytics

**Supabase (Pro Plan - $25/month):**

- 8GB database storage
- 250GB bandwidth
- Daily backups

**OpenAI (Pay-per-use):**

- GPT-4o: $0.0025/1K input tokens, $0.01/1K output tokens
- Estimated: $2-10/month for typical usage

**GitHub Actions:**

- Free for public repositories
- 2,000 minutes/month for private repositories

**Total Monthly Cost: ~$50-60**

### Cost Optimization Tips

1. **Monitor AI Usage**: Use `/api/llm-costs` endpoint regularly
2. **Optimize Prompts**: Shorter, more focused prompts reduce costs
3. **Set Usage Alerts**: Configure alerts in all services
4. **Review Regularly**: Weekly cost reviews for first month

---

## 🚨 Troubleshooting

### Common Issues

**GitHub Actions Failures:**

- Check workflow logs in Actions tab
- Verify all secrets are configured correctly
- Ensure Vercel project is properly linked

**Deployment Failures:**

- Review Vercel build logs
- Check environment variables are set
- Verify database migrations applied

**API Errors:**

- Test health endpoint: `curl https://your-app.vercel.app/api/health`
- Check Vercel function logs
- Verify OpenAI API key is valid

**Database Issues:**

- Verify Supabase credentials in dashboard
- Check database connection in health endpoint
- Review migration status

### Support Resources

**Documentation:**

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

**Status Pages:**

- [GitHub Status](https://www.githubstatus.com/)
- [Vercel Status](https://status.vercel.com/)
- [Supabase Status](https://status.supabase.com/)

---

## 🎉 Deployment Complete!

Your ChatNotes application is now deployed with automated CI/CD!

**Key Benefits:**

- ✅ **Automated Quality Checks** - Every deployment is tested
- ✅ **Database Migration Deployment** - Migrations applied automatically
- ✅ **Zero-Downtime Deployments** - Vercel handles rollouts
- ✅ **Rollback Capability** - Easy to revert if issues arise
- ✅ **Performance Monitoring** - Lighthouse audits on every deploy
- ✅ **Health Monitoring** - Automated health checks
- ✅ **Cost Tracking** - Built-in cost monitoring

**Next Steps:**

1. Monitor the first few automated deployments
2. Set up external monitoring for production alerts
3. Share with beta users and gather feedback
4. Iterate based on real usage patterns

---

_Last Updated: December 2024_  
_Version: 2.0 - GitHub Actions CI/CD_
