/** Subset of purchase-order.enum.ts — only symbols used by Devex PO grid filters repro. */

export class POBookedStatus {
    static readonly COMPLETED = new POBookedStatus('Completed', '.icon-square_empty');
    static readonly FULLY_BOOKED = new POBookedStatus('Fully Booked', '.icon-square_empty');
    static readonly NOT_BOOKED = new POBookedStatus('Not Booked', '.icon-square_full');
    static readonly PARTIALLY_BOOKED = new POBookedStatus('Partially Booked', '.icon-square_half');

    private constructor(
        public readonly name: string,
        public readonly locatorClass: string,
    ) {}
}

export enum POColumnHeaderName {
    CREATED_DATE = 'Created Date',
    EDD = 'EDD',
    PALLETS = 'Pallets',
    PO_BOOKING_STATUS = 'PO Booking Status',
    PO_NUMBER = 'PO #',
    SITE = 'Site',
    WEIGHT = 'Weight',
}

export enum PONumber {
    RSVN_403796 = '403796',
    RSVN_937277 = 'QA937277',
}
