// Valide le format MM/DD/YYYY entre 01/01/2000 et 12/31/2099
export type DateFormat = `${number extends 1 ? '0' : ''}${number}/${number extends 1 ? '0' : ''}${number}/${number}${number}${number}${number}`;

// Valide le format MM/DD/YYYY HH:mm
export type DateTimeFormat = `${number}${number}${number}${number}/${number}${number}/${number}${number} ${number}${number}:${number}${number}`;

// Valide le format HH:mm AM/PM
export type TimeFormat =
    | `${0 | 1}${number}:${number}${number} ${'AM' | 'PM'}`
    | `${number}:${number}${number} ${'AM' | 'PM'}`;

// Valide le format HH:mm (00:00 à 23:59)
export type TimeHourMinuteFormat = `${number}${number}:${number}${number}`;
