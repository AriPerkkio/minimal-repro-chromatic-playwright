import { TestInfo } from '@playwright/test';

/** No-op in minimal repro — always run Devex test regardless of @P1 grep. */
export async function handleTestPriority(_testInfo: TestInfo): Promise<void> {}
