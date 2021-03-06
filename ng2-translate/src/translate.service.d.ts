import { EventEmitter } from "@angular/core";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/operator/share";
import "rxjs/add/operator/map";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/toArray";
import { TranslateParser } from "./translate.parser";
export interface TranslationChangeEvent {
    translations: any;
    lang: string;
}
export interface LangChangeEvent {
    lang: string;
    translations: any;
}
export interface MissingTranslationHandlerParams {
    /**
     * the key that's missing in translation files
     *
     * @type {string}
     */
    key: string;
    /**
     * an instance of the service that was unable to translate the key.
     *
     * @type {TranslateService}
     */
    translateService: TranslateService;
    /**
     * interpolation params that were passed along for translating the given key.
     *
     * @type {Object}
     */
    interpolateParams?: Object;
}
export declare abstract class MissingTranslationHandler {
    /**
     * A function that handles missing translations.
     *
     * @abstract
     * @param {MissingTranslationHandlerParams} params context for resolving a missing translation
     * @returns {any} a value or an observable
     * If it returns a value, then this value is used.
     * If it return an observable, the value returned by this observable will be used (except if the method was "instant").
     * If it doesn't return then the key will be used as a value
     */
    abstract handle(params: MissingTranslationHandlerParams): any;
}
export declare abstract class TranslateLoader {
    abstract getTranslation(lang: string): Observable<any>;
}
export declare class TranslateStaticLoader implements TranslateLoader {
    private http;
    private prefix;
    private suffix;
    constructor(http: Http, prefix?: string, suffix?: string);
    /**
     * Gets the translations from the server
     * @param lang
     * @returns {any}
     */
    getTranslation(lang: string): Observable<any>;
}
export declare class TranslateService {
    currentLoader: TranslateLoader;
    private parser;
    private missingTranslationHandler;
    /**
     * The lang currently used
     */
    currentLang: string;
    /**
     * An EventEmitter to listen to translation change events
     * onTranslationChange.subscribe((params: TranslationChangeEvent) => {
     *     // do something
     * });
     * @type {EventEmitter<TranslationChangeEvent>}
     */
    onTranslationChange: EventEmitter<TranslationChangeEvent>;
    /**
     * An EventEmitter to listen to lang change events
     * onLangChange.subscribe((params: LangChangeEvent) => {
     *     // do something
     * });
     * @type {EventEmitter<LangChangeEvent>}
     */
    onLangChange: EventEmitter<LangChangeEvent>;
    private pending;
    private translations;
    private defaultLang;
    private langs;
    /**
     *
     * @param currentLoader An instance of the loader currently used
     * @param missingTranslationHandler A handler for missing translations.
     */
    constructor(currentLoader: TranslateLoader, parser: TranslateParser, missingTranslationHandler: MissingTranslationHandler);
    /**
     * Sets the default language to use as a fallback
     * @param lang
     */
    setDefaultLang(lang: string): void;
    /**
     * Gets the default language used
     * @returns string
     */
    getDefaultLang(): string;
    /**
     * Changes the lang currently used
     * @param lang
     * @returns {Observable<*>}
     */
    use(lang: string): Observable<any>;
    /**
     * Gets an object of translations for a given language with the current loader
     * @param lang
     * @returns {Observable<*>}
     */
    getTranslation(lang: string): Observable<any>;
    /**
     * Manually sets an object of translations for a given language
     * @param lang
     * @param translations
     * @param shouldMerge
     */
    setTranslation(lang: string, translations: Object, shouldMerge?: boolean): void;
    /**
     * Returns an array of currently available langs
     * @returns {any}
     */
    getLangs(): Array<string>;
    /**
     * @param langs
     * Add available langs
     */
    addLangs(langs: Array<string>): void;
    /**
     * Update the list of available langs
     */
    private updateLangs();
    /**
     * Returns the parsed result of the translations
     * @param translations
     * @param key
     * @param interpolateParams
     * @returns {any}
     */
    getParsedResult(translations: any, key: any, interpolateParams?: Object): any;
    /**
     * Gets the translated value of a key (or an array of keys)
     * @param key
     * @param interpolateParams
     * @returns {any} the translated key, or an object of translated keys
     */
    get(key: string | Array<string>, interpolateParams?: Object): Observable<string | any>;
    /**
     * Returns a translation instantly from the internal state of loaded translation.
     * All rules regarding the current language, the preferred language of even fallback languages will be used except any promise handling.
     * @param key
     * @param interpolateParams
     * @returns {string}
     */
    instant(key: string | Array<string>, interpolateParams?: Object): string | any;
    /**
     * Sets the translated value of a key
     * @param key
     * @param value
     * @param lang
     */
    set(key: string, value: string, lang?: string): void;
    /**
     * Changes the current lang
     * @param lang
     */
    private changeLang(lang);
    /**
     * Allows to reload the lang file from the file
     * @param lang
     * @returns {Observable<any>}
     */
    reloadLang(lang: string): Observable<any>;
    /**
     * Deletes inner translation
     * @param lang
     */
    resetLang(lang: string): void;
    /**
     * Returns the language code name from the browser, e.g. "de"
     *
     * @returns string
     */
    getBrowserLang(): string;
    /**
     * Returns the culture language code name from the browser, e.g. "de-DE"
     *
     * @returns string
     */
    getBrowserCultureLang(): string;
}
