export enum DateEnumFormat {
    AMERICAN = 'MM/DD/YYYY',
    EUROPEAN = 'DD/MM/YYYY',
    ISO = 'YYYY/MM/DD',
}

export class Month {
    static readonly APRIL = new Month(4, 'April');
    static readonly AUGUST = new Month(8, 'August');
    static readonly DECEMBER = new Month(12, 'December');
    static readonly FEBRUARY = new Month(2, 'February');
    static readonly JANUARY = new Month(1, 'January');
    static readonly JULY = new Month(7, 'July');
    static readonly JUNE = new Month(6, 'June');
    static readonly MARCH = new Month(3, 'March');
    static readonly MAY = new Month(5, 'May');
    static readonly NOVEMBER = new Month(11, 'November');
    static readonly OCTOBER = new Month(10, 'October');
    static readonly SEPTEMBER = new Month(9, 'September');

    private constructor(public readonly monthNumber: number, public readonly monthName: string) {}

    public static getMonthByNumber(monthNumber: number): Month {
        return this.monthMap[monthNumber];
    }

    private static monthMap: { [key: number]: Month } = {
        1: Month.JANUARY,
        2: Month.FEBRUARY,
        3: Month.MARCH,
        4: Month.APRIL,
        5: Month.MAY,
        6: Month.JUNE,
        7: Month.JULY,
        8: Month.AUGUST,
        9: Month.SEPTEMBER,
        10: Month.OCTOBER,
        11: Month.NOVEMBER,
        12: Month.DECEMBER,
    };
}
