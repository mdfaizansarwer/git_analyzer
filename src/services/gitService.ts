import simpleGit, { LogResult, SimpleGit } from 'simple-git';
import { CommitStats, GitAnalysisResult, UserStats } from '../types';

export class GitService {
    private git: SimpleGit;
    private repoPath: string;

    constructor(repoPath: string) {
        this.repoPath = repoPath;
        this.git = simpleGit(repoPath);
    }

    async analyzeRepository(): Promise<GitAnalysisResult> {
        const log = await this.git.log();
        const stats = await this.calculateStats(log);
        const userStats = await this.calculateUserStats(log);

        return {
            repoPath: this.repoPath,
            stats,
            userStats
        };
    }

    private async calculateStats(log: LogResult): Promise<CommitStats> {
        const totalCommits = log.total;
        const totalLines = await this.calculateTotalLines(log);

        const firstCommitDate = new Date(log.all[log.total - 1].date);
        const lastCommitDate = new Date(log.all[0].date);
        const daysDiff = (lastCommitDate.getTime() - firstCommitDate.getTime()) / (1000 * 60 * 60 * 24);
        const weeksDiff = daysDiff / 7;
        const monthsDiff = daysDiff / 30;

        return {
            totalCommits,
            totalLines,
            dailyAvgCommits: totalCommits / daysDiff,
            weeklyAvgCommits: totalCommits / weeksDiff,
            monthlyAvgCommits: totalCommits / monthsDiff,
            dailyAvgLines: totalLines / daysDiff,
            weeklyAvgLines: totalLines / weeksDiff,
            monthlyAvgLines: totalLines / monthsDiff
        };
    }

    private async calculateTotalLines(log: LogResult): Promise<number> {
        let totalLines = 0;
        for (const commit of log.all) {
            const diff = await this.git.show([commit.hash, '--stat']);
            const linesMatch = diff.match(/(\d+) insertions?.*(\d+) deletions?/);
            if (linesMatch) {
                totalLines += parseInt(linesMatch[1]) + parseInt(linesMatch[2]);
            }
        }
        return totalLines;
    }

    private async calculateUserStats(log: LogResult): Promise<UserStats[]> {
        const userMap = new Map<string, { lines: number; commits: number }>();

        for (const commit of log.all) {
            const diff = await this.git.show([commit.hash, '--stat']);
            const linesMatch = diff.match(/(\d+) insertions?.*(\d+) deletions?/);
            const linesChanged = linesMatch ? parseInt(linesMatch[1]) + parseInt(linesMatch[2]) : 0;

            const current = userMap.get(commit.author_name) || { lines: 0, commits: 0 };
            userMap.set(commit.author_name, {
                lines: current.lines + linesChanged,
                commits: current.commits + 1
            });
        }

        const firstCommitDate = new Date(log.all[log.total - 1].date);
        const lastCommitDate = new Date(log.all[0].date);
        const daysDiff = (lastCommitDate.getTime() - firstCommitDate.getTime()) / (1000 * 60 * 60 * 24);
        const weeksDiff = daysDiff / 7;
        const monthsDiff = daysDiff / 30;

        return Array.from(userMap.entries()).map(([username, stats]) => ({
            username,
            totalLines: stats.lines,
            dailyAvgLines: stats.lines / daysDiff,
            weeklyAvgLines: stats.lines / weeksDiff,
            monthlyAvgLines: stats.lines / monthsDiff
        }));
    }
} 