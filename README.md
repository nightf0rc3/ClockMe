# Clock Me - Paycom Clocker

This Tool enables you to easily clock-in and out from the command line.

## Installation
You have to manually install the Chorome Webdriver for Selenium.

```bash
git clone https://github.com/nightf0rc3/ClockMe.git
npm install
npm run build
npm link
```

## Usage

You have to initialize the tool and provide your paycom login credentials as well as the answers to your security questions. (I know that sounds sketchy)

```bash
clockme init
```

For further usage information take a look at `clockme -h`