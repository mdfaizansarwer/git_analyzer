export interface CommitStats {
    totalCommits: number;
    totalLines: number;
    dailyAvgCommits: number;
    weeklyAvgCommits: number;
    monthlyAvgCommits: number;
    dailyAvgLines: number;
    weeklyAvgLines: number;
    monthlyAvgLines: number;
}

export interface UserStats {
    username: string;
    totalLines: number;
    dailyAvgLines: number;
    weeklyAvgLines: number;
    monthlyAvgLines: number;
}

export interface GitAnalysisResult {
    repoPath: string;
    stats: CommitStats;
    userStats: UserStats[];
} 