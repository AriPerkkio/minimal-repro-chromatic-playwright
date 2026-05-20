import { defineConfig, devices } from '@playwright/test';
import { join } from 'path';
import { readFileSync } from 'fs';
import type { ChromaticConfig } from '@chromatic-com/playwright';

require('dotenv').config();

function readChromaticViewport(): { width: number; height: number } {
    const fallback = { width: 1280, height: 720 };
    try {
        const yml = readFileSync(join(__dirname, '.chromatic.yml'), 'utf8');
        const i = yml.indexOf('viewport:');
        if (i === -1) return fallback;
        const block = yml.slice(i, i + 320);
        const w = block.match(/^\s+width:\s*(\d+)/m);
        const h = block.match(/^\s+height:\s*(\d+)/m);
        return {
            width: w ? Number(w[1]) : fallback.width,
            height: h ? Number(h[1]) : fallback.height,
        };
    } catch {
        return fallback;
    }
}

/** This repro always targets the mb-chromatic QA Hub tenant. */
const AZURE_NAMESPACE = process.env.AZURE_NAMESPACE ?? 'mb-chromatic';

export const HUB_URL = `https://${AZURE_NAMESPACE}-rsvn.c3qualitycontrol.com/RSVN/app/login`;

const isChromaticRun = process.env.IS_CHROMATIC === 'true';
const chromaticViewport = readChromaticViewport();
const desktopChrome = {
    ...devices['Desktop Chrome'],
    ...(isChromaticRun ? { viewport: chromaticViewport } : {}),
};

const isCI = !!process.env.CI;

export default defineConfig<ChromaticConfig>({
    testDir: './testsuite',
    fullyParallel: false,
    forbidOnly: isCI,
    retries: 0,
    workers: isCI ? 1 : undefined,
    timeout: 240000,
    expect: { timeout: 10 * 1000 },
    use: {
        baseURL: '',
        headless: isCI,
        testIdAttribute: 'data-e2e',
        ignoreHTTPSErrors: true,
        disableAutoSnapshot: true,
        diffThreshold: 0.063,
        actionTimeout: 10 * 1000,
        navigationTimeout: 30 * 1000,
    },
    projects: [
        {
            name: 'devex-repro',
            testDir: './testsuite/non-parallel/hub/devex',
            use: { baseURL: HUB_URL, ...desktopChrome },
        },
    ],
});
