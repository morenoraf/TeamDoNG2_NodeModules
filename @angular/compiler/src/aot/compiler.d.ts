/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { CompileNgModuleMetadata } from '../compile_metadata';
import { CompilerConfig } from '../config';
import { CompileMetadataResolver } from '../metadata_resolver';
import { NgModuleCompiler } from '../ng_module_compiler';
import { OutputEmitter } from '../output/abstract_emitter';
import { StyleCompiler } from '../style_compiler';
import { SummaryResolver } from '../summary_resolver';
import { TemplateParser } from '../template_parser/template_parser';
import { ViewCompiler } from '../view_compiler/view_compiler';
import { AotCompilerHost } from './compiler_host';
import { GeneratedFile } from './generated_file';
import { StaticSymbol } from './static_symbol';
import { StaticSymbolResolver } from './static_symbol_resolver';
export declare class AotCompiler {
    private _config;
    private _host;
    private _metadataResolver;
    private _templateParser;
    private _styleCompiler;
    private _viewCompiler;
    private _ngModuleCompiler;
    private _outputEmitter;
    private _summaryResolver;
    private _localeId;
    private _translationFormat;
    private _genFilePreamble;
    private _symbolResolver;
    constructor(_config: CompilerConfig, _host: AotCompilerHost, _metadataResolver: CompileMetadataResolver, _templateParser: TemplateParser, _styleCompiler: StyleCompiler, _viewCompiler: ViewCompiler, _ngModuleCompiler: NgModuleCompiler, _outputEmitter: OutputEmitter, _summaryResolver: SummaryResolver<StaticSymbol>, _localeId: string | null, _translationFormat: string | null, _genFilePreamble: string | null, _symbolResolver: StaticSymbolResolver);
    clearCache(): void;
    compileAll(rootFiles: string[]): Promise<GeneratedFile[]>;
    private _compileSrcFile(srcFileUrl, ngModuleByPipeOrDirective, directives, pipes, ngModules, injectables);
    private _createSummary(srcFileUrl, directives, pipes, ngModules, injectables, targetStatements, targetExportedVars);
    private _compileModule(ngModuleType, targetStatements);
    private _compileComponentFactory(compMeta, ngModule, fileSuffix, targetStatements);
    private _compileComponent(compMeta, ngModule, directiveIdentifiers, componentStyles, fileSuffix, targetStatements);
    private _codgenStyles(fileUrl, stylesCompileResult, fileSuffix);
    private _codegenSourceModule(srcFileUrl, genFileUrl, statements, exportedVars);
}
export interface NgAnalyzedModules {
    ngModules: CompileNgModuleMetadata[];
    ngModuleByPipeOrDirective: Map<StaticSymbol, CompileNgModuleMetadata>;
    files: Array<{
        srcUrl: string;
        directives: StaticSymbol[];
        pipes: StaticSymbol[];
        ngModules: StaticSymbol[];
        injectables: StaticSymbol[];
    }>;
    symbolsMissingModule?: StaticSymbol[];
}
export interface NgAnalyzeModulesHost {
    isSourceFile(filePath: string): boolean;
}
export declare function analyzeNgModules(programStaticSymbols: StaticSymbol[], host: NgAnalyzeModulesHost, metadataResolver: CompileMetadataResolver): NgAnalyzedModules;
export declare function analyzeAndValidateNgModules(programStaticSymbols: StaticSymbol[], host: NgAnalyzeModulesHost, metadataResolver: CompileMetadataResolver): NgAnalyzedModules;
export declare function extractProgramSymbols(staticSymbolResolver: StaticSymbolResolver, files: string[], host: NgAnalyzeModulesHost): StaticSymbol[];
