# Git Analyzer

A CLI tool to analyze Git repositories and generate detailed reports about commit history, code contributions, and more.

## Features

- Total commits count to main branch
- Daily, weekly, and monthly average commits
- Total lines committed
- Daily, weekly, and monthly average lines committed
- User-specific contribution statistics
- PDF report generation with charts

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/git-analyzer.git
cd git-analyzer

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

To analyze a Git repository:

```bash
# Using npm
npm start analyze -- -p /path/to/repository

# Or directly
git-analyzer analyze -p /path/to/repository
```

### Options

- `-p, --path <path>`: Path to the Git repository (required)
- `-o, --output <path>`: Output path for the PDF report (default: ./git-analysis-report.pdf)

## Development

```bash
# Run in development mode
npm run dev analyze -- -p /path/to/repository
```

## License

ISC 