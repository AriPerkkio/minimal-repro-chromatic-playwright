import { Page } from '@playwright/test';

/** No-op stub — QA project logs slow requests; not needed for Chromatic repro. */
export async function monitorNetworkTimeouts(_page: Page, _timeout: number): Promise<void> {}

export async function monitorNetworkFailures(_page: Page): Promise<void> {}
