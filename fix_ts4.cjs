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

replaceInFile('src/pages/dashboard/ui/OverviewPage.tsx', [
    ['stats.points', '(stats?.points || 0)'],
    ['stats.pointChange', '(stats?.pointChange || 0)'],
    ['stats.streakDays', '(stats?.streakDays || 0)'],
    ['stats.streakChange', '(stats?.streakChange || 0)'],
    ['stats.studyTime', '(stats?.studyTime || "0")'],
    ['stats.timeChange', '(stats?.timeChange || "0")'],
    ['stats.avgScore', '(stats?.avgScore || 0)'],
    ['stats.scoreChange', '(stats?.scoreChange || 0)']
]);

console.log("Fix script 4 completed.");
