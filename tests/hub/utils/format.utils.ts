/** Stub — calendar filtering uses TimeUtils in this repro. */
export class FormatUtils {
    public static async getMonthNameAbv(monthNumber: string): Promise<string> {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const index = parseInt(monthNumber, 10) - 1;
        return months[index] ?? monthNumber;
    }
}
