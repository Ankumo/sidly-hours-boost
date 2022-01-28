import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { DeepPartial } from 'typeorm';
import { pick } from '.';

export class AppConfig {
    public rootUser = 'root';
    public cookieLifetime = 60 * 60 * 24 * 7;
    public steamApiKey = '<Your Steam Web API token key goes here>';
    public kickTimeout = 1800;
    public maxActiveBotsPerUser = 5;
    public maxBotsPerUser = 50;
    public maxActiveBotsOnServer = 35;
    public updateAppsInfo = true;
    public domain = '';
    public runBotsAtStartup = true;
    public maxAppsPerAccount = 150;
    public keepAlivePing = 60;

    private _configPath: string;

    constructor() {
        this._configPath = path.resolve(
            `./../config${
                process.env.NODE_ENV === 'development' ? '.dev' : ''
            }.json`,
        );
    }

    private get props() {
        return Object.getOwnPropertyNames(this).filter(
            (prop) => !prop.startsWith('_'),
        );
    }

    public get json() {
        return pick(this, ...(this.props as any));
    }

    private apply(config: DeepPartial<AppConfig>) {
        this.props.forEach((prop) => {
            if (
                config[prop] !== undefined &&
                typeof this[prop] === typeof config[prop]
            ) {
                this[prop] = config[prop];
            }
        });
    }

    async load() {
        try {
            await fs.promises.access(this._configPath, fs.constants.F_OK);

            const config = pick<AppConfig>(
                require(this._configPath),
                ...(this.props as any),
            );

            this.apply(config);

            const evalKeys: Array<keyof AppConfig> = [
                'cookieLifetime',
                'kickTimeout',
                'keepAlivePing',
            ];

            evalKeys.forEach((k) => {
                this.evaluate(config, k);
            });
        } catch {
            await this.save();
        }
    }

    evaluate(config: DeepPartial<AppConfig>, key: keyof AppConfig) {
        const record = config[key];

        if (typeof record === 'string') {
            if (/^[\s\d\+\-\*\/\(\)\.%]*$/gm.test(record)) {
                try {
                    const recordEval = parseInt(eval(record));

                    if (isNaN(recordEval)) {
                        throw {};
                    }

                    (this[key] as any) = recordEval;

                    console.log(
                        `config.${key} evaluated to ${chalk.green(recordEval)}`,
                    );
                } catch {
                    console.log(
                        chalk.redBright(
                            `An error occurred while trying to evaluate ${chalk.white(
                                `config.${key}`,
                            )} expression`,
                        ),
                    );
                }
            } else {
                console.log(
                    `config.${key}` +
                        chalk.redBright(
                            ` can only contain basic math expression`,
                        ),
                );
            }
        }
    }

    async save() {
        await fs.promises.writeFile(
            this._configPath,
            JSON.stringify(this.json, null, 4),
        );
    }
}

export default new AppConfig();
