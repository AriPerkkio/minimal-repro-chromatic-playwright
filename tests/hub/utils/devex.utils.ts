import * as DxFilterEnums from 'tests/hub/enums/dx-filter.enum';
import util from 'util';
import { ConfigLayoutsUtils } from 'tests/hub/utils/config-layouts.utils';
import { DateFormat, TimeFormat } from 'tests/hub/types/date.type';
import { DxColumnChooseDirection, DxFilterNumber, DXFilterSortDirection, DxFilterText } from 'tests/hub/enums/dx-filter.enum';
import { ErrorThrowMessage } from 'tests/hub/enums/error.enum';
import { expect, Locator, Page } from '@playwright/test';
import { FieldInterface, FieldLocator } from 'tests/hub/interfaces/field.interface';
import { FormatUtils } from 'tests/hub/utils/format.utils';
import { HubUtils } from 'tests/hub/utils/hub.utils';
import { LayoutAssigmentActionLayoutType } from 'tests/hub/types/config-layout.type';
import { TimeUtils } from 'tests/hub/utils/time.utils';

export class DevexUtils {
    public static calendar: Locator;
    public static calendarCaptionBtn: Locator;
    public static calendarDateViewDecade: Locator;
    public static calendarDateViewMonth: Locator;
    public static calendarDateViewYear: Locator;
    public static calendarOKBtn: Locator;
    public static calendarTimeView: Locator;
    public static colIndex: number;
    public static columnNames: string[];

    // Asserts a devex cell value (array supported for values of SAME column)
    public static async assertDevexCellValue(aPage: Page, aColumnName: string, aCellValues: string[]): Promise<void> {
        await this.initiateDevexBaseElements(aPage, aColumnName);

        for (const [rowIndex, option] of aCellValues.entries()) {
            await expect(
                aPage
                    .locator('.dx-datagrid-rowsview')
                    .locator('//tr[@aria-rowindex=' + (rowIndex + 1) + ']')
                    .locator('//td[@aria-colindex=' + this.colIndex + ']', { hasText: option }),
            ).toBeVisible();
        }
    }

    // Validates that a devex column name is visible in a generated report data grid (array supported)
    public static async assertDevexColumnNameVisibleInDataGrid(aPage: Page, aColumnNames: string[], aHiddenColumns?: string[]): Promise<void> {
        for (const option of aColumnNames) {
            await aPage
                .getByRole('columnheader', { name: 'Column ' + option, exact: true })
                .first()
                .waitFor();
        }
        if (aHiddenColumns) {
            for (const hiddenColumn of aHiddenColumns) {
                await aPage
                    .getByRole('columnheader', { name: 'Column ' + hiddenColumn, exact: true })
                    .first()
                    .waitFor({ state: 'hidden' });
            }
        }
    }

    // Assure que la liste des options du filtre sélectionné est présente dans sa globalité
    // À utiliser avec les méthodes qui interagissent avec les options de filtre
    private static async assertDevexFilterOptions(aPage: Page, anExpectedOptions: string[]): Promise<void> {
        const optionsInMenuCount = await aPage.getByRole('menu').locator('//li').count();
        expect(optionsInMenuCount).toEqual(anExpectedOptions.length);
        for (const option of anExpectedOptions) {
            await expect(aPage.getByRole('menu').getByText(option, { exact: true })).toBeVisible();
        }
    }

    // Validates that a devex row count is equal to the expected number provided
    public static async assertDevexRowCount(aPage: Page, anExpectedNumber: number): Promise<void> {
        await expect(aPage.locator('.dx-datagrid-rowsview').locator('.dx-data-row')).toHaveCount(anExpectedNumber);
    }

    // Validates that an entry is visible in a devex grid, regardless of the column
    public static async assertEntryIsVisibleInDevexGrid(aPage: Page, aDevexGrid: Locator, aEntry: string, isVisible: boolean = true): Promise<void> {
        await aDevexGrid
            .locator('.dx-data-row')
            .filter({ has: aPage.getByText(aEntry as string) })
            .first()
            .waitFor({ state: isVisible ? 'visible' : 'hidden' });
    }

    // Validates that an entry is visible in a devex tree
    // Supports array
    public static async assertEntryIsVisibleInDevexTree(
        aPage: Page,
        aDevexTree: Locator,
        aListOfEntriesAndVisibilities: { aEntry: string; isVisible: boolean }[],
    ): Promise<void> {
        for (const entryAndVisibility of aListOfEntriesAndVisibilities)
            await aDevexTree
                .locator('.tree-node')
                .filter({ has: aPage.getByText(entryAndVisibility.aEntry) })
                .first()
                .waitFor({ state: entryAndVisibility.isVisible ? 'visible' : 'hidden' });
    }

    // Asserts that a list of items are visible in a double list
    public static async assertItemsAreVisibleInDoubleList(
        aPage: Page,
        aList: Locator,
        aListOfItems: string[],
        isScrollIntoViewIfNeeded?: Boolean,
        aScrollSpeed?: number,
    ): Promise<void> {
        for (const option in aListOfItems) {
            const currentItem = aList.getByText(aListOfItems[option], { exact: true });
            await this.scrollListUntilElementVisible(aPage, currentItem, aList, isScrollIntoViewIfNeeded, aScrollSpeed);
            await expect(currentItem).toBeVisible();
        }
    }

    // Assertion pour valider le nombre d'items dans une grille
    // Si isExactMatch est à false, on valide que le nombre d'items est supérieur ou égal à l'expectedNumberOfItems
    // Si aColumnValue est fourni, on valide le nombre d'items qui contient la valeur de la colonne
    public static async assertNumberOfRowsInDevexGrid(
        aPage: Page,
        aDevexGrid: Locator,
        aExpectedNumberOfItems: number,
        isExactMatch: boolean = true,
        aColumnNameAndValue?: { columnName: string; columnValue: string; isColumnValueALocatorClass?: boolean },
    ): Promise<void> {
        let numberOfRows = aDevexGrid.locator('.dx-data-row');
        if (aColumnNameAndValue) {
            const columnIndex: number = await DevexUtils.getColumnIndex(aPage, aColumnNameAndValue.columnName);
            const baseLocator = aDevexGrid.locator('.dx-datagrid-rowsview').locator(`//td[@aria-colindex="${columnIndex}"]`);
            numberOfRows =
                typeof aColumnNameAndValue.columnValue === 'string'
                    ? baseLocator.filter({ hasText: aColumnNameAndValue.columnValue })
                    : baseLocator.locator(aColumnNameAndValue.columnValue as Locator);
            if (aColumnNameAndValue.isColumnValueALocatorClass) {
                numberOfRows = baseLocator.locator(aColumnNameAndValue.columnValue);
            }
        }
        // On attend que le nombre d'items soit égal ou supérieur à l'expectedNumberOfItems
        await expect.poll(async () => await numberOfRows.count())[isExactMatch ? 'toBe' : 'toBeGreaterThanOrEqual'](aExpectedNumberOfItems);
        await aDevexGrid.waitFor();
    }

    // Assertion pour valider la présence des valeurs dans une colonne sélectionnée dans une datagrid
    public static async assertPresenceOfValuesInSelectedColumn(
        aPage: Page,
        aColumnName: string,
        aCellValues: string[],
        isVisible: boolean = true,
    ): Promise<void> {
        await this.initiateDevexBaseElements(aPage, aColumnName);

        for (const [rowIndex, option] of aCellValues.entries()) {
            await aPage
                .locator('.dx-datagrid-rowsview')
                .locator('//tr[@aria-rowindex=' + (rowIndex + 1) + ']')
                .locator('//td[@aria-colindex=' + this.colIndex + ']', { hasText: option })
                .waitFor({ state: isVisible ? 'visible' : 'hidden' });
        }
    }

    // Assertion pour valider que les valeurs d'une rangée sélectionnée dans une datagrid sont bien affichées
    // Utilise la rangée déjà sélectionnée pour valider la présence des valeurs
    public static async assertPresenceOfValuesInSelectedRow(
        aDatagrid: Locator,
        aCellValues: (string | undefined)[],
        aFieldInterfaceValues?: { aFieldInterface: FieldInterface[]; aFieldLocator: FieldLocator[] },
    ): Promise<void> {
        const selectedRow = aDatagrid.locator('//tr[@aria-selected="true"]').first();
        const selectedRowValues = await selectedRow.locator('//td').allTextContents();
        for (const value of aCellValues) {
            expect(selectedRowValues).toContain(value);
        }
        if (aFieldInterfaceValues) {
            for (const fieldLocator of aFieldInterfaceValues.aFieldLocator) {
                const currentFieldInterfaceValue = aFieldInterfaceValues.aFieldInterface.find((item) => item.locator === fieldLocator)?.value as string;
                if (currentFieldInterfaceValue) {
                    expect(selectedRowValues).toContain(currentFieldInterfaceValue);
                }
            }
        }
    }

    // Clicks on an item's delete button in a devex grid
    public static async clickDevexItemDeleteBtn(aPage: Page, aItemName: string): Promise<void> {
        await HubUtils.waitForPageToBeCompletelyReady(aPage); // Délai de sureté
        const selectedItem = aPage
            .locator('.dx-data-row')
            .filter({ has: aPage.getByText(aItemName) })
            .first();
        let iconDelete: Locator = selectedItem.locator('.icon-trash').first();
        if (await iconDelete.isHidden()) {
            iconDelete = selectedItem.locator('.dx-icon-trash').first();
        }
        // Wait for the page to be completely ready before clicking on the delete button
        await iconDelete.click({ force: true });

        // Clicking on it should open a dialog, so we wait for it to be visible
        await aPage.locator('.cdk-overlay-pane').locator('//c3-alert').waitFor();
    }

    // Clicks on an item's edit button in a devex grid
    public static async clickDevexItemEditBtn(aPage: Page, aItemName: string): Promise<void> {
        await HubUtils.waitForPageToBeCompletelyReady(aPage); // Délai de sureté
        const selectedItem = aPage
            .locator('.dx-data-row')
            .filter({ has: aPage.getByText(aItemName) })
            .first();
        let iconEdit: Locator = selectedItem.locator('.icon-edit').first();
        if (await iconEdit.isHidden()) {
            iconEdit = selectedItem.locator('.dx-icon-edit').first();
        }
        // Wait for the page to be completely ready before clicking on the edit button
        await iconEdit.click({ force: true });

        // Clicking on it should open a dialog, so we wait for it to be visible
        await aPage.locator('.cdk-overlay-pane').locator('//c3-dialog').waitFor();
    }

    // Déplace une colonne de la grille vers le column chooser OU le contraire si on donne un index de colonne
    // Si on déplace du column chooser à la grille, on doit donner un index de colonne pour le drop
    // Si isReloadPage est à true, on reload la page pour s'assurer que les changements sont bien pris en compte (recommandé)
    public static async dragAndDropColumnToOrFromColumnChooser(
        aPage: Page,
        aDevexGrid: Locator,
        aColumnName: string,
        aDxColumnChooseDirection: DxColumnChooseDirection,
        aColumnIndexToDragOn?: number,
        isReloadPage: boolean = true,
    ): Promise<void> {
        const columnChooserBtn: Locator = aDevexGrid.locator('.dx-datagrid-column-chooser-button');
        const columnChooserPanel: Locator = aPage.locator('.dx-datagrid-column-chooser').locator('//div[@aria-label="Column Chooser"]');
        const columnInColumnChooser: Locator = columnChooserPanel.locator('.dx-column-chooser-item').getByText(aColumnName);
        const devexGridColumnHeader: Locator = aDevexGrid.getByRole('columnheader', { name: 'Column ' + aColumnName, exact: true });

        // Valide la présence (ou non) de la colonne dans la grille devex selon la direction donnée
        await devexGridColumnHeader.waitFor({
            state: aDxColumnChooseDirection === DxColumnChooseDirection.FROM_COLUMN_CHOOSER_TO_COLUMN ? 'hidden' : 'visible',
        });

        // Ouvre le column chooser si ce n'est pas déjà fait
        if (await columnChooserPanel.isHidden()) {
            await columnChooserBtn.click({ force: true });
        }
        await columnChooserPanel.waitFor();

        // Valide la présence (ou non) de la colonne dans le column chooser selon la direction donnée
        await columnInColumnChooser.waitFor({
            state: aDxColumnChooseDirection === DxColumnChooseDirection.FROM_COLUMN_TO_COLUMN_CHOOSER ? 'hidden' : 'visible',
        });
        await HubUtils.waitForPageToBeCompletelyReady(aPage); // Délai de sureté

        // Selon la direction donnée, on déplace la colonne de la grille vers le column chooser OU le contraire
        if (aDxColumnChooseDirection === DxColumnChooseDirection.FROM_COLUMN_TO_COLUMN_CHOOSER) {
            await devexGridColumnHeader.dragTo(columnChooserPanel);
            await devexGridColumnHeader.waitFor({ state: 'hidden' });
            await columnInColumnChooser.waitFor();
        } else if (aDxColumnChooseDirection === DxColumnChooseDirection.FROM_COLUMN_CHOOSER_TO_COLUMN) {
            if (!aColumnIndexToDragOn) {
                throw new Error(util.format(ErrorThrowMessage.DEVEX_MISSING_COLUMN_INDEX));
            } else {
                const devexGridColumnIndexToDragOn = aDevexGrid.locator(`td[aria-colindex="${aColumnIndexToDragOn}"]`).first();
                await columnInColumnChooser.dragTo(devexGridColumnIndexToDragOn);
                await columnInColumnChooser.waitFor({ state: 'hidden' });
                await devexGridColumnHeader.waitFor();
            }
        }

        // Valide que la colonne est bien déplacée dans la grille devex selon la direction donnée en rechargeant la page
        if (isReloadPage) {
            await aPage.reload();
            await HubUtils.waitForPageToBeCompletelyReady(aPage, 500);
            await devexGridColumnHeader.waitFor({
                state: aDxColumnChooseDirection === DxColumnChooseDirection.FROM_COLUMN_CHOOSER_TO_COLUMN ? 'visible' : 'hidden',
            });
            if (await columnChooserPanel.isHidden()) {
                await columnChooserBtn.click();
            }
            await columnChooserPanel.waitFor();
            await columnInColumnChooser.waitFor({
                state: aDxColumnChooseDirection === DxColumnChooseDirection.FROM_COLUMN_TO_COLUMN_CHOOSER ? 'visible' : 'hidden',
            });
        }
    }

    // Modifie la largeur d'une colonne d'une grille devex
    public static async editDevexColumnWidth(aPage: Page, aDatagrid: Locator, aColumnName: string, aSlideDistance: number): Promise<void> {
        // Identifie la colonne à modifier
        const selectedColumn: Locator = aDatagrid
            .locator('.dx-datagrid-drag-action')
            .filter({ has: aPage.getByText(aColumnName) })
            .first();

        // Identifie la section à dragger (le côté droit)
        const columnRightEdgeCoordinates: { x: number; y: number; width: number } = await this.getDevexColumnRightEdgeDragHandle(selectedColumn);
        await HubUtils.waitForPageToBeCompletelyReady(aPage);

        // Simule le click et le glissement du côté droit de la colonne
        await aPage.mouse.move(columnRightEdgeCoordinates.x - 2, columnRightEdgeCoordinates.y);
        await aPage.mouse.down();
        await aPage.mouse.move(columnRightEdgeCoordinates.x + aSlideDistance, columnRightEdgeCoordinates.y, { steps: 10 });
        await aPage.mouse.up();

        // Attend que la colonne soit modifiée
        await selectedColumn.waitFor();
        await HubUtils.waitForPageToBeCompletelyReady(aPage);
    }

    // Remplit les valeurs dans un devex grid à partir du titre de la colonne
    // Demande un FieldInterface avec des locators utilisant des labels
    public static async fillValuesInDevexGrid(aDevexGrid: Locator, aSelectedLine: Locator, aFieldInterface: FieldInterface[]): Promise<void> {
        const devexGridColumnHeaders = await aDevexGrid.getByRole('columnheader').locator('//div').allTextContents();
        const devexGridColumnHeadersFiltered = devexGridColumnHeaders.filter((item) => item !== '');
        for (const field of aFieldInterface) {
            const columnIndex = devexGridColumnHeadersFiltered.indexOf(field.locator.label as string) + 1;
            let currentCell = aSelectedLine.locator(`//td[@aria-colindex="${columnIndex}"]`).locator('//input').first();
            if ((await currentCell.getAttribute('type')) === 'hidden') {
                currentCell = aSelectedLine.locator(`//td[@aria-colindex="${columnIndex}"]`).locator('//input').nth(1);
            }
            await currentCell.clear();
            await currentCell.fill(field.value as string);
            expect(await currentCell.inputValue()).toBe(field.value as string);
        }
    }

    // Retourne la cellule d'une grille de permissions selon le nom de colonne et de ligne passé
    public static async getCell(aPage: Page, aColumnName: string, aRowName: string): Promise<Locator> {
        const columnIndex: number = await this.getColumnIndex(aPage, aColumnName);
        const rowIndex: number = await this.getRowIndex(aPage, aRowName);
        return aPage.locator(`//tr[@aria-rowindex="${rowIndex}"]`).locator(`//td[@aria-colindex="${columnIndex}"]`);
    }

    // Gets the column index of a devex grid
    public static async getColumnIndex(aPage: Page, expectedColumnLabel: string): Promise<number> {
        const colIndex = await aPage
            .locator('//dx-data-grid')
            .locator('.dx-header-row')
            .locator(`td[aria-label="Column ${expectedColumnLabel}"]`)
            .getAttribute('aria-colindex');
        if (colIndex && !isNaN(+colIndex)) {
            return +colIndex;
        }
        return -1;
    }

    // Retourne la cellule d'une grille d'assignation de layout basé sur le nom du sub-family/workflow type (lignes) et de la compagnie (colonnes)
    public static async getLayoutAssignmentCell(
        aPage: Page,
        aLayoutAssigmentActionLayoutType: LayoutAssigmentActionLayoutType,
        aCompanyType: string,
    ): Promise<Locator> {
        await ConfigLayoutsUtils.initiateLayoutAssignmentsTabElements(aPage);
        await ConfigLayoutsUtils.layoutAssignmentApplicationPlaceGrid.waitFor();

        // On identifie la ligne du sub-family/workflow type
        const rowIndex: number = await this.getLayoutAssignmentTypeIndex(aPage, aLayoutAssigmentActionLayoutType);

        // On identifie la ligne de la compagnie
        const columnIndex: number = await this.getColumnIndex(aPage, aCompanyType);

        // Finalement, on retourne la cellule
        return ConfigLayoutsUtils.layoutAssignmentApplicationPlaceGrid
            .locator(`//tr[@aria-rowindex=${rowIndex}]`)
            .locator(`//td[@aria-colindex=${columnIndex}]`)
            .locator('//c3-application-place-layout-renderer');
    }

    // Trouve l'index de la ligne d'une grille Devex
    public static async getRowIndex(aPage: Page, expectedRowLabel: string, aSpecificDatagrid?: Locator): Promise<number> {
        const currentDatagrid: Locator = aSpecificDatagrid ? aSpecificDatagrid : aPage.locator('//dx-data-grid');
        const selectedRow: Locator = currentDatagrid
            .locator('.dx-data-row')
            .filter({ has: aPage.getByText(expectedRowLabel) })
            .first();
        const selectedRowIndex: number = Number(await selectedRow.getAttribute('aria-rowindex'));
        if (selectedRowIndex && !isNaN(+selectedRowIndex) && selectedRowIndex !== -1) {
            return +selectedRowIndex;
        }
        throw new Error(util.format(ErrorThrowMessage.DEVEX_ROW_NOT_FOUND, expectedRowLabel, aSpecificDatagrid?.toString() ?? ''));
    }

    // Trouve l'index de la ligne d'une grille Devex basé sur le nom de la colonne et la valeur de la cellule de test d'attribut data-e2e
    public static async getRowIndexByColumnNameAndDataE2EValue(
        aPage: Page,
        aDatagrid: Locator,
        aColumnName: string,
        aDataE2EValue: string,
        aRowValue: string,
    ): Promise<number> {
        const selectedColumnIndex: number = await this.getColumnIndex(aPage, aColumnName);
        const allTextEntriesBasedOnDataE2EValue: string[] = await aDatagrid
            .locator(`//td[@aria-colindex="${selectedColumnIndex}"]`)
            .getByTestId(aDataE2EValue)
            .allTextContents();
        const rowIndex: number = allTextEntriesBasedOnDataE2EValue.indexOf(aRowValue);
        if (rowIndex === -1) {
            throw new Error(util.format(ErrorThrowMessage.DEVEX_ROW_NOT_FOUND, aColumnName, aDataE2EValue, aRowValue));
        }
        return rowIndex + 1;
    }

    // Initie les constantes globales de calendrier Devex
    public static async initiateDevexCalendarElements(aPage: Page): Promise<void> {
        this.calendar = aPage
            .locator('.dx-calendar')
            .filter({ has: aPage.locator(':visible') })
            .first();
        this.calendarCaptionBtn = aPage
            .locator('.dx-popup-wrapper .dx-calendar-caption-button')
            .filter({ has: aPage.locator(':visible') })
            .first();
        this.calendarDateViewDecade = aPage
            .locator('.dx-calendar-view-decade')
            .filter({ has: aPage.locator(':visible') })
            .first();
        this.calendarDateViewMonth = aPage
            .locator('.dx-calendar-view-month')
            .filter({ has: aPage.locator(':visible') })
            .first();
        this.calendarDateViewYear = aPage
            .locator('.dx-calendar-view-year')
            .filter({ has: aPage.locator(':visible') })
            .first();
        this.calendarOKBtn = aPage.locator('.dx-overlay-content').getByRole('button', { name: 'OK' });
        this.calendarTimeView = aPage
            .locator('.dx-timeview')
            .filter({ has: aPage.locator(':visible') })
            .first();
    }

    // Réinitialise un filtre de colonne spécifique dans la grille Devex PO
    public static async resetFilterHeader(aPage: Page, aColumnName: string): Promise<void> {
        const { headerFilterMenu, headerFilterMenuSelectAllCheckbox, headerFilterMenuOkBtn } = await this.openHeaderFilterMenu(aPage, aColumnName);

        await this.resetSelectAllCheckbox(aPage, headerFilterMenuSelectAllCheckbox);

        await headerFilterMenuOkBtn.click();
        await headerFilterMenu.waitFor({ state: 'hidden' });
        await HubUtils.resetFieldFocus(aPage);
    }

    // Réinitialise un filtre de colonne spécifique dans la grille Devex PO
    public static async resetFilterOption(aPage: Page, aColumnName: string): Promise<void> {
        await this.selectFilterOptions(aPage, aColumnName, 'Reset');
        await HubUtils.resetFieldFocus(aPage);
    }

    // Réinitialise la valeur d'input de filtrage d'une colonne de grille
    public static async resetFilterValue(aPage: Page, aColumnName: string): Promise<void> {
        const columnIndex = await DevexUtils.getColumnIndex(aPage, aColumnName);
        await aPage.locator(`td[aria-colindex="${columnIndex}"] > .dx-editor-with-menu`).locator('.dx-texteditor-input-container').locator('//input').clear();
        await HubUtils.resetFieldFocus(aPage);
    }

    // Sélectionne un cellule dans un scheduler navigator
    public static async selectCellInSchedulerNavigator(
        aPage: Page,
        aInitialCalendarView: Locator,
        aCell: string,
        aExpectedCalendarView?: Locator,
    ): Promise<void> {
        await this.initiateDevexCalendarElements(aPage);

        await aInitialCalendarView
            .locator('.dx-calendar-cell')
            .filter({ has: aPage.getByText(aCell) })
            .first()
            .click();
        if (aExpectedCalendarView) {
            await aExpectedCalendarView.waitFor();
        } else {
            const c3toolbar: Locator = aPage.locator('//c3-toolbar');
            const dxtoolbar: Locator = aPage.locator('//dx-toolbar');
            if (await c3toolbar.isVisible()) {
                await c3toolbar.click();
            } else if (await dxtoolbar.isVisible()) {
                await dxtoolbar.click();
            }
            await HubUtils.waitForPageToBeCompletelyReady(aPage);
            await DevexUtils.calendar.waitFor({ state: 'hidden' });
        }
    }

    // Sélectionne une date dans un scheduler Devex
    public static async selectDateInScheduler(aPage: Page, aScheduler: Locator, aDate: DateFormat): Promise<void> {
        await this.initiateDevexCalendarElements(aPage);
        await aScheduler.waitFor();

        // Avant tout, on identifie les éléments de la date à sélectionner
        let selectedDay: string = aDate.split('/')[1];
        let selectedMonth: string = aDate.split('/')[0];
        const selectedYear: string = aDate.split('/')[2];

        // Clique sur le bouton Schedule Navigator pour ouvrir le calendar chooser si ce n'est pas déjà fait
        if (await this.calendar.isHidden()) {
            await aScheduler.locator('.dx-scheduler-navigator-caption').click();
        }
        await this.calendar.waitFor();

        // Si on est pas sur la vue multi-année, on clique sur le bouton de période jusqu'à ce qu'on le voit
        // On peut avoir besoin de cliquer plusieurs fois pour se rendre au root
        let decadeAttempts: number = 0;
        let decadeAttemptsMax: number = 5;
        while ((await this.calendarDateViewDecade.isHidden()) && decadeAttempts < decadeAttemptsMax) {
            await this.calendarCaptionBtn.click();
            await HubUtils.waitForPageToBeCompletelyReady(aPage);
            decadeAttempts++;
        }
        if (decadeAttempts >= 5) {
            throw new Error(util.format(ErrorThrowMessage.DEVEX_CALENDAR_DATE_VIEW_DECADE_NOT_FOUND, decadeAttemptsMax));
        }
        await this.calendarDateViewDecade.waitFor();

        // Sélectionne l'année
        await this.selectCellInSchedulerNavigator(aPage, this.calendarDateViewDecade, selectedYear, this.calendarDateViewYear);

        // Sélectionne le mois
        selectedMonth = await FormatUtils.getMonthNameAbv(selectedMonth);
        await this.selectCellInSchedulerNavigator(aPage, this.calendarDateViewYear, selectedMonth, this.calendarDateViewMonth);

        // Sélectionne le jour (le calendrier va se fermer automatiquement par la suite)
        selectedDay.startsWith('0') ? (selectedDay = selectedDay.slice(1)) : selectedDay;
        await this.selectCellInSchedulerNavigator(aPage, this.calendarDateViewMonth, selectedDay);
        await aScheduler.waitFor();
    }

    // Selects a devex row according to the given column name
    public static async selectDevexRow(
        aPage: Page,
        aColumnName: string,
        aSelectedValue: string,
        aColumnIndexDifferential?: number,
        aLocatorToFocus?: Locator,
        isCtrlKey: boolean = false,
    ): Promise<void> {
        await this.initiateDevexBaseElements(aPage, aColumnName);

        let colIndex = this.colIndex;
        if (aColumnIndexDifferential) {
            colIndex = this.colIndex + aColumnIndexDifferential;
        }
        const selectedValue = aPage.locator('//td[@aria-colindex=' + colIndex + ']', { hasText: aSelectedValue }).first();
        if (await selectedValue.isHidden()) {
            await HubUtils.scrollVirtualListUntilElementVisible(aPage, 'Down', selectedValue, aLocatorToFocus);
            await HubUtils.scrollVirtualListUntilElementVisible(aPage, 'Up', selectedValue, aLocatorToFocus);
        }
        await selectedValue.waitFor();
        await aPage.keyboard.down(isCtrlKey ? 'Control' : 'Shift');
        await selectedValue.click();
        await aPage.keyboard.up(isCtrlKey ? 'Control' : 'Shift');
        await HubUtils.waitForPageToBeCompletelyReady(aPage, 600);
    }

    /// Sélectionne une date (et/ou temps) de calendrier pour une filtration de colonne grille
    public static async selectFilterCalendarDate(
        aPage: Page,
        aColumnName: string,
        aListofSingleAndMultiCalendarDateTimes: {
            aSingleCalendarDateTime?: { calendarDate?: DateFormat; calendarTime?: TimeFormat };
            aMultiCalendarDateTime?: {
                end?: { calendarDate?: DateFormat; calendarTime?: TimeFormat };
                start?: { calendarDate?: DateFormat; calendarTime?: TimeFormat };
            };
        },
    ): Promise<void> {
        const columnIndex: number = await DevexUtils.getColumnIndex(aPage, aColumnName);
        const selectedColumn = aPage.locator(`//td[@aria-colindex="${columnIndex}"]`);
        const selectedColumnCalendarBtnSingle = selectedColumn.getByRole('button', { name: 'Select' });
        const selectedColumnCalendarBtnMultiEnd = aPage.locator('.dx-datagrid-filter-range-end').getByRole('button', { name: 'Select' });
        const selectedColumnCalendarBtnMultiStart = aPage.locator('.dx-datagrid-filter-range-start').getByRole('button', { name: 'Select' });

        // Gérer le mode simple
        if (aListofSingleAndMultiCalendarDateTimes.aSingleCalendarDateTime) {
            await this.handleSingleDateTimeSelection(aPage, selectedColumnCalendarBtnSingle, aListofSingleAndMultiCalendarDateTimes.aSingleCalendarDateTime);
        }

        // Gérer le mode multiple (start + end)
        if (aListofSingleAndMultiCalendarDateTimes.aMultiCalendarDateTime) {
            await this.handleMultiDateTimeSelection(
                aPage,
                selectedColumnCalendarBtnMultiStart,
                selectedColumnCalendarBtnMultiEnd,
                selectedColumn,
                aListofSingleAndMultiCalendarDateTimes.aMultiCalendarDateTime,
            );
        }

        await HubUtils.resetFieldFocus(aPage);
    }

    // Sélectionne une ou des options de filtration de grille
    // Cette méthode est compatible avec les types de filtres donnés sous le fichier dx-filters.enum
    public static async selectFilterOptions(aPage: Page, aColumnName: string, anOptionToSelect: DxFilterNumber | DxFilterText | string): Promise<void> {
        const columnIndex = await DevexUtils.getColumnIndex(aPage, aColumnName);

        // Ouvre le menu de filtre pour la colonne sélectionnée
        const filterOptionsBtn = aPage.locator(`td[aria-colindex="${columnIndex}"]`).locator('.dx-menu-item').first();
        const filterOptionsMenu = aPage.getByRole('menu');
        while (await filterOptionsMenu.isHidden()) {
            await HubUtils.delay(150);
            await filterOptionsBtn.hover();
            await HubUtils.delay(150);
        }

        // On assure que la liste des options du filtre sélectionné est présente dans sa globalité
        if (typeof anOptionToSelect === 'string') {
            // Si l'option est une string, on la sélectionne directement plutôt que de valider les options
        } else {
            const enumValues = this.getAllDxFilterValues(anOptionToSelect);
            await this.assertDevexFilterOptions(aPage, enumValues);
        }

        // Ensuite, on sélectionne l'option de filtre
        await filterOptionsMenu.getByText(anOptionToSelect, { exact: true }).click();
        await filterOptionsMenu.waitFor({ state: 'hidden' });
        await HubUtils.delay(300); // Pause pour éviter des clics trop rapides
    }

    // Ouvre le popup de checkbox de valeurs voulues, et les sélectionne
    public static async selectHeaderFilter(aPage: Page, aColumnName: string, aFilteredValues: string[]): Promise<void> {
        const { headerFilterMenu, headerFilterMenuSelectAllCheckbox, headerFilterMenuOkBtn } = await this.openHeaderFilterMenu(aPage, aColumnName);

        // Réinitialiser la sélection pour éviter des états de filtre imprévus
        await this.resetSelectAllCheckbox(aPage, headerFilterMenuSelectAllCheckbox);

        // Si des valeurs sont fournies, les sélectionner
        if (aFilteredValues.length) {
            for (const filteredValue of aFilteredValues) {
                await aPage.locator('.dx-popup-content').getByText(filteredValue).click();
                await HubUtils.delay(300); // Pause pour éviter des clics trop rapides
            }
        }

        await headerFilterMenuOkBtn.click();
        await headerFilterMenu.waitFor({ state: 'hidden' });
        await HubUtils.resetFieldFocus(aPage);
    }

    // Selects an item from a double list (array supported)
    public static async selectItemsFromDoubleList(aPage: Page, aList: Locator, aListOfItems: string[]): Promise<void> {
        await aPage.keyboard.down('Control');
        for (const option in aListOfItems) {
            const aSelectedItem = aList.getByText(aListOfItems[option], { exact: true });
            await this.scrollListUntilElementVisible(aPage, aSelectedItem, aList);
            await aSelectedItem.click();
            const aSelectedItemParent = aSelectedItem.locator('..');
            await aSelectedItemParent.waitFor();
            expect(await aSelectedItemParent.getAttribute('aria-selected')).toBe('true');
        }
        await aPage.keyboard.up('Control');
    }

    // Entre une valeur dans le champ de filtration.
    // Le quatrième param est la première valeur qu'on s'attend à apparaître une fois la valeur de filtration entrée.
    // Le besoin de cette valeur est causé par le fait que la filtration prend quelques secondes à se faire.
    public static async setFilterValue(aPage: Page, aColumnName: string, aValue: string, aExpectedFirstValue?: string): Promise<void> {
        const columnIndex = await DevexUtils.getColumnIndex(aPage, aColumnName);
        await aPage
            .locator(`td[aria-colindex="${columnIndex}"] > .dx-editor-with-menu`)
            .locator('.dx-texteditor-input-container')
            .locator('//input')
            .fill(aValue);
        if (aExpectedFirstValue) {
            const expectedFirstValue = aPage
                .getByTestId('poSearchDataGrid')
                .locator('.dx-data-row')
                .nth(0)
                .locator(`td[aria-colindex="${await DevexUtils.getColumnIndex(aPage, 'PO #')}"]`)
                .getByText(aExpectedFirstValue);
            if (await expectedFirstValue.isHidden()) {
                await expectedFirstValue.scrollIntoViewIfNeeded();
            }
            await expectedFirstValue.isVisible();
        }
        await aPage.locator('//dx-data-grid').first().waitFor();
        await HubUtils.delay(500);
    }

    /**
     * This will scroll (using mouse wheel inputs). If the element is not found in 20 tries, it exits the loops
     *
     * @param aPage - The page
     * @param anElementLocator - Element we need to scroll at
     * @param aFocusElement - Element to focus (datagrid, cell, row, etc) that lets us scroll with PageDown afterwards
     * @Optional @param isScrollIntoViewIfNeeded - Only if needed : Final scroll on the element
     */
    public static async scrollListUntilElementVisible(
        aPage: Page,
        aSelectedElement: Locator,
        aFocusElement: Locator,
        isScrollIntoViewIfNeeded?: Boolean,
        aScrollSpeed: number = 500,
    ): Promise<void> {
        // Focus the element if needed
        if (aFocusElement) {
            await aFocusElement.first().waitFor();
            await aFocusElement.first().hover();
        }
        // Scroll down first if element not found yet
        await this.safeScroll(aPage, 'Down', aSelectedElement, aScrollSpeed);
        // Scroll up second if element not found yet
        await this.safeScroll(aPage, 'Up', aSelectedElement, aScrollSpeed);
        // After scrolling, we wait for it to be attached to the DOM and we focus on it
        await aSelectedElement.waitFor({ state: 'attached' });
        await aSelectedElement.focus();

        // Certain lists need another scrollIntoViewIfNeeded here, so we pass it as a parameter if needed
        if (isScrollIntoViewIfNeeded) {
            await aSelectedElement.scrollIntoViewIfNeeded();
        }
    }

    // Ordonne une colonne de grille par ordre croissant ou décroissant
    public static async sortColumn(
        aPage: Page,
        aDevexGrid: Locator,
        aColumnName: string,
        aDXFilterSortDirection: DXFilterSortDirection,
        aExpectedFirstValue?: string,
    ): Promise<void> {
        const columnHeader = aDevexGrid.getByRole('columnheader', { name: 'Column ' + aColumnName, exact: true });
        const columnHeaderFilterIndicator = columnHeader.locator('.dx-header-filter-indicator');
        const columnHeaderSortAscending = columnHeader.locator('.dx-sort-up');
        const columnHeaderSortDescending = columnHeader.locator('.dx-sort-down');
        switch (aDXFilterSortDirection) {
            case DXFilterSortDirection.ASCENDING:
                while (await columnHeaderSortAscending.isHidden()) {
                    await columnHeaderFilterIndicator.click();
                    await HubUtils.delay(350);
                }
                break;
            case DXFilterSortDirection.DESCENDING:
                while (await columnHeaderSortDescending.isHidden()) {
                    await columnHeaderFilterIndicator.click();
                    await HubUtils.delay(350);
                }
                break;
            default:
                throw new Error(util.format(ErrorThrowMessage.DEVEX_INVALID_SORT_DIRECTION));
        }
        if (aExpectedFirstValue) {
            const columnIndex = await DevexUtils.getColumnIndex(aPage, aColumnName);
            await aPage.locator('.dx-data-row').nth(0).locator(`td[aria-colindex="${columnIndex}"]`).getByText(aExpectedFirstValue).waitFor();
        }
    }

    // Désélectionne toutes les rangées sélectionnées dans un datagrid
    public static async unselectAllSelectedItemsInDatagrid(aDatagrid: Locator): Promise<void> {
        const selectedDataRows = await aDatagrid.locator('//tr[@aria-selected="true"]').all();
        for (const selectedDataRow of selectedDataRows) {
            const currentRowIndex = await selectedDataRow.getAttribute('aria-rowindex');
            await selectedDataRow.locator('.dx-command-select').click();
            await aDatagrid.waitFor();
            await expect(aDatagrid.locator(`//tr[@aria-rowindex="${currentRowIndex}"]`).getAttribute('aria-selected')).resolves.toBe('false');
        }
    }

    // Méthode privée pour obtenir les valeurs des enums DxFilter
    private static getAllDxFilterValues(anOption: DxFilterNumber | DxFilterText): string[] {
        // Iterate through all exports from the Enums module
        for (const [key, value] of Object.entries(DxFilterEnums)) {
            // Check if the export is an enum by verifying it's an object with string values
            if (typeof value === 'object' && Object.values(value).includes(anOption)) {
                return Object.values(value);
            }
        }
        throw new Error(ErrorThrowMessage.DEVEX_INVALID_SORT_DIRECTION);
    }

    // Méthode privée qui retourne les coordonnées du côté droit d'une colonne devex
    private static async getDevexColumnRightEdgeDragHandle(aColumn: Locator): Promise<{ x: number; y: number; width: number }> {
        // Scroll la colonne dans la viewport si nécessaire
        await aColumn.scrollIntoViewIfNeeded();
        await aColumn.waitFor();

        // Récupère la bounding box de la colonne
        const box: { x: number; y: number; width: number; height: number } | null = await aColumn.boundingBox();
        if (!box) {
            const columnIdentifier: string = (await aColumn.textContent())?.trim() || aColumn.toString();
            throw new Error(util.format(ErrorThrowMessage.DEVEX_COLUMN_BOUNDING_BOX_NOT_FOUND, columnIdentifier));
        }

        // Bord droit (x + width), centre vertical (y + height / 2)
        const rightEdgeX: number = box.x + box.width;
        const centerY: number = box.y + box.height / 2;

        // Retourne les coordonnées du côté droit de la colonne
        return { x: rightEdgeX, y: centerY, width: box.width };
    }

    // Méthode privée qui retourne l'index du type de layout dans la grille d'assignation de layout
    private static async getLayoutAssignmentTypeIndex(aPage: Page, aLayoutAssigmentActionLayoutType: LayoutAssigmentActionLayoutType): Promise<number> {
        await ConfigLayoutsUtils.initiateLayoutAssignmentsTabElements(aPage);
        await ConfigLayoutsUtils.layoutAssignmentApplicationPlaceGrid.waitFor();

        // On valide au départ qu'au moins un sub-family ou workflow type est fourni et ensuite, on identifie la ligne de type
        let selectedTypeRow: Locator = aPage.getByText(''); // On initialise à une valeur vide pour éviter les erreurs de compilation
        if (
            (!aLayoutAssigmentActionLayoutType.subFamily && !aLayoutAssigmentActionLayoutType.workflowType) ||
            (aLayoutAssigmentActionLayoutType.subFamily && aLayoutAssigmentActionLayoutType.workflowType)
        ) {
            throw new Error(ErrorThrowMessage.DEVEX_INVALID_ASSIGNMENT_TYPE_INDEX);
        } else if (aLayoutAssigmentActionLayoutType.subFamily) {
            selectedTypeRow = ConfigLayoutsUtils.layoutAssignmentApplicationPlaceGrid
                .locator('.dx-data-row')
                .filter({ has: aPage.locator('.indent-subFamily', { hasText: aLayoutAssigmentActionLayoutType.subFamily }).first() })
                .first();
        } else if (aLayoutAssigmentActionLayoutType.workflowType) {
            selectedTypeRow = ConfigLayoutsUtils.layoutAssignmentApplicationPlaceGrid
                .locator('.dx-data-row')
                .filter({ has: aPage.locator('.indent-wfType', { hasText: aLayoutAssigmentActionLayoutType.workflowType }).first() })
                .first();
        }

        // Retourne l'index de la ligne sélectionnée
        return Number(await selectedTypeRow.getAttribute('aria-rowindex'));
    }

    // Méthode privée pour gérer la sélection de date/heure simple
    private static async handleSingleDateTimeSelection(
        aPage: Page,
        aCalendarBtn: Locator,
        aSingleDateTime: { calendarDate?: DateFormat; calendarTime?: TimeFormat },
    ): Promise<void> {
        await this.initiateDevexCalendarElements(aPage);

        // Ouvrir le calendrier et sélectionner la date et temps si fournis
        await this.calendar.waitFor({ state: 'hidden' });
        await aCalendarBtn.click();
        await this.calendar.waitFor();
        if (aSingleDateTime.calendarDate) {
            await this.selectDate(aPage, aSingleDateTime.calendarDate);
        }
        if (aSingleDateTime.calendarTime) {
            await this.selectTime(aPage, aSingleDateTime.calendarTime, true);
        }

        // Ferme le calendrier datetime (si ce n'est pas déjà fait automatiquement)
        if (await this.calendarOKBtn.isVisible()) {
            await this.calendarOKBtn.click();
        }
        await this.calendar.waitFor({ state: 'hidden' });
    }

    // Méthode privée pour gérer la sélection de date/heure multiple
    private static async handleMultiDateTimeSelection(
        aPage: Page,
        aCalendarBtnStart: Locator,
        aCalendarBtnEnd: Locator,
        selectedColumn: Locator,
        multiDateTime: { start?: { calendarDate?: DateFormat; calendarTime?: TimeFormat }; end?: { calendarDate?: DateFormat; calendarTime?: TimeFormat } },
    ): Promise<void> {
        const filterRange = aPage.locator('.dx-datagrid-filter-range-start').locator('..');

        // Ouvrir le calendrier du range
        await filterRange.waitFor({ state: 'hidden' });
        await selectedColumn.locator('.dx-filter-range-content').click();
        await filterRange.waitFor();

        // Gère le clic du bouton calendrier selon start ou end
        const handleCalendarInteraction = async (calendarBtn: Locator, calendarDate?: DateFormat, calendarTime?: TimeFormat, isStart: boolean = false) => {
            // Ouvre le calendrier et sélectionne la date et temps si fournis
            if (calendarDate || calendarTime) {
                if (await this.calendar.isHidden()) {
                    await calendarBtn.click();
                }
                await this.calendar.waitFor();

                if (calendarDate) {
                    await this.selectDate(aPage, calendarDate);
                }
                if (calendarTime) {
                    await this.selectTime(aPage, calendarTime, isStart);
                }
            }

            // Ferme le calendrier datetime (si ce n'est pas déjà fait automatiquement)
            if (await this.calendarOKBtn.isVisible()) {
                await this.calendarOKBtn.click();
            }
            await this.calendar.waitFor({ state: 'hidden' });
        };

        // Gère le start date and time
        await handleCalendarInteraction(aCalendarBtnStart, multiDateTime.start?.calendarDate, multiDateTime.start?.calendarTime, true);

        // Gère le end date and time
        await handleCalendarInteraction(aCalendarBtnEnd, multiDateTime.end?.calendarDate, multiDateTime.end?.calendarTime, false);
    }

    // Initie les constantes de base Devex
    private static async initiateDevexBaseElements(aPage: Page, aColumnName?: string): Promise<void> {
        this.columnNames = await aPage.getByRole('columnheader').locator('.dx-datagrid-text-content').allTextContents();
        if (aColumnName) {
            const colIndex: number = this.columnNames.indexOf(aColumnName);
            if (colIndex === -1) {
                throw new Error(util.format(ErrorThrowMessage.DEVEX_COLUMN_NOT_FOUND, aColumnName, this.columnNames.join(', ')));
            } else {
                this.colIndex = colIndex + 1;
            }
        }
    }

    // Méthode privée pour naviguer dans le calendrier sans sélectionner l'année
    private static async navigateToCalendarViews(aPage: Page): Promise<void> {
        await this.initiateDevexCalendarElements(aPage);

        for (const view of [this.calendarDateViewMonth, this.calendarDateViewYear]) {
            await view.waitFor();
            await this.calendarCaptionBtn.click();
            await view.waitFor({ state: 'hidden' });
        }
    }

    // Ouvre le menu de filtre du header et retourne les éléments communs
    private static async openHeaderFilterMenu(
        aPage: Page,
        aColumnName: string,
    ): Promise<{ headerFilterMenu: Locator; headerFilterMenuSelectAllCheckbox: Locator; headerFilterMenuOkBtn: Locator }> {
        const columnIndex = await DevexUtils.getColumnIndex(aPage, aColumnName);
        const selectedHeaderFilter = aPage.locator(`td[aria-colindex="${columnIndex}"]`).locator('.dx-header-filter').last();

        await selectedHeaderFilter.click();

        const headerFilterMenu = aPage.locator('//div[@aria-label="Filter options"]').first();
        await headerFilterMenu.waitFor();

        const headerFilterMenuSelectAllCheckbox = headerFilterMenu.locator('.dx-list-select-all-checkbox').first();
        const headerFilterMenuOkBtn = headerFilterMenu.getByRole('button', { name: 'OK' });

        return { headerFilterMenu, headerFilterMenuSelectAllCheckbox, headerFilterMenuOkBtn };
    }

    // Réinitialise la checkbox "Select All" pour réinitialiser le filtre
    private static async resetSelectAllCheckbox(aPage: Page, headerFilterMenuSelectAllCheckbox: Locator): Promise<void> {
        // Utilisation de while pour gérer l'état "mixed"
        let whileFailSafe = 0;
        while (!(await aPage.locator('.dx-popup-content').locator('.dx-list-select-all-checkbox[aria-checked="false"]').count()) && whileFailSafe < 2) {
            await headerFilterMenuSelectAllCheckbox.click();
            whileFailSafe++;
        }
    }

    // Fonction privée qui scroll en haut ou en bas jusqu'à ce que l'élément soit visible
    private static async safeScroll(aPage: Page, aDirection: 'Up' | 'Down', aSelectedElement: Locator, aScrollSpeed: number = 500): Promise<void> {
        let scrollCountDown = 0;
        while (await aSelectedElement.isHidden()) {
            await aPage.mouse.wheel(0, aDirection === 'Down' ? aScrollSpeed : -aScrollSpeed);
            scrollCountDown++;
            // Delay here is needed or else, it scrolls too fast and litteraly trips over
            await HubUtils.delay(50);
            if (scrollCountDown > 20) {
                // Could not find the element after scrolling 20 times. Exiting the loop
                break;
            }
        }
    }

    // Méthode privée pour sélectionner une date complète (année, mois, jour)
    private static async selectDate(aPage: Page, date: DateFormat): Promise<void> {
        await this.selectYearMonthAndDay(aPage, date);
    }

    // Méthode privée pour sélectionner une heure
    private static async selectTime(aPage: Page, time: TimeFormat, isStartTime: boolean): Promise<void> {
        await this.initiateDevexCalendarElements(aPage);

        const [hour, minuteWithAMPM] = time.split(':');
        const [minute, AMPM] = minuteWithAMPM.split(' ');

        await this.calendarTimeView.waitFor();

        const index = isStartTime ? 'first' : 'last';
        await this.calendarTimeView.getByLabel('hours')[index]().fill(hour);
        await this.calendarTimeView.getByLabel('minutes')[index]().fill(minute);
        await this.calendarTimeView.locator('.dx-timeview-format12').locator('input[aria-label="type"]')[index]().click();
        await aPage.locator('.dx-list-item-content').getByText(AMPM)[index]().click();
    }

    // Méthode privée pour sélectionner une date (incluant l'année, le mois et le jour)
    private static async selectYearMonthAndDay(aPage: Page, date: DateFormat): Promise<void> {
        await this.initiateDevexCalendarElements(aPage);

        const [month, day, year] = date.split('/');
        const calendarMonth = await TimeUtils.convertMonthNumberToMonthName(month);
        const calendarMonthAbv = calendarMonth.substring(0, 3);

        await this.navigateToCalendarViews(aPage);

        // Sélectionner l'année avant de sélectionner le mois et le jour
        await this.calendarDateViewDecade.getByText(year, { exact: true }).click();

        // Sélectionner le mois
        await this.calendarDateViewYear.getByText(calendarMonthAbv, { exact: true }).first().click();

        // Sélectionner le jour
        await this.calendarDateViewMonth.getByText(day, { exact: true }).first().click();
    }
}
