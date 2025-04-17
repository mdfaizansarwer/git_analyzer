import { createCanvas } from 'canvas';
import { Chart, registerables } from 'chart.js';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { GitAnalysisResult } from '../types';

// Register all Chart.js components
Chart.register(...registerables);

export class PDFService {
    private doc: PDFKit.PDFDocument;

    constructor() {
        this.doc = new PDFDocument();
    }

    async generateReport(result: GitAnalysisResult, outputPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const stream = this.doc.pipe(fs.createWriteStream(outputPath));

            this.doc.fontSize(25).text('Git Repository Analysis Report', { align: 'center' });
            this.doc.moveDown();

            // Add pie charts
            this.addPieCharts(result);

            this.doc.end();

            stream.on('finish', resolve);
            stream.on('error', reject);
        });
    }

    private async addPieCharts(result: GitAnalysisResult) {
        // Create canvas for total contributions chart
        const totalCanvas = createCanvas(500, 400);
        const totalCtx = totalCanvas.getContext('2d') as unknown as CanvasRenderingContext2D;

        // Create canvas for daily contributions chart
        const dailyCanvas = createCanvas(500, 400);
        const dailyCtx = dailyCanvas.getContext('2d') as unknown as CanvasRenderingContext2D;

        // Generate random colors for each user
        const colors = result.userStats.map(() => {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            return `rgb(${r}, ${g}, ${b})`;
        });

        // Total contributions chart
        new Chart(totalCtx, {
            type: 'pie',
            data: {
                labels: result.userStats.map(user => user.username),
                datasets: [{
                    data: result.userStats.map(user => user.totalLines),
                    backgroundColor: colors,
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Total Lines Contribution by User',
                        font: {
                            size: 14
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 10
                            },
                            padding: 10,
                            boxWidth: 10
                        }
                    }
                }
            }
        });

        // Daily contributions chart
        new Chart(dailyCtx, {
            type: 'pie',
            data: {
                labels: result.userStats.map(user => user.username),
                datasets: [{
                    data: result.userStats.map(user => user.dailyAvgLines),
                    backgroundColor: colors,
                    borderColor: 'white',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                layout: {
                    padding: {
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Daily Average Lines Contribution by User',
                        font: {
                            size: 14
                        },
                        padding: {
                            bottom: 20
                        }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: {
                                size: 10
                            },
                            padding: 10,
                            boxWidth: 10
                        }
                    }
                }
            }
        });

        // Add first page with summary
        this.doc.addPage();

        // Add title with styling
        this.doc.font('Helvetica-Bold')
            .fontSize(24)
            .fillColor('#2c3e50')
            .text('Git Repository Analysis Report', { align: 'center' });
        this.doc.moveDown();

        // Add user contribution summary with styling
        this.doc.font('Helvetica-Bold')
            .fontSize(16)
            .fillColor('#3498db')
            .text('User Contribution Summary', { align: 'center' });
        this.doc.moveDown();

        // Calculate total lines for percentage
        const totalLines = result.stats.totalLines;

        // Add bullet points for each user with conditional rendering
        result.userStats.forEach(user => {
            const percentage = ((user.totalLines / totalLines) * 100).toFixed(2);

            // Only show user if they have any contributions
            if (user.totalLines > 0) {
                // User name with percentage
                this.doc.font('Helvetica-Bold')
                    .fontSize(12)
                    .fillColor('#2c3e50')
                    .text(`• ${user.username}`, { continued: true })
                    .fillColor('#7f8c8d')
                    .text(` (${percentage}% of total)`, { continued: false });

                // Contribution details
                this.doc.font('Helvetica')
                    .fontSize(10)
                    .fillColor('#34495e');

                // Only show averages if they are greater than 0
                if (user.dailyAvgLines > 0) {
                    this.doc.text(`  - Daily Average: ${user.dailyAvgLines.toFixed(2)} lines`, { continued: false });
                }
                if (user.weeklyAvgLines > 0) {
                    this.doc.text(`  - Weekly Average: ${user.weeklyAvgLines.toFixed(2)} lines`, { continued: false });
                }
                if (user.monthlyAvgLines > 0) {
                    this.doc.text(`  - Monthly Average: ${user.monthlyAvgLines.toFixed(2)} lines`, { continued: false });
                }

                this.doc.moveDown();
            }
        });

        this.doc.moveDown(2);

        // Check if there's enough space for the first chart
        const requiredSpace = 500; // Chart height + title + spacing
        if (this.doc.y + requiredSpace + 100 > this.doc.page.height) {
            this.doc.addPage();
        }

        // Add total contributions chart with styling
        this.doc.font('Helvetica-Bold')
            .fontSize(16)
            .fillColor('#3498db')
            .text('Total Lines Contribution', { align: 'center' });
        this.doc.image(totalCanvas.toBuffer(), {
            fit: [500, 400],
            align: 'center'
        });

        // Check if there's enough space for the second chart
        if (this.doc.y + requiredSpace + 100 > this.doc.page.height) {
            this.doc.addPage();
        }

        // Add second chart with styling
        this.doc.font('Helvetica-Bold')
            .fontSize(16)
            .fillColor('#3498db')
            .text('Daily Average Lines Contribution', { align: 'center' });
        this.doc.image(dailyCanvas.toBuffer(), {
            fit: [500, 400],
            align: 'center'
        });
    }
} 