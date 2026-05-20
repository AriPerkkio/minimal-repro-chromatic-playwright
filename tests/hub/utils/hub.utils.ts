import { Locator, Page } from '@playwright/test';
import { Screen } from 'tests/hub/enums/screen.enum';
import { Site } from 'tests/hub/enums/site.enum';

/** Trimmed Hub helpers required by the Devex PO grid filters repro. */
export class HubUtils {
    public static async delay(time: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    public static async waitForPageToBeCompletelyReady(aPage: Page, aAdditionalDelayMS: number = 300): Promise<void> {
        await aPage.waitForLoadState('domcontentloaded');
        await aPage.waitForLoadState('networkidle');
        await this.delay(aAdditionalDelayMS);
    }

    public static async waitForAllProgressBarsToBeHidden(aPage: Page): Promise<void> {
        const progressBars: Locator[] = await aPage.locator('//mat-progress-bar[@mode="indeterminate"]').all();
        for (const progressBar of progressBars) {
            await progressBar.waitFor({ state: 'hidden' });
        }
        await aPage.waitForLoadState('load');
    }

    public static async resetFieldFocus(aPage: Page): Promise<void> {
        await aPage.locator('//c3-toolbar').getByTestId('logo').click({ force: true });
    }

    public static async selectSite(aPage: Page, aSite: Site): Promise<void> {
        await this.waitForAllProgressBarsToBeHidden(aPage);
        const siteListbox = aPage.locator('.cdk-overlay-pane').getByRole('listbox');
        let selectedSite = siteListbox.getByRole('option', { name: aSite });
        await this.waitForPageToBeCompletelyReady(aPage);
        while (await siteListbox.isHidden()) {
            aPage.getByTestId('siteContextSelector').click();
            await this.delay(300);
        }
        try {
            await siteListbox.waitFor();
            await selectedSite.waitFor();
            await selectedSite.click({ timeout: 1000 });
        } catch {
            await this.waitForPageToBeCompletelyReady(aPage, 500);
            while (await siteListbox.isHidden()) {
                aPage.getByTestId('siteContextSelector').click();
                await this.delay(300);
            }
            await siteListbox.waitFor();
            selectedSite = siteListbox.getByRole('option', { name: aSite });
            await selectedSite.waitFor();
            await selectedSite.click({ timeout: 1000 });
        }
        await siteListbox.waitFor({ state: 'hidden' });
    }

    public static async selectScreen(aPage: Page, aScreen: Screen): Promise<void> {
        await aPage.getByTestId('tileMenuIcon').click();
        await aPage.waitForLoadState('domcontentloaded');
        const screenMenuBox = aPage.getByTestId('tileMenuIconMenuBox');
        await screenMenuBox.waitFor();
        await this.waitForPageToBeCompletelyReady(aPage);
        const selectedScreen = aPage.locator('//c3-toolbar-menu-item').getByText(aScreen.label, { exact: true });
        await selectedScreen.waitFor();
        await selectedScreen.click();
        await screenMenuBox.isHidden();
        if (aScreen.expectedText) {
            await aPage.locator(aScreen.expectedLocator).filter({ hasText: aScreen.expectedText }).waitFor();
        } else {
            await aPage.locator(aScreen.expectedLocator).first().waitFor();
        }
        await this.waitForAllProgressBarsToBeHidden(aPage);
        await this.waitForPageToBeCompletelyReady(aPage);
    }

    public static async getAllInputAndTextValues(aLocator: Locator): Promise<string[]> {
        const inputAndTextValues: string[] = [];
        inputAndTextValues.push(...(await this.getAllInputValues(aLocator)));
        inputAndTextValues.push(...(await this.getAllTextValues(aLocator)));
        return inputAndTextValues;
    }

    public static async getAllInputValues(aLocator: Locator): Promise<string[]> {
        const inputs = aLocator.locator('//input');
        const count = await inputs.count();
        const values: string[] = [];
        for (let i = 0; i < count; i++) {
            values.push(await inputs.nth(i).inputValue());
        }
        return values;
    }

    public static async getAllTextValues(aLocator: Locator): Promise<string[]> {
        return aLocator.allTextContents();
    }

    public static async closeSnackBarIfPresent(aPage: Page): Promise<void> {
        const snack = aPage.locator('//c3-snack');
        if (await snack.isVisible()) {
            await snack.locator('//button').first().click({ force: true }).catch(() => undefined);
        }
    }

    /** No-op in repro — QA watches console errors; Chromatic repro focuses on snapshots. */
    public static async watchForPageErrors(_aPage: Page): Promise<string[]> {
        return [];
    }

    public static async scrollVirtualListUntilElementVisible(
        aPage: Page,
        _aScrollDirection: 'Up' | 'Down',
        aSelectedElement: Locator,
        aLocatorToFocus?: Locator,
    ): Promise<void> {
        if (aLocatorToFocus) {
            await aLocatorToFocus.first().hover();
        }
        await aSelectedElement.scrollIntoViewIfNeeded();
        await aSelectedElement.waitFor();
        await aPage.waitForLoadState('networkidle').catch(() => undefined);
    }
}
