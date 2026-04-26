import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    PieChart, Pie, Cell,
    LineChart, Line
} from 'recharts';

export function AgentEvaluationMetrics({ evaluations }) {
    if (!evaluations || !Array.isArray(evaluations) || evaluations.length === 0) {
        return <div>No evaluation data available.</div>;
    }

    // --- Aggregate Metrics ---
    const totalEvaluations = evaluations.length;
    const averageQualityScore = (evaluations.reduce((sum, e) => sum + (e.quality_score || 0), 0) / totalEvaluations).toFixed(2);
    const hallucinationDetections = evaluations.filter(e => e.hallucination_detected).length;

    // --- Chart Data Preparation ---

    // 1. Quality Score Distribution (Bar Chart)
    const qualityScoreCounts = evaluations.reduce((acc, e) => {
        const score = e.quality_score || 0;
        acc[score] = (acc[score] || 0) + 1;
        return acc;
    }, {});
    const qualityChartData = Object.keys(qualityScoreCounts).map(score => ({
        quality_score: parseInt(score),
        count: qualityScoreCounts[score],
    }));

    // 2. Average Performance Profile (Radar Chart)
    const radarMetrics = ['clarity_score', 'accuracy_score', 'relevance_score', 'empathy_score', 'coherence_score'];
    const radarData = radarMetrics.map(metric => {
        const total = evaluations.reduce((sum, e) => sum + (e.evaluation_data?.[metric] || 0), 0);
        return {
            subject: metric.replace('_score', '').replace(/\b\w/g, l => l.toUpperCase()),
            A: parseFloat((total / totalEvaluations).toFixed(2)),
            fullMark: 10,
        };
    });

    // 3. Hallucination Detection (Pie Chart)
    const pieData = [
        { name: 'No Hallucination', value: totalEvaluations - hallucinationDetections },
        { name: 'Hallucination Detected', value: hallucinationDetections },
    ];
    const PIE_COLORS = ['#4CAF50', '#F44336'];

    // 4. Quality Score Over Time (Line Chart)
    const lineChartData = evaluations
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        .map((e, index) => ({
            name: `Eval ${index + 1}`,
            quality_score: e.quality_score,
        }));

    return (
        <>
            <h3>Agent Evaluation Metrics</h3>
            <div className="sl-metrics-grid">
                <div className="sl-metric-item">
                    <span className="sl-metric-label">Total Evaluations:</span>
                    <span className="sl-metric-value">{totalEvaluations}</span>
                </div>
                <div className="sl-metric-item">
                    <span className="sl-metric-label">Average Quality Score:</span>
                    <span className="sl-metric-value">{averageQualityScore}</span>
                </div>
                <div className="sl-metric-item">
                    <span className="sl-metric-label">Hallucination Detections:</span>
                    <span className="sl-metric-value">{hallucinationDetections}</span>
                </div>
            </div>

            <div className="charts-container" style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <h4>Performance Profile</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} />
                            <Radar name="Average Score" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h4>Hallucination Analysis</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                    <h4>Quality Score Over Time</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={lineChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis domain={[0, 10]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="quality_score" stroke="#82ca9d" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                    <h4>Quality Score Distribution</h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={qualityChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="quality_score" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </>
    );
}