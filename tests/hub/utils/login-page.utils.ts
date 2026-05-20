import util from 'util';
import { BusinessUser } from 'tests/hub/enums/usc-user.enum';
import { ConsoleWarnMessage } from 'tests/hub/enums/console.enum';
import { ErrorThrowMessage } from 'tests/hub/enums/error.enum';
import { expect, Locator, Page } from '@playwright/test';
import { HubUtils } from 'tests/hub/utils/hub.utils';
import { LoginPageLoginOutcome } from 'tests/hub/enums/login-page.enum';

/** Trimmed login flow for qabusiness → Hub (Devex repro). */
export class LoginPageUtils {
    public static loginPage: Locator;
    public static loginPageBusinessLoginBtn: Locator;
    public static loginPageForm: Locator;
    public static loginPageLoginBtn: Locator;
    public static loginPagePasswordField: Locator;
    public static loginPageUsernameField: Locator;

    public static async loginQABusiness(aPage: Page, aUrl: string, aAlternateLoginOutcome?: LoginPageLoginOutcome): Promise<void> {
        await this.login(aPage, aUrl, BusinessUser.QABUSINESS, BusinessUser.QABUSINESS, {
            aDefaultLoginOutcome: LoginPageLoginOutcome.HUB,
            aAlternateLoginOutcome: aAlternateLoginOutcome,
        });
    }

    public static async login(
        aPage: Page,
        aUrl: string,
        aUsername?: string,
        aPassword?: string,
        aLoginOutcome?: {
            aDefaultLoginOutcome: LoginPageLoginOutcome;
            aAlternateLoginOutcome?: LoginPageLoginOutcome;
        },
    ): Promise<void> {
        if (!aUsername?.length) {
            throw new Error(util.format(ErrorThrowMessage.ACTION_CALLED_WITH_BLANK_FIELD, 'login', 'username'));
        }
        if (!aPassword?.length) {
            throw new Error(util.format(ErrorThrowMessage.ACTION_CALLED_WITH_BLANK_FIELD, 'login', 'password'));
        }

        if (aPage.url() !== aUrl) {
            await aPage.goto(aUrl);
        }

        await this.initiateLoginPageElements(aPage);
        const loginTimeout = 35000;
        try {
            await this.loginPage.waitFor({ timeout: loginTimeout });
        } catch {
            throw new Error(util.format(ErrorThrowMessage.HUB_LOGIN_PAGE_NOT_LOADING, loginTimeout / 1000));
        }

        if (await this.loginPageBusinessLoginBtn.isVisible()) {
            await this.loginPageBusinessLoginBtn.click();
            await this.loginPageLoginBtn.waitFor();
        }
        await HubUtils.waitForPageToBeCompletelyReady(aPage);

        await this.loginPageUsernameField.fill(aUsername);
        await HubUtils.waitForPageToBeCompletelyReady(aPage, 100);
        await this.loginPagePasswordField.fill(aPassword);
        await HubUtils.waitForPageToBeCompletelyReady(aPage, 100);
        await this.loginPageLoginBtn.click();

        const outcome = aLoginOutcome?.aAlternateLoginOutcome ?? aLoginOutcome?.aDefaultLoginOutcome ?? LoginPageLoginOutcome.HUB;
        if (outcome === LoginPageLoginOutcome.HUB) {
            await this.waitForHubScreen(aPage, aUsername, aPassword);
        } else {
            await this.waitForHubApp(aPage, aUsername, aPassword);
        }
    }

    public static async initiateLoginPageElements(aPage: Page): Promise<void> {
        this.loginPage = aPage.locator('//c3-login');
        this.loginPageBusinessLoginBtn = this.loginPage.getByTestId('businessLoginButton');
        this.loginPageForm = this.loginPage.locator('//form');
        this.loginPageLoginBtn = this.loginPage.getByTestId('login');
        this.loginPagePasswordField = this.loginPageForm.getByTestId('password');
        this.loginPageUsernameField = this.loginPageForm.getByTestId('username');
    }

    private static async waitForHubApp(aPage: Page, aUsername: string, aPassword: string): Promise<void> {
        await this.handlePrivacyNoticeAndAcceptableUsePolicyAcceptance(aPage, aUsername, aPassword);
        await aPage.locator('//c3-app').waitFor({ timeout: 30000 });
    }

    private static async waitForHubScreen(aPage: Page, aUsername: string, aPassword: string): Promise<void> {
        try {
            await this.handlePrivacyNoticeAndAcceptableUsePolicyAcceptance(aPage, aUsername, aPassword);
            await attemptWaitForHubScreen();
        } catch {
            try {
                console.warn(ConsoleWarnMessage.HUB_LOADING_TAKES_MORE_THAN_30_SECONDS);
                await attemptWaitForHubScreen();
            } catch {
                throw new Error(ErrorThrowMessage.HUB_NOT_LOADING);
            }
        }

        async function attemptWaitForHubScreen(): Promise<void> {
            await aPage.locator('//c3-app').waitFor({ timeout: 30000 });
            await aPage.locator('//c3-toolbar').waitFor({ timeout: 30000 });
            await aPage.locator('//mat-sidenav-container').waitFor({ timeout: 30000 });
            await HubUtils.waitForPageToBeCompletelyReady(aPage);
            await HubUtils.waitForAllProgressBarsToBeHidden(aPage);
        }
    }

    private static async handlePrivacyNoticeAndAcceptableUsePolicyAcceptance(aPage: Page, aUsername: string, aPassword: string): Promise<void> {
        await HubUtils.waitForPageToBeCompletelyReady(aPage, 500);
        const c3NoticeDialog = aPage.locator('//c3-notice');
        if (await c3NoticeDialog.isVisible()) {
            await c3NoticeDialog.waitFor();
            const c3NoticeDialogBtnAccept = c3NoticeDialog.locator('//button').filter({ has: aPage.getByText('ACCEPT') });
            await c3NoticeDialogBtnAccept.scrollIntoViewIfNeeded({ timeout: 1000 });
            await expect(c3NoticeDialogBtnAccept).toBeEnabled();
            await c3NoticeDialogBtnAccept.click();
        }
        await c3NoticeDialog.waitFor({ state: 'hidden' });
        await this.executeFailsafePrivacyNoticeAcceptanceLogin(aPage, aUsername, aPassword);
    }

    private static async executeFailsafePrivacyNoticeAcceptanceLogin(aPage: Page, aUsername: string, aPassword: string): Promise<void> {
        const generalError = aPage.getByText(ErrorThrowMessage.GENERAL_ERROR_OCCURED);
        if (await generalError.isVisible()) {
            await this.loginPageLoginBtn.click();
            await HubUtils.waitForPageToBeCompletelyReady(aPage, 500);
            if (await generalError.isVisible()) {
                await this.login(aPage, aPage.url(), aUsername, aPassword, { aDefaultLoginOutcome: LoginPageLoginOutcome.HUB });
            }
        }
    }
}
