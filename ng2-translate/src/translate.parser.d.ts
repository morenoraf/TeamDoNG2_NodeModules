export declare abstract class TranslateParser {
    /**
     * Interpolates a string to replace parameters
     * "This is a {{ key }}" ==> "This is a value", with params = { key: "value" }
     * @param expr
     * @param params
     * @returns {string}
     */
    abstract interpolate(expr: string, params?: any): string;
    /**
     * Gets a value from an object by composed key
     * parser.getValue({ key1: { keyA: 'valueI' }}, 'key1.keyA') ==> 'valueI'
     * @param target
     * @param key
     * @returns {string}
     */
    abstract getValue(target: any, key: string): string;
}
export declare class DefaultTranslateParser extends TranslateParser {
    templateMatcher: RegExp;
    interpolate(expr: string, params?: any): string;
    getValue(target: any, key: string): string;
}
