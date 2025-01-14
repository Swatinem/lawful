import * as micromatch from 'micromatch';
import isGlob from 'is-glob';

import { ConfigManager } from './config/manager';
import Law from './law';
import { log } from './log';
import { LawbookConfig, LawConfig } from './config/types';
import { LawbookError } from './errors/index';


/**
 * Collection to manage laws
 */
export default class Lawbook {
    public config: ConfigManager;
    public laws: Law[];

    constructor(config?: LawbookConfig) {
        this.config = new ConfigManager(config);
        this.laws = [];
    }

    get length() {
        return this.laws.length;
    }

    /**
     * Loop over the laws in the set
     */
    public forEach(fn: (value: Law, index: number, array: Law[]) => void, thisArg?: any) {
        this.laws.forEach(fn, thisArg);
    }

    /**
     * Add a law or create a new empty one
     * Sets configuration
     */
    public add(law: string | Law, defaultConfig?: LawConfig) {
        if (!(law instanceof Law)) {
            law = new Law(law, this);
        }

        if (isGlob(law.name)) {
            throw new LawbookError(
                `Can't add a law with a Glob pattern for its name.`,
                `'${law.name}' includes reserved Glob pattern characters.`);
        }
        if (this.has(law.name)) {
            throw new LawbookError(
                `The law named '${law.name}' already exists in the set.`,
                `Law names must be unique.`);
        }

        if (defaultConfig) {
            law.config = defaultConfig;
        }
        const config = this.config.get(law.name);
        law.config = config;

        this.laws.push(law);
        return law;
    }

    /**
     * Returns true if the set contains the given Law name pattern
     */
    public has(globPattern: string) {
        const matcher = micromatch.matcher(globPattern);

        let has = false;
        this.forEach((law) => {
            if (matcher(law.name)) {
                has = true;
            }
        });
        return has;
    }

    /**
     * Return laws matching filter in a new law book
     * Opposite of omit()
     * @return new Lawbook
     */
    public filter(globPattern: string) {
        const matcher = micromatch.matcher(globPattern);

        const set = new Lawbook(this.config.full);
        this.forEach((law) => {
            if (matcher(law.name)) {
                set.add(law);
            }
        });
        return set;
    }

    /**
     * Return laws not matching filter in a new law book
     * Opposite of filter()
     * @return new Lawbook
     */
    public omit(globPattern: string) {
        return this.filter('!' + globPattern);
    }

    /**
     * Enforce all laws in the set
     */
    public async enforce(globPattern: string, ...input: any[]) {
        if (this.length === 0) {
            log.warn('No laws to enforce. Book is empty');
            return this;
        }

        const matcher = micromatch.matcher(globPattern);
        const subSet = this.laws
            .filter((law) => matcher(law.name))
            .sort((a, b) => a.specificity - b.specificity);

        if (subSet.length === 0) {
            log.warn(`No laws to enforce for name pattern '${globPattern}'`);
            return this;
        }

        for (const law of subSet) {
            await law.enforce(...input);
        }

        return this;
    }
}
