/**
 *
 * AUTHOR: 
 * email: 
 *
 * @Note
 *     If changes are needed to be done on the script.
 *     Kindly email the last person who modified to provide the latest typescript file.
 *
 * @CHANGELOGS
 * USER                 ActionLog   Date        Description
 */
var SCR_5165_GetIndice_MMOPLP = /** @class */ (function () {

    var CONO = ScriptUtil.GetUserContext().CONO;
    var PLPN = null;

    function SCR_5165_GetIndice_MMOPLP(scriptArgs) {
        this.controller = scriptArgs.controller;
        this.log = scriptArgs.log;
        if (this.version >= 2.0) {
            this.miService = MIService;
        } else {
            this.miService = MIService.Current;
        }
    }

    SCR_5165_GetIndice_MMOPLP.Init = function (args) {
        new SCR_5165_GetIndice_MMOPLP(args).run();
    };

    SCR_5165_GetIndice_MMOPLP.prototype.run = function () {
        var _this = this;

        // GetContentElement must be called synchronously — before any async work
        var contentElement = this.controller.GetContentElement();

        PLPN = _this.controller.GetValue("ROPLPN");

        if ($('#scr5165_indice_textbox_mmoplp').length === 0) {
            var labelElement = new LabelElement();
            labelElement.Name = "scr5165_indice_label_mmoplp";
            labelElement.Value = "Indice";
            labelElement.Position = new PositionElement();
            labelElement.Position.Top = 5;
            labelElement.Position.Left = 1;
            contentElement.AddElement(labelElement);

            var textElement = new TextBoxElement();
            textElement.Name = "scr5165_indice_textbox_mmoplp";
            textElement.Value = "";
            textElement.Position = new PositionElement();
            textElement.Position.Top = 5;
            textElement.Position.Left = 15;
            textElement.Position.Width = 10;

            if (_this.controller.panel.mode === "5") {
                textElement.IsEnabled = false;
            }

            contentElement.AddElement(textElement);
        }

        // Bind handlers via a namespace and always .off() before .on() so we end up
        // with exactly ONE keydown + ONE click handler, no matter how many times
        // run() is invoked (panel re-entry, framework re-mount, etc.).
        var NS = '.scr5165_mmoplp';
        $(document)
            .off('keydown' + NS)
            .on('keydown' + NS, '#scr5165_indice_textbox_mmoplp', async function (e) {
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
        _this.getAlphaKPI(PLPN).then(function (response) {
            if (response.items && response.items.length > 0) {
                _this.controller.SetValue("scr5165_indice_textbox_mmoplp", response.items[0].AL30);
            }
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
        });
    };

    SCR_5165_GetIndice_MMOPLP.prototype.saveValue = function () {
        var _this = this;
        // Re-entry lock: Enter on a textbox often also fires the panel's
        // "Next" button click; both handlers race into saveValue. Coalesce.
        if (_this._savePending) {
            return _this._savePending;
        }
        var newValue = _this.controller.GetValue("scr5165_indice_textbox_mmoplp");
        // Decide between ChgAlphaKPI (row exists in CUGEX3) and AddAlphaKPI (row missing).
        // GetAlphaKPI returns an errorMessage and/or an empty items[] when the CUGEX3 row does not exist.
        var pending = _this.getAlphaKPI(PLPN).then(function (response) {
            var recordExists =
                response &&
                response.errorMessage === undefined &&
                response.items &&
                response.items.length > 0;
            if (recordExists) {
                return _this.chgAlphaKPI(PLPN, newValue);
            }
            return _this.addAlphaKPI(PLPN, newValue);
        });
        _this._savePending = pending;
        pending.then(
            function () { _this._savePending = null; },
            function () { _this._savePending = null; }
        );
        return pending;
    };

    SCR_5165_GetIndice_MMOPLP.prototype.getAlphaKPI = function (PLPN) {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "CUSEXTMI";
        myRequest.transaction = "GetAlphaKPI";
        myRequest.record = {
            KPID: "5165_MMOPLP",
            PK01: PLPN
        };

        return _this.miService.executeRequestV2(myRequest).then(function (response) {
            return response;
        });
    };

    SCR_5165_GetIndice_MMOPLP.prototype.chgAlphaKPI = function (PLPN, AL30) {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "CUSEXTMI";
        myRequest.transaction = "ChgAlphaKPI";
        myRequest.record = {
            KPID: "5165_MMOPLP",
            PK01: PLPN,
            AL30: AL30
        };

        return _this.miService.executeRequestV2(myRequest).then(function (response) {
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
            return response;
        });
    };

    SCR_5165_GetIndice_MMOPLP.prototype.addAlphaKPI = function (PLPN, AL30) {
        var _this = this;
        var myRequest = new MIRequest();
        myRequest.program = "CUSEXTMI";
        myRequest.transaction = "AddAlphaKPI";
        myRequest.record = {
            KPID: "5165_MMOPLP",
            PK01: PLPN,
            AL30: AL30
        };

        return _this.miService.executeRequestV2(myRequest).then(function (response) {
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
            return response;
        });
    };

    return SCR_5165_GetIndice_MMOPLP;
})();
