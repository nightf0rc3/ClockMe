#! /usr/bin/env node
import * as Configstore from 'configstore';
import * as program from 'commander';
import { PaycomBot, ClockStatus } from './PaycomBot';
import * as inquirer from 'inquirer';

const config = new Configstore('clockme');

const init = () => {
  // TODO: improve promptint, fetch security questions only when needed
  inquirer
  .prompt([
    { name: 'username', message: 'Paycom username:' },
    { name: 'password', message: 'Paycom password:', type: 'password' },
    { name: 'pin', message: 'Paycom pin:', type: 'password' },
    { name: 'Mothers maiden name?', message: 'Mothers maiden name:' },
    { name: 'Street name where you grew up?', message: 'Street name where you grew up:' },
    { name: 'Name of your first employer?', message: 'Name of your first employer:' },
    { name: 'Who did you go to prom with?', message: 'Who did you go to prom with:' },
    { name: 'Month/Day of your fathers birthday (MM/DD format)?',
      message: 'Month/Day of your fathers birthday (MM/DD format):' },
  ])
  .then((answers: { username: string, password: string, pin: string }) => {
    config.set('credentials.username', answers.username);
    config.set('credentials.password', answers.password);
    config.set('credentials.pin', answers.pin);
    config.set('securityQuestions.Mothers maiden name?', answers['Mothers maiden name?']);
    config.set('securityQuestions.Street name where you grew up?', answers['Street name where you grew up?']);
    config.set('securityQuestions.Name of your first employer?', answers['Name of your first employer?']);
    config.set('securityQuestions.Who did you go to prom with?', answers['Who did you go to prom with?']);
    config.set('securityQuestions.Month/Day of your fathers birthday (MM/DD format)?',
               answers['Month/Day of your fathers birthday (MM/DD format)?']);
  });

};

const clock = async (status: ClockStatus) => {
    if (config.size > 0) {
        try {
            const bot: PaycomBot = new PaycomBot({ securityQuestions: config.get('securityQuestions') });
            await bot.login(config.get('credentials'));
            await bot.clock(status);
        } catch (err) {
            console.log(`[!] Something went wrong!`);
            console.log(err);
        }
    } else {
        console.log('You have to initialize the application first!');
    }
};

program.version('0.0.1').description('Paycom Clocking tool');

program
  .command('init')
  .description('Configure your account')
  .action(() => init());

program
  .command('in-day')
  .alias('ind')
  .description('Clocks you in for the day')
  .action(() => clock(ClockStatus.INDAY));

program
  .command('out-day')
  .alias('outd')
  .description('Clocks you out for the day')
  .action(() => clock(ClockStatus.OUTDAY));

program
  .command('out-lunch')
  .alias('outl')
  .description('Clocks you out for lunch')
  .action(() => clock(ClockStatus.OUTLUNCH));

program
  .command('in-lunch')
  .alias('inl')
  .description('Clocks you in for lunch')
  .action(() => clock(ClockStatus.INLUNCH));

program.parse(process.argv);
