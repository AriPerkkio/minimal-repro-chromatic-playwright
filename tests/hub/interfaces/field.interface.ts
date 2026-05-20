export interface FieldInterface {
    locator: FieldLocator;
    value: boolean | string | undefined;
}

export abstract class FieldLocator {
    dataE2E?: string;
    fileAttachmentType?: string;
    label?: string;
    position?: number;
    sectionHeaderName?: string;
    tab?: string;
    type?: string;

    protected constructor(fieldLocator: {
        dataE2E?: string;
        fileAttachmentType?: string;
        label?: string;
        position?: number;
        sectionHeaderName?: string;
        tab?: string;
        type?: string;
    }) {
        Object.assign(this, fieldLocator);
    }
}
