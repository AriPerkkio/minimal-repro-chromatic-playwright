/** Error messages referenced by the Devex PO grid filters repro. */
export enum ErrorThrowMessage {
    ACTION_CALLED_WITH_BLANK_FIELD = 'The action %s was called with a blank %s field',
    GENERAL_ERROR_OCCURED = 'A General Error occurs, try again and if the error persist please contact the administrator',
    HUB_LOGIN_PAGE_NOT_LOADING = 'The Hub login page is not loading after waiting for %s seconds. Most likely due to Azure performance issues',
    HUB_NOT_LOADING = 'The Hub is not loading after waiting for 30 seconds. Please check the login page utils file to troubleshoot',

    DEVEX_CALENDAR_DATE_VIEW_DECADE_NOT_FOUND = 'The calendar date view decade was not found after %s attempts',
    DEVEX_COLUMN_BOUNDING_BOX_NOT_FOUND = 'The bounding box for the column %s was not found',
    DEVEX_COLUMN_INDEX_REQUIRED = 'The column index to drag to is required when moving a column from the column chooser to the grid',
    DEVEX_COLUMN_NOT_FOUND = 'The column %s was not found. Available columns: %s',
    DEVEX_INVALID_ASSIGNMENT_TYPE_INDEX = 'Invalid assignment type index',
    DEVEX_INVALID_SORT_DIRECTION = 'Invalid sort direction',
    DEVEX_MISSING_COLUMN_INDEX = 'The column index to drag to is required when moving a column from the column chooser to the grid',
    DEVEX_ROW_NOT_FOUND = 'The devex row was not found (label/column: %s, context: %s, value: %s)',

    TIME_INVALID_DATE_FORMAT = 'Invalid date format. Please refer to the DateEnumFormat enum for valid formats.',
    TIME_INVALID_MONTH_NUMBER = 'Invalid month number: %s',
}
