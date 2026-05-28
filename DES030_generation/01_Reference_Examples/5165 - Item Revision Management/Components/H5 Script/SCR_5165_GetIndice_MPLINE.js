/**
 *
 * AUTHOR: Assootosh Dev Motah
 * email: assootosh.motah@spoonconsulting.com
 *
 * @Note
 *     If changes are needed to be done on the script.
 *     Kindly email the last person who modified to provide the latest typescript file.
 *
 * @CHANGELOGS
 * USER                 ActionLog   Date        Description
 *                      SCR5165     2026-04-20  Fetch Indice via PPS200MI.GetLine (UCA9) instead of CUSEXTMI.GetAlphaKPI
 *                      SCR5165     2026-04-20  Persist Indice via PPS200MI.UpdLine (UCA9) instead of CUSEXTMI.ChgAlphaKPI
 *                      SCR5165     2026-05-12  Write CUGEX3 trigger flag (KPID 5165_MPLINE, AL30 = "1") before PPS200MI.UpdLine so the workflow fires
 */
var SCR_5165_GetIndice_MPLINE = /** @class */ (function () {

    var CONO = ScriptUtil.GetUserContext().CONO;
    var PUNO = null;
    var PNLI = null;
    var PNLS = null;

    function SCR_5165_GetIndice_MPLINE(scriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        if (this.version >= 2.0) {
            this.miService = MIService;
        } else {
            this.miService = MIService.Current;
        }
    }

    SCR_5165_GetIndice_MPLINE.Init = function (args) {
        new SCR_5165_GetIndice_MPLINE(args).run();
    };

    SCR_5165_GetIndice_MPLINE.prototype.run = function () {
        var _this = this;

        // GetContentElement must be called synchronously — before any async work
        var contentElement = this.controller.GetContentElement();

        PUNO = _this.controller.GetValue("IAPUNO");
        PNLI = _this.controller.GetValue("WWPNLI");
        PNLS = _this.controller.GetValue("WWPNLS");

        // PPS200MI.GetLine: send 0 when PNLI/PNLS are empty
        if (PNLI === null || PNLI === undefined || (typeof PNLI === "string" && PNLI.trim() === "")) {
            PNLI = 0;
        }
        if (PNLS === null || PNLS === undefined || (typeof PNLS === "string" && PNLS.trim() === "")) {
            PNLS = 0;
        }

        if ($('#scr5165_indice_textbox_mpline').length === 0) {
            var labelElement = new LabelElement();
            labelElement.Name = "scr5165_indice_label_mpline";
            labelElement.Value = "Indice";
            labelElement.Position = new PositionElement();
            labelElement.Position.Top = 7;
            labelElement.Position.Left = 40;
            contentElement.AddElement(labelElement);

            var textElement = new TextBoxElement();
            textElement.Name = "scr5165_indice_textbox_mpline";
            textElement.Value = "";
            textElement.Position = new PositionElement();
            textElement.Position.Top = 7;
            textElement.Position.Left = 50;
            textElement.Position.Width = 10;

            if (_this.controller.panel.mode === "5") {
                textElement.IsEnabled = false;
            }

            contentElement.AddElement(textElement);
        }

        // Bind handlers via a namespace and always .off() before .on() so we end up
        // with exactly ONE keydown + ONE click handler, no matter how many times
        // run() is invoked (panel re-entry, framework re-mount, etc.).
        var NS = '.scr5165_mpline';
        $(document)
            .off('keydown' + NS)
            .on('keydown' + NS, '#scr5165_indice_textbox_mpline', async function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    await _this.saveValue();
                }
            });
        $(document)
            .off('click' + NS, '#btn-next')
            .on('click' + NS, '#btn-next', async function () {
                await _this.saveValue();
            });

        // Fetch current value from PO line and populate the text box (UCA9)
        _this.getPPS200Line(PUNO, PNLI, PNLS).then(function (response) {
            var row = response.item || (response.items && response.items.length > 0 ? response.items[0] : null);
            if (row && row.UCA9 !== undefined && row.UCA9 !== null) {
                _this.controller.SetValue("scr5165_indice_textbox_mpline", row.UCA9);
            }
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
        });
    };

    SCR_5165_GetIndice_MPLINE.prototype.saveValue = function () {
        var _this = this;
        // Re-entry lock: Enter on a textbox often also fires the panel's
        // "Next" button click; both handlers race into saveValue. Coalesce.
        if (_this._savePending) {
            return _this._savePending;
        }
        var newValue = _this.controller.GetValue("scr5165_indice_textbox_mpline");
        var pending = _this.updPPS200Line(PUNO, PNLI, PNLS, newValue);
        _this._savePending = pending;
        pending.then(
            function () { _this._savePending = null; },
            function () { _this._savePending = null; }
        );
        return pending;
    };

    SCR_5165_GetIndice_MPLINE.prototype.getPPS200Line = function (PUNO, PNLI, PNLS) {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "PPS200MI";
        myRequest.transaction = "GetLine";
        myRequest.record = {
            PUNO: PUNO,
            PNLI: PNLI,
            PNLS: PNLS
        };
        myRequest.outputFields = ["UCA9"];
        myRequest.includeMetadata = true;
        myRequest.typedOutput = true;

        return _this.miService.executeRequestV2(myRequest).then(function (response) {
            return response;
        });
    };

    SCR_5165_GetIndice_MPLINE.prototype.updPPS200Line = function (PUNO, PNLI, PNLS, UCA9) {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "PPS200MI";
        myRequest.transaction = "UpdLine";
        myRequest.record = {
            PUNO: PUNO,
            PNLI: PNLI,
            PNLS: PNLS,
            UCA9: UCA9
        };

        return _this.miService.executeRequestV2(myRequest).then(function (response) {
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
            return response;
        });
    };

    return SCR_5165_GetIndice_MPLINE;
})();
