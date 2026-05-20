import util from 'util';
import { DateEnumFormat, Month } from 'tests/hub/enums/date.enum';
import { DateFormat, DateTimeFormat } from 'tests/hub/types/date.type';
import { ErrorThrowMessage } from 'tests/hub/enums/error.enum';

export class TimeUtils {
    // Convertit une date en format DateFormat en format lisible pour de l'assertion de Downtime
    public static async convertDateFormatToDateTimeFormat(aDateFormat: DateFormat, aHourMin: string = '00:00'): Promise<DateTimeFormat> {
        const splittedDateFormat = aDateFormat.split('/');
        return `${splittedDateFormat[2]}/${splittedDateFormat[0]}/${splittedDateFormat[1]} ${aHourMin}` as DateTimeFormat;
    }

    // Convertit un nombre de mois en nom de mois
    public static async convertMonthNumberToMonthName(aMonthNumber: string): Promise<string> {
        // Remove leading zero from a two-digit month number
        let monthNumber: string = aMonthNumber;
        if (aMonthNumber.length === 2 && aMonthNumber[0] === '0') {
            monthNumber = aMonthNumber[1];
        }

        const monthNumberAsInt = parseInt(monthNumber);

        // Get the Month instance using the static map
        const month = Month.getMonthByNumber(monthNumberAsInt);

        if (!month) {
            throw new Error(util.format(ErrorThrowMessage.TIME_INVALID_MONTH_NUMBER, monthNumberAsInt));
        }

        return month.monthName;
    }

    // Serves as a manual wait when needed
    public static async delay(time: number) {
        return new Promise(function (resolve) {
            setTimeout(resolve, time);
        });
    }

    // Convertit une date (Date) en format affiché sur une puck d'assignment Hive
    public static async convertDateToHivePuckFormat(aDate: Date): Promise<string> {
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
        return aDate.toLocaleDateString('en-US', options);
    }

    // Retourne la date d'aujourd'hui au format américain
    // Par défaut, ça donne la date du jour, mais on peut shifter à l'aide du paramètre aShiftNumber
    public static getDate(aDateEnumFormat: DateEnumFormat, aShiftNumber?: number) {
        // Premièrement, on obtient la date d'aujourd'hui (qui peut être shiftée si nécessaire)
        let currentDate = new Date();
        if (aShiftNumber) {
            currentDate.setDate(currentDate.getDate() + aShiftNumber);
        }

        // Ensuite, on obtient les éléments de la date et on retourne au format demandé
        const year = currentDate.getFullYear();
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const day = currentDate.getDate().toString().padStart(2, '0');

        switch (aDateEnumFormat) {
            case DateEnumFormat.AMERICAN:
                return `${month}/${day}/${year}`;
            case DateEnumFormat.EUROPEAN:
                return `${day}/${month}/${year}`;
            case DateEnumFormat.ISO:
                return `${year}/${month}/${day}`;
            default:
        }
        throw new Error(ErrorThrowMessage.TIME_INVALID_DATE_FORMAT);
    }

    // Test qui valide si une chaîne de caractères est bel et bien une date de format américain
    public static async isAmericanDateEnumFormat(input: string): Promise<boolean> {
        const pattern = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        return pattern.test(input);
    }
}
