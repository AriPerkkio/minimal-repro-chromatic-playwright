import util from 'util';
import { Page } from '@playwright/test';

// Proxy pour envelopper les méthodes et s'assurer de la stabilité d'Angular
export function createPageProxy(page: Page): Page {
    const handler = {
        get(target: Page, prop: keyof Page, receiver: any) {
            if (typeof target[prop] === 'function' && ['goto', 'click', 'fill', 'waitFor', 'waitForSelector'].includes(prop as string)) {
                return async function (...args: any[]) {
                    await ensureAngularIsStable(target);
                    const result = await (target[prop] as Function).apply(target, args);
                    await ensureAngularIsStable(target);
                    return result;
                };
            }

            if (prop === 'locator') {
                return (...locatorArgs: [string]) => {
                    const locator = target[prop].apply(target, locatorArgs);
                    return locator; // Retourner l'objet Locator natif directement
                };
            }

            return Reflect.get(target, prop, receiver);
        },
    };
    return new Proxy(page, handler);
}

// Fonction principale pour s'assurer que Angular est stable
async function ensureAngularIsStable(page: Page) {
    if ((await isAngularApp(page)) && !page.url().includes('-hive.c3qualitycontrol.com')) {
        const startTime = Date.now();
        const maxRetries = 3;
        let retries = 0;

        while (retries < maxRetries) {
            try {
                await waitForAngularStability(page, 10000);
                if (retries > 0) {
                    console.log('Angular stability confirmed', Date.now() - startTime);
                }
                await page.waitForLoadState('networkidle');
                return;
            } catch (error) {
                retries++;
                console.warn(util.format('Angular stability check failed, retries: %s, max retries: %s', retries, maxRetries));
                const unstableTestabilities = await page.evaluate(() => {
                    const testabilities = window.getAllAngularTestabilities();
                    return testabilities.map((testability, index) => ({
                        index,
                        isStable: testability.isStable(),
                    }));
                });
                console.error(
                    util.format(
                        'Angular stability unstable testabilities: %s',
                        JSON.stringify(unstableTestabilities.filter((t) => !t.isStable))
                    )
                );
                await page.waitForTimeout(1000); // Attend une seconde avant de réessayer
            }
        }
    } else {
        // Skipping Angular stability check
    }
}

// Vérifie si la page est une application Angular
async function isAngularApp(page: Page): Promise<boolean> {
    return await page.evaluate(() => !!window.getAllAngularTestabilities);
}

// Attend que toutes les parties de l'application Angular soient stables
async function waitForAngularStability(page: Page, timeout: number) {
    await page.waitForFunction(() => window.getAllAngularTestabilities().every((x) => x.isStable()), { timeout });
}
