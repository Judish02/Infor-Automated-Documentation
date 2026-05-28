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
 */
var SCR_5165_GetIndice_MPOPLP = /** @class */ (function () {

    var CONO = ScriptUtil.GetUserContext().CONO;
    var PLPN = null;
    var PLPS = null;

    function SCR_5165_GetIndice_MPOPLP(scriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        if (this.version >= 2.0) {
            this.miService = MIService;
        } else {
            this.miService = MIService.Current;
        }
    }

    SCR_5165_GetIndice_MPOPLP.Init = function (args) {
        new SCR_5165_GetIndice_MPOPLP(args).run();
    };

    SCR_5165_GetIndice_MPOPLP.prototype.run = function () {
        var _this = this;

        // GetContentElement must be called synchronously — before any async work
        var contentElement = this.controller.GetContentElement();

        PLPN = _this.controller.GetValue("POPLPN");
        PLPS = _this.controller.GetValue("POPLPS");

        // CUSEXTMI: send 0 (int) when PLPS is empty
        if (PLPS === null || PLPS === undefined || (typeof PLPS === "string" && PLPS.trim() === "")) {
            PLPS = 0;
        }

        if ($('#scr5165_indice_textbox_mpoplp').length === 0) {
            var labelElement = new LabelElement();
            labelElement.Name = "scr5165_indice_label_mpoplp";
            labelElement.Value = "Indice";
            labelElement.Position = new PositionElement();
            labelElement.Position.Top = 7;
            labelElement.Position.Left = 80;
            contentElement.AddElement(labelElement);

            var textElement = new TextBoxElement();
            textElement.Name = "scr5165_indice_textbox_mpoplp";
            textElement.Value = "";
            textElement.Position = new PositionElement();
            textElement.Position.Top = 7;
            textElement.Position.Left = 90;
            textElement.Position.Width = 10;

            if (_this.controller.panel.mode === "5") {
                textElement.IsEnabled = false;
            }

            contentElement.AddElement(textElement);
        }

        // Bind handlers via a namespace and always .off() before .on() so we end up
        // with exactly ONE keydown + ONE click handler, no matter how many times
        // run() is invoked (panel re-entry, framework re-mount, etc.).
        var NS = '.scr5165_mpoplp';
        $(document)
            .off('keydown' + NS)
            .on('keydown' + NS, '#scr5165_indice_textbox_mpoplp', async function (e) {
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

        // Fetch current value and populate the text box
        _this.getAlphaKPI(PLPN, PLPS).then(function (response) {
            if (response.items && response.items.length > 0) {
                _this.controller.SetValue("scr5165_indice_textbox_mpoplp", response.items[0].AL30);
            }
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
        });
    };

    SCR_5165_GetIndice_MPOPLP.prototype.saveValue = function () {
        var _this = this;
        // Re-entry lock: Enter on a textbox often also fires the panel's
        // "Next" button click; both handlers race into saveValue. Coalesce.
        if (_this._savePending) {
            return _this._savePending;
        }
        var newValue = _this.controller.GetValue("scr5165_indice_textbox_mpoplp");
        // Decide between ChgAlphaKPI (row exists in CUGEX3) and AddAlphaKPI (row missing).
        // GetAlphaKPI returns an errorMessage and/or an empty items[] when the CUGEX3 row does not exist.
        var pending = _this.getAlphaKPI(PLPN, PLPS).then(function (response) {
            var recordExists =
                response &&
                response.errorMessage === undefined &&
                response.items &&
                response.items.length > 0;
            if (recordExists) {
                return _this.chgAlphaKPI(PLPN, PLPS, newValue);
            }
            return _this.addAlphaKPI(PLPN, PLPS, newValue);
        });
        _this._savePending = pending;
        pending.then(
            function () { _this._savePending = null; },
            function () { _this._savePending = null; }
        );
        return pending;
    };

    SCR_5165_GetIndice_MPOPLP.prototype.getAlphaKPI = function (PLPN, PLPS) {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "CUSEXTMI";
        myRequest.transaction = "GetAlphaKPI";
        myRequest.record = {
            KPID: "5165_MPOPLP",
            PK01: PLPN,
            PK02: PLPS
        };

        return _this.miService.executeRequestV2(myRequest).then(function (response) {
            return response;
        });
    };

    SCR_5165_GetIndice_MPOPLP.prototype.chgAlphaKPI = function (PLPN, PLPS, AL30) {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "CUSEXTMI";
        myRequest.transaction = "ChgAlphaKPI";
        myRequest.record = {
            KPID: "5165_MPOPLP",
            PK01: PLPN,
            PK02: PLPS,
            AL30: AL30
        };

        return _this.miService.executeRequestV2(myRequest).then(function (response) {
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
            return response;
        });
    };

    SCR_5165_GetIndice_MPOPLP.prototype.addAlphaKPI = function (PLPN, PLPS, AL30) {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "CUSEXTMI";
        myRequest.transaction = "AddAlphaKPI";
        myRequest.record = {
            KPID: "5165_MPOPLP",
            PK01: PLPN,
            PK02: PLPS,
            AL30: AL30
        };

        return _this.miService.executeRequestV2(myRequest).then(function (response) {
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
            return response;
        });
    };

    return SCR_5165_GetIndice_MPOPLP;
})();
