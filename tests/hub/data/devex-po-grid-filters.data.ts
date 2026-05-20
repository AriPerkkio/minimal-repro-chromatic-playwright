import { DateFormat, TimeFormat } from 'tests/hub/types/date.type';
import { PONumber } from 'tests/hub/enums/purchase-order.enum';
import { Site } from 'tests/hub/enums/site.enum';

// Ici, on identifie le nombre de lignes maximale qui peut être affiché dans le DOM à la fois dans le tableau de la grille
// Il est identifié ici, car il varie selon l'espace alloué par le viewport qui peut changer à travers le temps
const devexMaxRowNumber: number = 10;

// Ensuite, on identifie les données qui seront utilisées pour les tests
export const DevexPOGridFiltersData = {
    createdDateCalendarDate: '11/13/2024' as DateFormat,
    createdDateCalendarTimeEnd: '11:13 AM' as TimeFormat,
    createdDateCalendarTimeEndExtra: '11:19 AM' as TimeFormat,
    createdDateCalendarTimeStart: '11:11 AM' as TimeFormat,
    createdDateNumberRows: 1 as number,
    createdDateNumberRowsExtra: 7 as number,
    eddDate: '08/16/2021' as string as DateFormat,
    eddDateRows: 1 as number,
    eddNumberRows: 1 as number,
    initialNumberOfRows: 0 as number,
    palletsFilterValueGreaterOrEqual: '21' as string,
    palletsFilterValueGreaterOrEqualNumberRows: 7 as number,
    palletsFilterValueLess: '21' as string,
    palletsFilterValueLessNumberRows: 2 as number,
    poBookedStatusCompletedNumberRows: 0 as number,
    poBookedStatusEmptyNumberRows: 0 as number,
    poBookedStatusFullyBookedNumberRows: 3 as number,
    poBookedStatusNotBookedNumberRows: 7 as number,
    poBookedStatusPartiallyBookedNumberRows: 0 as number,
    poNumberColumnIndex: 2 as number,
    poNumberPartial: '95' as string,
    poNumberPartialContainsNumberRows: 2 as number,
    poNumberPartialDoesNotContainNumberRows: 0 as number,
    site: Site.SITE_RSVN_QA as string,
    siteEndsWithNumberRows: 9 as number,
    sitePartialEnd: Site.SITE_RSVN_QA.substring(Site.SITE_RSVN_QA.length - 4) as string,
    siteStartsWithNumberRows: 0 as number,
    snapshotTitleBase: 'Devex-PO-Grid-Filters' as string,
    sortFirstPOAscending: PONumber.RSVN_403796 as string,
    sortFirstPODescending: PONumber.RSVN_937277 as string,
    weightFilterValueGreater: '4000.00' as string,
    weightFilterValueGreaterNumberRows: 7 as number,
    weightFilterValueLessOrEqual: '1200.00' as string,
    weightFilterValueLessOrEqualNumberRows: 7 as number,
};
