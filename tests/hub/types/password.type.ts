export const passwordComplexRegex: RegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:"\\|,.<>\/?`~]).{8,50}$/;

export type PasswordComplexType = `${string & { _password: typeof passwordComplexRegex }}`;
