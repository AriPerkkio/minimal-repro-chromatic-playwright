import { expect, Locator, Page } from '@playwright/test';
import { HubUtils } from 'tests/hub/utils/hub.utils';

/** Trimmed PO search helpers for the Devex PO grid filters repro. */
export class POUtils {
    private static poWidget: Locator;
    private static poWidgetClearBtn: Locator;
    private static poWidgetDatagrid: Locator;
    private static poWidgetDatagridRows: Locator;
    private static poWidgetProgressBar: Locator;
    private static poWidgetSearchBtn: Locator;
    private static poWidgetSearchForm: Locator;

    public static async searchPO(aPage: Page): Promise<void> {
        await this.initiatePOElements(aPage);
        await this.poWidgetSearchForm.waitFor();
        await this.clearPOSearch(aPage);
        await this.poWidgetSearchBtn.click();
        await HubUtils.delay(500);
        await this.poWidgetProgressBar.waitFor({ state: 'hidden' });
        await HubUtils.delay(500);
        await this.poWidgetDatagrid.waitFor();
        await HubUtils.closeSnackBarIfPresent(aPage);
    }

    private static async clearPOSearch(aPage: Page): Promise<void> {
        await this.initiatePOElements(aPage);
        const matProgressBar = aPage.locator('//mat-progress-bar').first();
        await matProgressBar.waitFor({ state: 'hidden' });
        await this.poWidget.waitFor();
        await HubUtils.delay(300);
        await expect(this.poWidgetClearBtn).toBeEnabled();
        await this.poWidgetClearBtn.click();
        const poSearchFormValues = await HubUtils.getAllInputAndTextValues(this.poWidgetSearchForm);
        const poSearchFormValuesFiltered = poSearchFormValues.filter((item) => item !== '' && item !== 'on').slice(0, -1) as string[];
        expect(poSearchFormValuesFiltered).toHaveLength(0);
        await expect(this.poWidgetDatagrid.locator('.dx-data-row')).toHaveCount(0);
    }

    private static async initiatePOElements(aPage: Page): Promise<void> {
        this.poWidget = aPage.locator('//c3-widget-po-search');
        this.poWidgetClearBtn = this.poWidget.getByTestId('poClearButton');
        this.poWidgetDatagrid = this.poWidget.getByTestId('poSearchDataGrid');
        this.poWidgetDatagridRows = this.poWidgetDatagrid.locator('.dx-data-row');
        this.poWidgetProgressBar = aPage.locator('//mat-progress-bar');
        this.poWidgetSearchBtn = this.poWidget.getByTestId('poSearchButton').getByTestId('button');
        this.poWidgetSearchForm = this.poWidget.locator('//c3-dynamic-form');
    }
}
