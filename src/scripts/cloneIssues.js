import fs from 'fs/promises';

const REPO = 'openfrontio/OpenFrontIO';
const OUTPUT_FILE = 'cloned_issues.json';

async function fetchIssues(page) {
  const url = `https://api.github.com/repos/${REPO}/issues?state=open&per_page=100&page=${page}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to fetch issues: ${resp.status} ${resp.statusText}`);
  }
  return await resp.json();
}

async function fetchAllIssues() {
  const issues = [];
  let page = 1;
  while (true) {
    const pageIssues = await fetchIssues(page);
    issues.push(
      ...pageIssues.map(i => ({ number: i.number, title: i.title, state: i.state, url: i.html_url }))
    );
    if (pageIssues.length < 100) break;
    page++;
  }
  return issues;
}

async function main() {
  const issues = await fetchAllIssues();
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(issues, null, 2));
  console.log(`Fetched ${issues.length} issues to ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
