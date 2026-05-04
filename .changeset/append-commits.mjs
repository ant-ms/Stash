import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const getTag = () => {
  try { return execSync('git tag --sort=-creatordate | head -n 1').toString().trim(); }
  catch { return ''; }
};

const tag = getTag();
['_frontend', '_worker', '_desktop_client', '_gatekeeper'].forEach(pkg => {
  const f = path.join(root, pkg, 'CHANGELOG.md');
  if (!fs.existsSync(f)) return;

  try {
    const log = execSync(`git log ${tag ? `${tag}..HEAD` : ''} --oneline -- ${path.join(root, pkg)}`).toString().trim();
    if (!log) return;

    const list = log.split('\n').map(l => `- ${l}`).join('\n');
    const c = fs.readFileSync(f, 'utf8');
    const m = c.match(/^(##\s.*)$/m);
    if (m) {
      const i = m.index + m[0].length;
      fs.writeFileSync(f, `${c.slice(0, i)}\n\n### Commits\n\n${list}\n${c.slice(i)}`);
    }
  } catch {}
});
