const fs = require('fs');
const path = require('path');

const groups = {
  auth: [
    { file: 'api/auth/login.ts', method: 'POST', path: 'login' },
    { file: 'api/auth/register.ts', method: 'POST', path: 'register' }
  ],
  admin: [
    { file: 'api/admin/parents.ts', method: 'GET', path: 'parents' },
    { file: 'api/admin/stats.ts', method: 'GET', path: 'stats' },
    { file: 'api/admin/parents/[id]/status.ts', method: 'PUT', path: 'parents/status', isDynamic: true },
    { file: 'api/admin/students/[id]/status.ts', method: 'PUT', path: 'students/status', isDynamic: true }
  ],
  children: [
    { file: 'api/children/index.ts', method: 'GET', path: '' },
    { file: 'api/children/add.ts', method: 'POST', path: 'add' },
    { file: 'api/children/[id]/dashboard.ts', method: 'GET', path: 'dashboard', isDynamic: true },
    { file: 'api/children/[id]/activities.ts', method: 'GET', path: 'activities', isDynamic: true },
    { file: 'api/children/[id]/plan.ts', method: 'PUT', path: 'plan', isDynamic: true }
  ],
  lessons: [
    { file: 'api/lessons/topics.ts', method: 'GET', path: 'topics' },
    { file: 'api/lessons/completed.ts', method: 'GET', path: 'completed' },
    { file: 'api/lessons/[id]/quiz.ts', method: 'GET', path: 'quiz', isDynamic: true },
    { file: 'api/lessons/[id]/complete.ts', method: 'POST', path: 'complete', isDynamic: true }
  ],
  transactions: [
    { file: 'api/transactions/index.ts', method: 'ANY', path: '' } // handles GET and POST
  ],
  parent: [
    { file: 'api/parent/profile.ts', method: 'ANY', path: 'profile' } // handles GET and PUT
  ]
};

// We will read each file, extract the body of the handler, and combine them.
// To do this simply, we will just keep the original files but import them into the catch-all.
// WAIT, if we keep the original files in api/ folder, Vercel will still count them!
// So we must move the logic to `src/server/...` OR rename them with a `_` prefix so Vercel ignores them!
// YES! Vercel ignores files starting with `_` inside the `api` folder!

function convertToInternalFiles() {
    for (const [groupName, endpoints] of Object.entries(groups)) {
        for (const ep of endpoints) {
            if (!fs.existsSync(ep.file)) continue;
            let content = fs.readFileSync(ep.file, 'utf8');
            
            // Fix import .js extension
            content = content.replace(/from "(\.\.\/)+_db"/g, 'from "$1_db.js"');
            content = content.replace(/from "(\.\.\/)+_db\.js"/g, 'from "$1_db.js"');

            // Find how many `../` it needs. Since we move it to `api/_internal/`, it will be 2 levels down.
            // Wait, we can just put them all in `api/_internal/` as flat files!
            let flatName = ep.file.replace(/\\/g, '/').replace('api/', '').replace(/\//g, '_'); // e.g. admin_parents.ts, admin_parents_[id]_status.ts
            const targetPath = `api/_internal/${flatName}`;
            
            // Fix _db import for depth 2 (`api/_internal/file.ts` -> `api/_db.ts` is `../_db.js`)
            content = content.replace(/from "(?:\.\.\/)+_db(?:\.js)?"/g, 'from "../_db.js"');

            if (!fs.existsSync('api/_internal')) {
                fs.mkdirSync('api/_internal');
            }

            fs.writeFileSync(targetPath, content);
            fs.unlinkSync(ep.file); // delete old file
            ep.internalFile = flatName; // save for catch-all router
        }
    }
}

// Generate catch-all routers
function generateRouters() {
    for (const [groupName, endpoints] of Object.entries(groups)) {
        let imports = `import type { VercelRequest, VercelResponse } from "@vercel/node";\n`;
        let cases = [];

        endpoints.forEach((ep, i) => {
            if (!ep.internalFile) return;
            const handlerName = `handler${i}`;
            // Use .js extension for imports
            imports += `import ${handlerName} from "../_internal/${ep.internalFile.replace('.ts', '.js')}";\n`;
            
            // Route matching logic
            if (ep.isDynamic) {
                // path is e.g. "dashboard" or "parents/status"
                // Actually the original path was e.g. /api/children/[id]/dashboard
                // In api/children/[...slug].ts, slug will be ["123", "dashboard"]
                // Original file: api/admin/parents/[id]/status.ts -> slug will be ["parents", "123", "status"]
                let matchCondition = '';
                if (groupName === 'admin' && ep.path === 'parents/status') {
                    matchCondition = `slug[0] === 'parents' && slug.length === 3 && slug[2] === 'status'`;
                    cases.push(`  if (${matchCondition}) { req.query.id = slug[1]; return ${handlerName}(req, res); }`);
                } else if (groupName === 'admin' && ep.path === 'students/status') {
                    matchCondition = `slug[0] === 'students' && slug.length === 3 && slug[2] === 'status'`;
                    cases.push(`  if (${matchCondition}) { req.query.id = slug[1]; return ${handlerName}(req, res); }`);
                } else if (groupName === 'children' && ep.path === 'dashboard') {
                    matchCondition = `slug.length === 2 && slug[1] === 'dashboard'`;
                    cases.push(`  if (${matchCondition}) { req.query.id = slug[0]; return ${handlerName}(req, res); }`);
                } else if (groupName === 'children' && ep.path === 'activities') {
                    matchCondition = `slug.length === 2 && slug[1] === 'activities'`;
                    cases.push(`  if (${matchCondition}) { req.query.id = slug[0]; return ${handlerName}(req, res); }`);
                } else if (groupName === 'children' && ep.path === 'plan') {
                    matchCondition = `slug.length === 2 && slug[1] === 'plan'`;
                    cases.push(`  if (${matchCondition}) { req.query.id = slug[0]; return ${handlerName}(req, res); }`);
                } else if (groupName === 'lessons' && ep.path === 'quiz') {
                    matchCondition = `slug.length === 2 && slug[1] === 'quiz'`;
                    cases.push(`  if (${matchCondition}) { req.query.id = slug[0]; return ${handlerName}(req, res); }`);
                } else if (groupName === 'lessons' && ep.path === 'complete') {
                    matchCondition = `slug.length === 2 && slug[1] === 'complete'`;
                    cases.push(`  if (${matchCondition}) { req.query.id = slug[0]; return ${handlerName}(req, res); }`);
                }
            } else {
                let matchCondition = '';
                if (ep.path === '') {
                    matchCondition = `!slug || slug.length === 0`;
                } else {
                    matchCondition = `slug && slug.length === 1 && slug[0] === '${ep.path}'`;
                }
                cases.push(`  if (${matchCondition}) { return ${handlerName}(req, res); }`);
            }
        });

        const catchAllCode = `${imports}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  let { slug } = req.query;
  if (typeof slug === 'string') slug = [slug];

${cases.join('\n')}

  return res.status(404).json({ error: "Route not found" });
}
`;
        const dir = `api/${groupName}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(`${dir}/[...slug].ts`, catchAllCode);
    }
}

// Ensure `api/_db.ts` uses `.js` for schema import if necessary
function fixDbFile() {
    let dbFile = 'api/_db.ts';
    if (fs.existsSync(dbFile)) {
        let content = fs.readFileSync(dbFile, 'utf8');
        content = content.replace(/from "(?:\.\.\/)*src\/shared\/db\/schema(?:\.js)?"/g, 'from "../src/shared/db/schema.js"');
        fs.writeFileSync(dbFile, content);
    }
}

convertToInternalFiles();
generateRouters();
fixDbFile();

// Cleanup empty directories
try { fs.rmdirSync('api/admin/parents'); } catch(e){}
try { fs.rmdirSync('api/admin/students'); } catch(e){}
try { fs.rmdirSync('api/children'); } catch(e){} // wait, api/children/[...slug] is created there!
try { fs.rmdirSync('api/lessons'); } catch(e){}
try { fs.rmdirSync('api/transactions'); } catch(e){}

console.log("Reorganization complete!");
