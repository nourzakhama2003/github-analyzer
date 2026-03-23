# GitHub Repository Analyzer

Advanced GitHub repository analysis tool that evaluates repositories for activity, complexity, and learning difficulty.

## Features

- 🔍 **Multi-Repository Analysis**: Analyze up to 10 repositories in one go
- 📊 **Activity Score**: Measures repository activity based on commits, contributors, and engagement
- 📈 **Complexity Analysis**: Estimates codebase complexity using multiple factors
- 🎓 **Learning Difficulty Classification**: Classifies repos as Beginner, Intermediate, or Advanced
- 🏥 **Health & Maintainability Scores**: Evaluates repository health and maintenance status
- ⚡ **Real-time Analysis**: Fast API-driven analysis
- 🎨 **Beautiful UI**: Modern, responsive interface with detailed visualizations

## Scoring Formulas

### Activity Score (0-100)
```
ActivityScore = (0.4 × commits_30d) +
                (0.3 × contributor_count) +
                (0.2 × star_count) +
                (0.1 × open_issues_30d)
```

### Complexity Score (0-100)
```
ComplexityScore = (0.35 × language_count) +
                  (0.35 × file_count) +
                  (0.2 × dependency_count) +
                  (0.1 × team_size)
```

### Learning Difficulty
- **Beginner**: Combined score < 35
- **Intermediate**: Combined score 35-65
- **Advanced**: Combined score > 65

### Maintainability Score (0-100)
```
MaintainabilityScore = (0.35 × recency_of_commits) +
                       (0.25 × commit_frequency) +
                       (0.25 × issue_resolution_rate) +
                       (0.15 × team_engagement)
```

## Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS
- **Backend**: Next.js API routes
- **GitHub Integration**: @octokit/rest
- **Visualization**: Recharts
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites
- Node.js 18+
- GitHub API token (optional but recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/github-analyzer.git
cd github-analyzer

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
```

### Environment Variables

Create `.env.local`:
```env
GITHUB_TOKEN=your_github_token_here
```

Get your GitHub token from: https://github.com/settings/tokens

### Development

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Usage

1. Navigate to the analyzer homepage
2. Enter repository names in format: `owner/repo` or full GitHub URLs
3. Click "Analyze Repositories"
4. View detailed scores and insights

## API Endpoint

### POST /api/analyze

**Request Body:**
```json
{
  "repos": [
    "facebook/react",
    "vuejs/vue",
    "angular/angular"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2026-03-23T10:30:00Z",
  "analyzedCount": 2,
  "data": [
    {
      "repository": {
        "name": "react",
        "owner": "facebook",
        "url": "https://github.com/facebook/react",
        "stars": 200000,
        "forks": 42000
      },
      "metrics": {
        "commits30d": 150,
        "contributors": 1200,
        "languages": ["JavaScript", "TypeScript"]
      },
      "scores": {
        "activity": 92,
        "complexity": 78,
        "maintainability": 88,
        "health": 86,
        "learning": 45
      },
      "insights": {
        "learningDifficulty": "Advanced",
        "recommendation": "🚀 Advanced project",
        "bestForBeginners": false,
        "activelyMaintained": true
      }
    }
  ]
}
```

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: GitHub Repository Analyzer"
git branch -M main
git remote add origin https://github.com/yourusername/github-analyzer.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "New Project"
4. Select your repository
5. Configure environment variables:
   - Add `GITHUB_TOKEN` as an environment variable

### Step 3: Deploy

- Vercel will automatically build and deploy on every push to main
- Your app will be available at: `https://github-analyzer-yourusername.vercel.app`

## Example Analysis

### React Repository
- **Activity Score**: 92 (Highly active)
- **Complexity Score**: 78 (Advanced codebase)
- **Learning Difficulty**: Advanced
- **Recommendation**: 🚀 Advanced project
- **Use Case**: Production-level learning, contributes to major projects

### Next.js Repository
- **Activity Score**: 85 (Very active)
- **Complexity Score**: 72 (Advanced)
- **Learning Difficulty**: Advanced
- **Recommendation**: 🚀 Advanced project

## Rate Limiting

- **Unauthenticated**: 60 requests per hour
- **Authenticated**: 5000 requests per hour

For better rate limits, set `GITHUB_TOKEN` in environment variables.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Resources

- [GitHub API Documentation](https://docs.github.com/en/rest)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)

## Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the API response format

---

**Built with ❤️ for GSoC 2026**
