export class Screen {
    static readonly PURCHASE_ORDERS = new Screen('Purchase Orders', '//c3-widget-po-search');

    private constructor(public readonly label: string, public readonly expectedLocator: string, public readonly expectedText?: string) {}
}
