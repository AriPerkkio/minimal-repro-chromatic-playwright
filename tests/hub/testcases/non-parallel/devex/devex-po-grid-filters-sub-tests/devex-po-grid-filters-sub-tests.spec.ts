import { DateFormat, TimeFormat } from 'tests/hub/types/date.type';
import { DevexUtils } from 'tests/hub/utils/devex.utils';
import { DxColumnChooseDirection, DxFilterNumber, DXFilterSortDirection, DxFilterText } from 'tests/hub/enums/dx-filter.enum';
import { ErrorThrowMessage } from 'tests/hub/enums/error.enum';
import { HubUtils } from 'tests/hub/utils/hub.utils';
import { Locator, Page } from '@playwright/test';
import { POColumnHeaderName } from 'tests/hub/enums/purchase-order.enum';
import { takeSnapshot } from '@chromatic-com/playwright';
import { test } from 'fixtures/global-before-after-each';

export class DevexPOSubTests {
    protected static poScreen: Locator;
    protected static poScreenSearchDataGrid: Locator;

    // Test qui valide le comportement du déplacement de colonne dedans et dehors du column chooser dans la grille Devex PO
    public static async testColumnChooser(
        aPage: Page,
        aPOColumnHeaderName: POColumnHeaderName,
        aDxColumnChooseDirection: DxColumnChooseDirection,
        aColumnIndexToDragTo?: number,
        aSnapshotTitle?: string,
    ): Promise<void> {
        await this.initiateDevexPOSubTestsElements(aPage);

        // Vérifie que aColumnIndexToDragTo est défini si le sens du déplacement est du column chooser vers la colonne
        if (aDxColumnChooseDirection === DxColumnChooseDirection.FROM_COLUMN_CHOOSER_TO_COLUMN && aColumnIndexToDragTo === undefined) {
            throw new Error(ErrorThrowMessage.DEVEX_COLUMN_INDEX_REQUIRED);
        }

        // Identifie les constantes pour les éléments du column chooser
        const columnChooserPanel: Locator = aPage.locator('.dx-datagrid-column-chooser').locator('//div[@aria-label="Column Chooser"]');
        const columnChooserPanelCloseBtn: Locator = columnChooserPanel.locator('//div[@aria-label="Close"]');

        // Ouvre le column chooser et déplace la colonne dedans ou dehors
        aDxColumnChooseDirection === DxColumnChooseDirection.FROM_COLUMN_TO_COLUMN_CHOOSER
            ? await DevexUtils.dragAndDropColumnToOrFromColumnChooser(
                  aPage,
                  this.poScreenSearchDataGrid,
                  aPOColumnHeaderName,
                  aDxColumnChooseDirection,
                  await DevexUtils.getColumnIndex(aPage, aPOColumnHeaderName),
              )
            : await DevexUtils.dragAndDropColumnToOrFromColumnChooser(
                  aPage,
                  this.poScreenSearchDataGrid,
                  aPOColumnHeaderName,
                  aDxColumnChooseDirection,
                  aColumnIndexToDragTo,
              );

        // Gère les paramètres optionnels
        await this.handleOptionalParameters(aPage, { aSnapshotTitle });

        // Ferme le column chooser
        await columnChooserPanelCloseBtn.click();
        await columnChooserPanel.waitFor({ state: 'hidden' });
    }

    // Test qui valide les filtres de type Calendar (date et time) dans la grille Devex PO
    public static async testFilterCalendar(
        aPage: Page,
        aColumnHeaderName: POColumnHeaderName | string,
        aListofSingleOrMultiCalendarDateTimes:
            | { aSingleCalendarDateTime: { calendarDate?: DateFormat; calendarTime?: TimeFormat }; aMultiCalendarDateTime?: never }
            | {
                  aMultiCalendarDateTime: {
                      end?: { calendarDate?: DateFormat; calendarTime?: TimeFormat };
                      start?: { calendarDate?: DateFormat; calendarTime?: TimeFormat };
                  };
                  aSingleCalendarDateTime?: never;
              },
        aExpectedResult?: { numberOfRows?: number; aColumnValue?: Locator | string; aColumnValueExactMatch?: boolean },
        aSnapshotTitle?: string,
        isResetFilterAfterwards: boolean = false,
    ): Promise<void> {
        await this.initiateDevexPOSubTestsElements(aPage);

        // Utilise la méthode refactorisée pour la sélection de la date/heure
        await DevexUtils.selectFilterCalendarDate(aPage, aColumnHeaderName, aListofSingleOrMultiCalendarDateTimes);

        // Valide le nombre de lignes attendu si spécifié
        if (aExpectedResult?.numberOfRows) {
            await DevexUtils.assertNumberOfRowsInDevexGrid(aPage, this.poScreenSearchDataGrid, aExpectedResult.numberOfRows);
        }

        // Gère les paramètres optionnels, incluant le reset du filtre si demandé
        await this.handleOptionalParameters(aPage, {
            aSnapshotTitle,
            aResetParameters: { columnName: aColumnHeaderName, resetFilterOption: isResetFilterAfterwards },
        });
    }

    // Test qui valide les filtres de type Number (Equal, Greater Than, Less Than, Between, etc) dans la grille Devex PO
    public static async testFilterOptionAndOrValue(
        aPage: Page,
        aColumnHeaderName: string,
        aDxFilter?: DxFilterNumber | DxFilterText,
        aFilterValue?: string,
        aExpectedResult?: { columnValue?: string; columnValueExactMatch?: boolean; numberOfRows?: number },
        aSnapshotTitle?: string,
        isResetFilterAfterwards: boolean = false,
    ): Promise<void> {
        await this.initiateDevexPOSubTestsElements(aPage);

        // Sélectionne un filtre de colonne (si spécifié)
        aDxFilter ? await DevexUtils.selectFilterOptions(aPage, aColumnHeaderName, aDxFilter) : null;
        // Définit une valeur de filtre (si spécifiée)
        aFilterValue ? await DevexUtils.setFilterValue(aPage, aColumnHeaderName, aFilterValue) : null;
        await HubUtils.resetFieldFocus(aPage);
        // Valide le nombre de lignes ou valeur de colonne (si spécifié)
        aExpectedResult
            ? await DevexUtils.assertNumberOfRowsInDevexGrid(
                  aPage,
                  this.poScreenSearchDataGrid,
                  aExpectedResult.numberOfRows !== undefined && aExpectedResult.numberOfRows !== null ? aExpectedResult.numberOfRows : 1,
                  aExpectedResult.columnValueExactMatch ? aExpectedResult.columnValueExactMatch : false,
                  {
                      columnName: aColumnHeaderName,
                      columnValue: aExpectedResult.columnValue ? aExpectedResult.columnValue : '',
                  },
              )
            : null;

        await this.handleOptionalParameters(aPage, {
            aSnapshotTitle,
            aDxFilter: aDxFilter,
            aResetParameters: { columnName: aColumnHeaderName, resetFilterOption: isResetFilterAfterwards, resetFilterValue: isResetFilterAfterwards },
        });
    }

    // Test qui valide les filtres de type PO Booking Status dans la grille Devex PO
    public static async testFilterHeader(
        aPage: Page,
        aColumnName: string,
        aListOfHeaderFiltersHeaderFilter: string[],
        aListOfColumnAndValues: { columnValue: string; expectedNumberOfRows: number }[],
        aSnapshotTitle?: string,
        isResetFilterAfterwards: boolean = false,
    ): Promise<void> {
        await this.initiateDevexPOSubTestsElements(aPage);

        // Sélectionne un filtre de header
        await DevexUtils.selectHeaderFilter(aPage, aColumnName, aListOfHeaderFiltersHeaderFilter);

        // Valide le nombre de lignes pour chaque combinaison de colonne et de valeur de PO Booking Status
        for (const columnAndValue of aListOfColumnAndValues) {
            await DevexUtils.assertNumberOfRowsInDevexGrid(aPage, this.poScreenSearchDataGrid, columnAndValue.expectedNumberOfRows, true, {
                columnName: aColumnName,
                columnValue: columnAndValue.columnValue,
                isColumnValueALocatorClass: true,
            });
        }
        await this.handleOptionalParameters(aPage, {
            aSnapshotTitle,
            aResetParameters: { columnName: aColumnName, resetFilterHeader: isResetFilterAfterwards },
        });
    }

    // Test qui valide l'état initial de la grille Devex PO
    public static async testInitialDevexGridState(aPage: Page, aExpectedInitialNumberOfRows: number, aSnapshotTitle?: string): Promise<void> {
        await this.initiateDevexPOSubTestsElements(aPage);

        await DevexUtils.assertNumberOfRowsInDevexGrid(aPage, this.poScreenSearchDataGrid, aExpectedInitialNumberOfRows);
        await this.handleOptionalParameters(aPage, { aSnapshotTitle });
    }

    // Test qui valide l'ordonnancement de colonne de la grille Devex PO
    public static async testSortColumn(
        aPage: Page,
        aColumnName: string,
        aDXFilterSortDirection: DXFilterSortDirection,
        aExpectedFirstValue?: string,
        aSnapshotTitle?: string,
    ): Promise<void> {
        await this.initiateDevexPOSubTestsElements(aPage);

        await DevexUtils.sortColumn(aPage, this.poScreenSearchDataGrid, aColumnName, aDXFilterSortDirection, aExpectedFirstValue);
        await this.handleOptionalParameters(aPage, { aSnapshotTitle });
    }

    // Gère les paramètres optionnels des sous-tests de filtre de la grille Devex PO
    private static async handleOptionalParameters(
        aPage: Page,
        aOptionalParameters: {
            aDxFilter?: DxFilterNumber | DxFilterText;
            aSnapshotTitle?: string;
            aResetParameters?: { columnName: string; resetFilterHeader?: boolean; resetFilterOption?: boolean; resetFilterValue?: boolean };
        },
    ): Promise<void> {
        const { aSnapshotTitle, aResetParameters } = aOptionalParameters;

        if (aSnapshotTitle) {
            await takeSnapshot(aPage, aSnapshotTitle, test.info());
        }

        if (aResetParameters) {
            const { columnName, resetFilterHeader, resetFilterOption, resetFilterValue } = aResetParameters;
            if (resetFilterHeader) {
                await DevexUtils.resetFilterHeader(aPage, columnName);
            }
            if (resetFilterOption) {
                await DevexUtils.resetFilterOption(aPage, columnName);
            }
            if (resetFilterValue) {
                await DevexUtils.resetFilterValue(aPage, columnName);
            }
        }
    }

    // Initialise les éléments de base pour les sous-tests de la grille Devex PO
    private static async initiateDevexPOSubTestsElements(aPage: Page): Promise<void> {
        this.poScreen = aPage.locator('//c3-widget-po-search');
        this.poScreenSearchDataGrid = aPage.getByTestId('poSearchDataGrid');
    }
}
