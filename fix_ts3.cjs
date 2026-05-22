const fs = require('fs');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        if (search instanceof RegExp) {
            content = content.replace(search, replace);
        } else {
            content = content.split(search).join(replace);
        }
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
}

replaceInFile('src/pages/dashboard/ui/ProgressPage.tsx', [
    ['dashboardData.weeklyTrend', 'dashboardData?.weeklyTrends || []'],
    ['stats.points', '(stats?.points || 0)'],
    ['stats.overallScore', '(stats?.overallScore || 0)'],
    ['stats.skillsMastered', '(stats?.skillsMastered || 0)'],
    ['stats.totalLessons', '(stats?.totalLessons || 0)'],
    ['score: stats.overallScore,', 'score: (stats?.overallScore || 0),'],
    ['s.pct', 's.percentage']
]);

replaceInFile('src/pages/dashboard/ui/SubscriptionPage.tsx', [
    ['const plan = activeChild.plan;', 'const plan = activeChild?.plan || "FREE";'],
    ['const billing = dashboardData.billing;', 'const billing = dashboardData?.billing;'],
    ['billing.nextPayment', '(billing?.nextPayment || "")'],
    ['billing.status', '(billing?.status || "")'],
    ['billing.pricePerMonth', '(billing?.pricePerMonth || 0)'],
    ['if (!activeChild)', 'if (!activeChild || !billing)']
]);

console.log("Fix script 3 completed.");
