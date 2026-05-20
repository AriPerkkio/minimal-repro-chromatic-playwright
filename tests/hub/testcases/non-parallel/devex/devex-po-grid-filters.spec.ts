import { DevexPOGridFiltersData } from 'tests/hub/data/devex-po-grid-filters.data';
import { DevexPOSubTests } from 'tests/hub/testcases/non-parallel/devex/devex-po-grid-filters-sub-tests/devex-po-grid-filters-sub-tests.spec';
import { DxColumnChooseDirection, DxFilterNumber, DXFilterSortDirection, DxFilterText } from 'tests/hub/enums/dx-filter.enum';
import { HUB_URL } from 'playwright.config';
import { HubUtils } from 'tests/hub/utils/hub.utils';
import { LoginPageUtils } from 'tests/hub/utils/login-page.utils';
import { POBookedStatus, POColumnHeaderName } from 'tests/hub/enums/purchase-order.enum';
import { POUtils } from 'tests/hub/utils/po.utils';
import { Screen } from 'tests/hub/enums/screen.enum';
import { Site } from 'tests/hub/enums/site.enum';
import { test } from 'fixtures/global-before-after-each';

export const devex_po_grid_filters = () => {
    test('@P1 - Devex - PO Grid Filters', async ({ page }) => {
        // Identify data used in tests here
        const devexPOGridFiltersData = DevexPOGridFiltersData;

        // Log in with a business user (apple)
        await LoginPageUtils.loginQABusiness(page, HUB_URL);

        // Select site "Site RSVN QA"
        await HubUtils.selectSite(page, Site.SITE_RSVN_QA);

        // Select screen "Purchase Orders"
        await HubUtils.selectScreen(page, Screen.PURCHASE_ORDERS);

        // TEST : Initial state of the Devex PO grid
        await DevexPOSubTests.testInitialDevexGridState(
            page,
            devexPOGridFiltersData.initialNumberOfRows,
            `${devexPOGridFiltersData.snapshotTitleBase}-Initial`,
        );

        // TESTS SETUP : Search all POs
        await POUtils.searchPO(page);

        // TEST : Filter by EDD (option)
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.EDD,
            DxFilterNumber.EQUALS,
            undefined,
            { numberOfRows: devexPOGridFiltersData.eddDateRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-EDD-Option`,
        );

        // TEST : Filter by EDD (calendar)
        await DevexPOSubTests.testFilterCalendar(
            page,
            POColumnHeaderName.EDD,
            {
                aSingleCalendarDateTime: { calendarDate: devexPOGridFiltersData.eddDate },
            },
            { numberOfRows: devexPOGridFiltersData.eddNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-EDD-Calendar`,
            true,
        );

        // TEST : Filter by Created Date (option)
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.CREATED_DATE,
            DxFilterNumber.BETWEEN,
            undefined,
            { numberOfRows: devexPOGridFiltersData.eddNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-Created-Date-Option`,
        );

        // TEST : Filter by Created Date (calendar)
        await DevexPOSubTests.testFilterCalendar(
            page,
            POColumnHeaderName.CREATED_DATE,
            {
                aMultiCalendarDateTime: {
                    start: { calendarDate: devexPOGridFiltersData.createdDateCalendarDate, calendarTime: devexPOGridFiltersData.createdDateCalendarTimeStart },
                    end: { calendarDate: devexPOGridFiltersData.createdDateCalendarDate, calendarTime: devexPOGridFiltersData.createdDateCalendarTimeEnd },
                },
            },
            { numberOfRows: devexPOGridFiltersData.createdDateNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-Created-Date-Calendar-End-1`,
        );
        await DevexPOSubTests.testFilterCalendar(
            page,
            POColumnHeaderName.CREATED_DATE,
            {
                aMultiCalendarDateTime: {
                    end: { calendarTime: devexPOGridFiltersData.createdDateCalendarTimeEndExtra },
                },
            },
            { numberOfRows: devexPOGridFiltersData.createdDateNumberRowsExtra },
            `${devexPOGridFiltersData.snapshotTitleBase}-Created-Date-Calendar-End-2`,
            true,
        );

        // TEST : Filter by PO Booking Status
        await DevexPOSubTests.testFilterHeader(
            page,
            POColumnHeaderName.PO_BOOKING_STATUS,
            [POBookedStatus.NOT_BOOKED.name],
            [
                {
                    columnValue: POBookedStatus.COMPLETED.locatorClass,
                    expectedNumberOfRows: devexPOGridFiltersData.poBookedStatusCompletedNumberRows,
                },
                {
                    columnValue: POBookedStatus.FULLY_BOOKED.locatorClass,
                    expectedNumberOfRows: devexPOGridFiltersData.poBookedStatusCompletedNumberRows,
                },
                {
                    columnValue: POBookedStatus.NOT_BOOKED.locatorClass,
                    expectedNumberOfRows: devexPOGridFiltersData.poBookedStatusNotBookedNumberRows,
                },
                {
                    columnValue: POBookedStatus.PARTIALLY_BOOKED.locatorClass,
                    expectedNumberOfRows: devexPOGridFiltersData.poBookedStatusPartiallyBookedNumberRows,
                },
            ],
            `${devexPOGridFiltersData.snapshotTitleBase}-PO-Booking-Status-Completed`,
        );
        await DevexPOSubTests.testFilterHeader(
            page,
            POColumnHeaderName.PO_BOOKING_STATUS,
            [POBookedStatus.FULLY_BOOKED.name],
            [
                {
                    columnValue: POBookedStatus.COMPLETED.locatorClass,
                    expectedNumberOfRows: devexPOGridFiltersData.poBookedStatusFullyBookedNumberRows,
                },
                {
                    columnValue: POBookedStatus.FULLY_BOOKED.locatorClass,
                    expectedNumberOfRows: devexPOGridFiltersData.poBookedStatusFullyBookedNumberRows,
                },
                {
                    columnValue: POBookedStatus.NOT_BOOKED.locatorClass,
                    expectedNumberOfRows: devexPOGridFiltersData.poBookedStatusEmptyNumberRows,
                },
                {
                    columnValue: POBookedStatus.PARTIALLY_BOOKED.locatorClass,
                    expectedNumberOfRows: devexPOGridFiltersData.poBookedStatusEmptyNumberRows,
                },
            ],
            `${devexPOGridFiltersData.snapshotTitleBase}-PO-Booking-Status-Fully-Booked`,
            true,
        );

        // TEST : Filter by PO Number
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.PO_NUMBER,
            DxFilterText.DOES_NOT_CONTAIN,
            devexPOGridFiltersData.poNumberPartial,
            { columnValue: devexPOGridFiltersData.poNumberPartial, numberOfRows: devexPOGridFiltersData.poNumberPartialDoesNotContainNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-PO-Number`,
        );
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.PO_NUMBER,
            DxFilterText.CONTAINS,
            devexPOGridFiltersData.poNumberPartial,
            { columnValue: devexPOGridFiltersData.poNumberPartial, numberOfRows: devexPOGridFiltersData.poNumberPartialContainsNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-PO-Number`,
            true,
        );

        // TEST : Filter by Site
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.SITE,
            DxFilterText.STARTS_WITH,
            devexPOGridFiltersData.sitePartialEnd,
            { columnValue: devexPOGridFiltersData.site, numberOfRows: devexPOGridFiltersData.siteStartsWithNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-Site-Starts-With`,
        );
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.SITE,
            DxFilterText.ENDS_WITH,
            devexPOGridFiltersData.sitePartialEnd,
            { columnValue: devexPOGridFiltersData.site, numberOfRows: devexPOGridFiltersData.siteEndsWithNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-Site-Ends-With`,
            true,
        );

        // TEST : Filter by Weight
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.WEIGHT,
            DxFilterNumber.GREATER_THAN,
            devexPOGridFiltersData.weightFilterValueGreater,
            { numberOfRows: devexPOGridFiltersData.weightFilterValueGreaterNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-Weight-Greater-Than`,
        );
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.WEIGHT,
            DxFilterNumber.LESS_THAN_OR_EQUAL_TO,
            devexPOGridFiltersData.weightFilterValueLessOrEqual,
            { numberOfRows: devexPOGridFiltersData.weightFilterValueLessOrEqualNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-Weight-Less-Than-Or-Equal-To`,
            true,
        );

        // TEST : Filter by Pallets
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.PALLETS,
            DxFilterNumber.GREATER_THAN_OR_EQUAL_TO,
            devexPOGridFiltersData.palletsFilterValueGreaterOrEqual,
            { numberOfRows: devexPOGridFiltersData.palletsFilterValueGreaterOrEqualNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-Pallets-Greater-Than-Or-Equal-To`,
        );
        await DevexPOSubTests.testFilterOptionAndOrValue(
            page,
            POColumnHeaderName.PALLETS,
            DxFilterNumber.LESS_THAN,
            devexPOGridFiltersData.palletsFilterValueLess,
            { numberOfRows: devexPOGridFiltersData.palletsFilterValueLessNumberRows },
            `${devexPOGridFiltersData.snapshotTitleBase}-Pallets-Less-Than`,
            true,
        );

        // TEST : Sort by PO Number
        await DevexPOSubTests.testSortColumn(
            page,
            POColumnHeaderName.PO_NUMBER,
            DXFilterSortDirection.ASCENDING,
            devexPOGridFiltersData.sortFirstPOAscending,
            `${devexPOGridFiltersData.snapshotTitleBase}-Sort-Ascending`,
        );
        await DevexPOSubTests.testSortColumn(
            page,
            POColumnHeaderName.PO_NUMBER,
            DXFilterSortDirection.DESCENDING,
            devexPOGridFiltersData.sortFirstPODescending,
            `${devexPOGridFiltersData.snapshotTitleBase}-Sort-Descending`,
        );

        // TEST : Column Chooser
        await DevexPOSubTests.testColumnChooser(
            page,
            POColumnHeaderName.PO_NUMBER,
            DxColumnChooseDirection.FROM_COLUMN_TO_COLUMN_CHOOSER,
            undefined,
            `${devexPOGridFiltersData.snapshotTitleBase}-Column-Chooser-From-Devex-Grid-To-Column-Chooser`,
        );
        await DevexPOSubTests.testColumnChooser(
            page,
            POColumnHeaderName.PO_NUMBER,
            DxColumnChooseDirection.FROM_COLUMN_CHOOSER_TO_COLUMN,
            devexPOGridFiltersData.poNumberColumnIndex,
            `${devexPOGridFiltersData.snapshotTitleBase}-Column-Chooser-From-Column-Chooser-To-Devex-Grid`,
        );
    });
};
