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
    ['countTarget={stats.weeklyMinutes}', 'countTarget={stats.weeklyMinutes || 0}'],
    ['countTarget={stats.completedLessons}', 'countTarget={stats.completedLessons || 0}'],
    ['countTarget={stats.overallScore}', 'countTarget={stats.overallScore || 0}'],
    ['badge={stats.completedLessonsLabel}', 'badge={stats.completedLessonsLabel || ""}'],
    ['value={stats.bestSkill}', 'value={stats.bestSkill || ""}']
]);

replaceInFile('src/pages/dashboard/ui/PaymentPage.tsx', [
    ['background: plan.bg || ""', 'background: plan.bg || undefined'],
    ['background: plan.bg', 'background: plan.bg || undefined']
]);

replaceInFile('src/pages/dashboard/ui/SubscriptionPage.tsx', [
    ['updateChildPlan(activeChild.id, "FREE");', 'updateChildPlan(activeChild?.id || "", "FREE");']
]);

console.log("Fix script 5 completed.");
