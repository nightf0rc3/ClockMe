import { Driver, Options } from 'selenium-webdriver/chrome';
import { Builder, until, By, Key } from 'selenium-webdriver';

export interface ICredentials {
    username: string;
    password: string;
    pin: string;
}

export enum ClockStatus {
    INDAY = 'in-day',
    OUTLUNCH = 'out-lunch',
    INLUNCH = 'in-lunch',
    OUTDAY = 'out-day',
}

export class PaycomBot {

    private driver: Driver;
    private securityQuestions: string[];

    constructor(botOptions: { securityQuestions: string[], headless?: boolean }) {
        this.securityQuestions = botOptions.securityQuestions;
        const options: Options = new Options();
        if (botOptions.headless) {
            options.addArguments('--window-size=1920,1080');
            options.headless();
        }

        this.driver = new Builder().forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        console.log('[*] Driver initialized');
    }

    public async login(credentials: ICredentials) {
        console.log(`[*] Logging in as ${credentials.username}`);
        await this.driver.get('https://www.paycomonline.net/v4/ee/web.php/app/login');
        await this.driver.wait(until.titleIs('Employee Self-Service'), 1000);
        await this.driver.findElement(By.name('username')).sendKeys(credentials.username);
        await this.driver.findElement(By.name('userpass')).sendKeys(credentials.password);
        await this.driver.findElement(By.name('userpin')).sendKeys(credentials.pin, Key.RETURN);
        return this.checkLogin();
    }

    private async checkLogin() {
        const title = await this.driver.getTitle();
        if (title === 'Please Answer Your Security Questions to Continue') {
            console.log(`[!] Security questions need to be answered!`);
            return this.handleSecurityQuestions();
        }
        return Promise.resolve;
    }

    private async handleSecurityQuestions() {
        return new Promise(async (resolve, reject) => {
            const firstQuestionElement = await this.driver.findElement({ name: 'first_security_question' });
            const firstQuestion = await firstQuestionElement.getAttribute('aria-label');
            const firstQuestionAnswer = this.securityQuestions[firstQuestion];
            if (firstQuestionAnswer !== undefined) {
              console.log(`[+] Answering '${firstQuestion}' => '${firstQuestionAnswer}'`);
              await firstQuestionElement.sendKeys(firstQuestionAnswer);
            } else {
              reject(`[-] Answer for question '${firstQuestion}' needed!`);
            }
            const secondQuestionElement = await this.driver.findElement({ name: 'second_security_question' });
            const secondQuestion = await secondQuestionElement.getAttribute('aria-label');
            const secondQuestionAnswer = this.securityQuestions[secondQuestion];
            if (secondQuestionAnswer !== undefined) {
              console.log(`[+] Answering '${secondQuestion}' => '${secondQuestionAnswer}'`);
              await secondQuestionElement.sendKeys(secondQuestionAnswer, Key.RETURN);
              console.log('[+] Security Check passed');
              resolve();
            } else {
              reject(`[-] Answer for question '${secondQuestion}' needed!`);
            }
        });
    }

    public async clock(clockStatus: ClockStatus) {
        await this.driver.get('https://www.paycomonline.net/v4/ee/web.php/timeclock/WEB07');
        await this.driver.wait(until.titleIs('Employee Self Service - Web Time Clock'), 1000);
        console.log(`[*] Tryimg to punch ${clockStatus}`);
        await this.driver.get(`https://www.paycomonline.net/v4/ee/web.php/timeclock/WEB07/punch/${clockStatus}`);
        console.log(`[+] Punched ${clockStatus}`);
        await this.driver.get('https://www.paycomonline.net/v4/ee/web.php/timeclock/WEB07');
    }

    // TODO: getTimeInClockStatus
    // TODO: get total time of the day
    // TODO: get total time od the week
}
