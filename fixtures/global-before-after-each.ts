import { createPageProxy } from 'fixtures/angular/angular-stability';
import { Page } from '@playwright/test';
import { test as baseTest } from '@chromatic-com/playwright';

/** Same pattern as RSVN Playwright: Chromatic test + Angular page proxy (no Percy/a11y hooks). */
export const test = baseTest.extend<{
    page: Page;
}>({
    page: async ({ page }: { page: Page }, use: (page: Page) => Promise<void>) => {
        const pageProxy = createPageProxy(page);
        await use(pageProxy);
    },
});
