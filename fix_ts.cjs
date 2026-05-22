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

// 1. useLoginForm
replaceInFile('src/features/auth/login/model/useLoginForm.ts', [
    ['catch (error: any)', 'catch (_: any)']
]);

// 2. AdminUsersPage
replaceInFile('src/pages/admin/ui/AdminUsersPage.tsx', [
    ['parent.nickname', 'parent.name'],
    [/(const|let) parentId/g, '//$1 parentId'],
    ['onToggleStatus={(parentId, status)', 'onToggleStatus={(_, status)']
]);

// 3. OverviewPage
replaceInFile('src/pages/dashboard/ui/OverviewPage.tsx', [
    [/stats\./g, 'stats?.'],
    ['stats?.points', '(stats?.points || 0)'],
    ['stats?.pointChange', '(stats?.pointChange || 0)'],
    ['stats?.streakDays', '(stats?.streakDays || 0)'],
    ['stats?.streakChange', '(stats?.streakChange || 0)'],
    ['stats?.studyTime', '(stats?.studyTime || "0")'],
    ['stats?.timeChange', '(stats?.timeChange || "0")'],
    ['stats?.avgScore', '(stats?.avgScore || 0)'],
    ['stats?.scoreChange', '(stats?.scoreChange || 0)'],
    ['((stats', '(stats'] // cleanup double paren if occurred
]);

// 4. PaymentPage
replaceInFile('src/pages/dashboard/ui/PaymentPage.tsx', [
    ['background: plan.bg', 'background: plan.bg || ""']
]);

// 5. ProgressPage
replaceInFile('src/pages/dashboard/ui/ProgressPage.tsx', [
    [/stats\./g, 'stats?.'],
    ['stats?.points', '(stats?.points || 0)'],
    ['stats?.overallScore', '(stats?.overallScore || 0)'],
    ['stats?.skillsMastered', '(stats?.skillsMastered || 0)'],
    ['stats?.totalLessons', '(stats?.totalLessons || 0)'],
    ['score: (stats?.overallScore || 0),', 'score: stats?.overallScore || 0,'],
    ['((stats', '(stats']
]);

// 6. SubscriptionPage
replaceInFile('src/pages/dashboard/ui/SubscriptionPage.tsx', [
    ['const plan = activeChild?.plan || "FREE";', 'const plan = activeChild?.plan || "FREE"; if(!activeChild) return null;'],
    [/billing\./g, 'billing?.'],
    ['billing?.nextPayment', '(billing?.nextPayment || "")'],
    ['billing?.status', '(billing?.status || "")'],
    ['billing?.pricePerMonth', '(billing?.pricePerMonth || 0)'],
    ['((billing', '(billing']
]);

// 7. Math2Quiz3DPage
replaceInFile('src/pages/student/ui/Math2Quiz3DPage.tsx', [
    ['let timer: number', 'let timer: ReturnType<typeof setTimeout>']
]);

// 8. seed.ts
replaceInFile('src/shared/db/seed.ts', [
    ['const admin = await db', 'await db']
]);

// 9. speakVietnameseWithCaption
replaceInFile('src/shared/lib/speakVietnameseWithCaption.ts', [
    ['let interval: ReturnType<typeof setInterval> | null', 'let interval: ReturnType<typeof setInterval>'],
    ['let interval: number', 'let interval: ReturnType<typeof setInterval>'],
    ['let interval: any', 'let interval: ReturnType<typeof setInterval>']
]);

// 10. RecentActivityTable
replaceInFile('src/widgets/recent-activity-table/ui/RecentActivityTable.tsx', [
    ['const activities = dashboardData.activities;', 'const activities = dashboardData?.activities || [];']
]);

// 11. StudyProgressChart
replaceInFile('src/widgets/study-progress-chart/ui/StudyProgressChart.tsx', [
    ['d.minutes', '(d.minutes || 0)']
]);

console.log("Fix script 2 completed.");
