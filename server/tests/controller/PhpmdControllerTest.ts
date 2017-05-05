import { Pipeline } from "@open-sourcerers/j-stillery";
import { assert, expect } from "chai";
import { only, skip, slow, suite, test, timeout } from "mocha-typescript";
import * as sinon from "sinon";
import { Diagnostic, IConnection, Position, Range, TextDocumentIdentifier } from "vscode-languageserver";
import PhpmdController from "../../src/controller/PhpmdController";
import PipelinePayloadFactory from "../../src/factory/PipelinePayloadFactory";
import IPhpmdSettingsModel from "../../src/model/IPhpmdSettingsModel";
import PipelinePayloadModel from "../../src/model/PipelinePayloadModel";

@suite("PhpMD controller")
class PhpmdControllerTest {

    @test("Should send diagnostics")
    public assertSendDiagnostics(done) {
        // Arrange
        // =======
        // Fake settings
        let settings = <IPhpmdSettingsModel> {
            configurationFile: "",
            executable: "test",
            rules: "cleancode,codesize,controversial,design,unusedcode,naming"
        };

        // Fake document
        let document = <TextDocumentIdentifier> {
            uri: "test"
        };

        // Fake diagnostic
        let diagnostic = <Diagnostic> {};
        diagnostic.range = <Range> {
            end: {
                character: Number.MAX_VALUE,
                line: 0
            },
            start: {
                character: 0,
                line: 0
            }
        };
        diagnostic.severity = 1;
        diagnostic.code = null;
        diagnostic.source = "Test";
        diagnostic.message = "Lorem ipsum dolor";

        // Fake pipeline payload
        let payload = <PipelinePayloadModel> {};
        payload.uri = document.uri;
        payload.diagnostics = <Diagnostic[]> [diagnostic];

        // Stub connection
        let connection = <IConnection> {};
        connection.sendDiagnostics = (params) => {
            // Assert
            // ======
            // Expect params to match fakes
            expect(params.uri).to.equal(document.uri);
            expect(params.diagnostics).to.equal(payload.diagnostics);
            done(); // End test
        };

        // Stub pipeline payload factory
        let pipelinePayloadFactory = <PipelinePayloadFactory> {};
        pipelinePayloadFactory.setUri = (uri: string) => { return pipelinePayloadFactory; };
        pipelinePayloadFactory.create = () => { return payload; };

        // Stub pipeline
        let pipeline = new Pipeline<PipelinePayloadModel>();

        // Create and configure controller
        let controller = new PhpmdController(connection, settings);
        controller.setPipeline(pipeline);
        controller.setPipelinePayloadFactory(pipelinePayloadFactory);

        // Act
        // ===
        controller.Validate(document);
    }
};