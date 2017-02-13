import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	InitializeParams, InitializeResult, TextDocumentPositionParams,
	CompletionItem, CompletionItemKind, TextDocumentIdentifier
} from 'vscode-languageserver';
import Uri from 'vscode-uri';
import PhpmdService from '../service/PhpmdService';
import * as Xml2Js from 'xml2js';

import Pipeline from '../pipeline/Pipeline';
import ExampleStage from '../pipeline/ExampleStage';
import ExampleTask from '../pipeline/ExampleTask';

class PhpmdServerController
{
    constructor(
        private connection: IConnection,
        private service: PhpmdService
    ) { }

    public Validate(document: TextDocument | TextDocumentIdentifier)
    {
        // TODO: Create a pipeline to execute the process, parse its results and send the diagnostics

        // BOF async pipeline

        // Filter is a specialized type of stage starting a new pipeline for conditionally for the "subject"
        // Task is a specialized type of stage "doing" something
        // Parallel is a specialized type of stage running a several stages at once and waiting for all of them to complete

        let asyncPipeline = new Pipeline<string>();
        asyncPipeline.pipe(new ExampleTask<string>("a1", "b1"));
        asyncPipeline.pipe(new ExampleTask<string>("a2", "b2"));
        asyncPipeline.pipe(new ExampleTask<string>("a3", "b3"));
        asyncPipeline.run("test").then((data) => {
            // Do something with the result of the pipeline
            let a = data;
        });

        // EOF async pipeline

        let uri: string = document.uri;
        let path: string = Uri.parse(uri).fsPath;

        let process: Promise<string> = this.service.ExecuteProcess(path);

        process.then((value: string) => {
            let parser = new Xml2Js.Parser();
            
            parser.parseString(value, (error, result) => {
                // TODO: Move result.pmd.file[0].violation to a hydrator
                let diagnostics = this.service.getDiagnosticts(uri, result.pmd.file[0].violation);

                // Send the computed diagnostics to VSCode.
                this.connection.sendDiagnostics({ uri: uri, diagnostics });
            });
        });
    }
}

export default PhpmdServerController;