declare module 'snowflake-id' {
    export default class Snowflake {
        constructor(options: SnowflakeOptions)

        generate() : string;
    }

    export interface SnowflakeOptions {
        mid : number;
        offset : number;
    }
}