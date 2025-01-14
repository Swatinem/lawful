export interface LawConfig {
    [config: string]: any,

    /**
     * Define the severity of the law.
     * note: `omit` will always result in the law not being enforced
     * @default must
     */
    severity?: 'must'|'should'|'may'|'optional'|'omit';

    /**
     * Define the behaviour of a failure.
     * @private
     */
    _throw?: 'error'|'warn'|'log'|null;

    /**
     * @private
     */
    _name?: string;

    /**
     * Specificity level used to cascase configurations
     * @private
     */
    _specificity?: number;
}

export type severityLevel = 'error'|'warn'|'log'|null;

export interface LawbookConfig {
    /**
     * Define what log level you want to output
     * @default log
     */
    verboseness: 'error'|'warn'|'log'|'debug';

    /**
     * Describe the effect a failure has in a given severity category
     */
    severity: {
        /**
         * @default error
         */
        must: severityLevel,

        /**
         * @default warn
         */
        should: severityLevel,

        /**
         * @default log
         */
        may: severityLevel,

        /**
         * @default log
         */
        optional: severityLevel,
    };

    /**
     * List of law configurations
     */
    laws: {
        [lawName: string]: LawConfig;
    };

    /**
     * @private
     * List of laws and their parsed configurations.
     */
    _laws: any[];
}
