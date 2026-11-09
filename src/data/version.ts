import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Version shown in the footer. Precedence:
 *   1. The first `## vYYYYMMDD` entry in CHANGELOG.md.
 *   2. The build date, formatted as vYYYYMMDD.
 *
 * `import.meta.url` does not work here: during the Astro build this module is
 * evaluated from a temporary bundle, so the path relative to the source does not
 * exist. It is read from the project root, which is the cwd of both
 * `astro build` and `astro dev`.
 */
function versionFromChangelog(): string | undefined {
  try {
    const changelog = readFileSync(resolve(process.cwd(), 'CHANGELOG.md'), 'utf8');
    return changelog.match(/^## (v\d{8}(?:\.\d+)?)/m)?.[1];
  } catch {
    return undefined;
  }
}

function versionFromDate(): string {
  return `v${new Date().toISOString().slice(0, 10).replaceAll('-', '')}`;
}

export const siteVersion: string = versionFromChangelog() ?? versionFromDate();
