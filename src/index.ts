import { Command } from 'commander';
import path from 'path';
import { GitService } from './services/gitService';
import { PDFService } from './services/pdfService';
import { printTable } from './utils/tableFormatter';

const program = new Command();

program
    .name('git-analyzer')
    .description('CLI tool to analyze Git repositories')
    .version('1.0.0');

program
    .command('analyze')
    .description('Analyze a Git repository')
    .requiredOption('-p, --path <path>', 'Path to the Git repository')
    .option('-o, --output <path>', 'Output path for the PDF report', './git-analysis-report.pdf')
    .action(async (options) => {
        try {
            const gitService = new GitService(options.path);
            const result = await gitService.analyzeRepository();

            const pdfService = new PDFService();
            const outputPath = path.resolve(options.output);
            await pdfService.generateReport(result, outputPath);

            console.log('Analysis completed successfully!');
            console.log(`Report generated at: ${outputPath}\n`);

            // Repository Summary Table
            console.log('\nRepository Summary:');
            printTable(
                ['Metric', 'Total', 'Daily Avg', 'Weekly Avg', 'Monthly Avg'],
                [
                    ['Commits',
                        result.stats.totalCommits.toString(),
                        result.stats.dailyAvgCommits.toFixed(2),
                        result.stats.weeklyAvgCommits.toFixed(2),
                        result.stats.monthlyAvgCommits.toFixed(2)
                    ],
                    ['Lines',
                        result.stats.totalLines.toString(),
                        result.stats.dailyAvgLines.toFixed(2),
                        result.stats.weeklyAvgLines.toFixed(2),
                        result.stats.monthlyAvgLines.toFixed(2)
                    ]
                ]
            );

            // User Contributions Table
            console.log('\nUser Contributions:');
            printTable(
                ['Username', 'Total Lines', 'Daily Avg', 'Weekly Avg', 'Monthly Avg'],
                result.userStats.map(user => [
                    user.username,
                    user.totalLines.toString(),
                    user.dailyAvgLines.toFixed(2),
                    user.weeklyAvgLines.toFixed(2),
                    user.monthlyAvgLines.toFixed(2)
                ])
            );

            // User Contribution Percentages Table
            console.log('\nUser Contribution Percentages:');
            const totalLines = result.stats.totalLines;
            const totalDailyAvg = result.stats.dailyAvgLines;
            const totalWeeklyAvg = result.stats.weeklyAvgLines;
            const totalMonthlyAvg = result.stats.monthlyAvgLines;

            // Calculate total contributions for each time period
            const totalDailyContributions = result.userStats.reduce((sum, user) => sum + user.dailyAvgLines, 0);
            const totalWeeklyContributions = result.userStats.reduce((sum, user) => sum + user.weeklyAvgLines, 0);
            const totalMonthlyContributions = result.userStats.reduce((sum, user) => sum + user.monthlyAvgLines, 0);

            printTable(
                ['Username', 'Total %', 'Daily %', 'Weekly %', 'Monthly %'],
                result.userStats.map(user => [
                    user.username,
                    `${((user.totalLines / totalLines) * 100).toFixed(2)}%`,
                    `${((user.dailyAvgLines / totalDailyContributions) * 100).toFixed(2)}%`,
                    `${((user.weeklyAvgLines / totalWeeklyContributions) * 100).toFixed(2)}%`,
                    `${((user.monthlyAvgLines / totalMonthlyContributions) * 100).toFixed(2)}%`
                ])
            );

        } catch (error) {
            console.error('Error analyzing repository:', error);
            process.exit(1);
        }
    });

program.parse(process.argv);
