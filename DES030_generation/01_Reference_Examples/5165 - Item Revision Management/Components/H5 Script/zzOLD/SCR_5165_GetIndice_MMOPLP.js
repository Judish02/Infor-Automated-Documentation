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

        var labelElement = new LabelElement();
        labelElement.Name = "5165_indice_label";
        labelElement.Value = "Indice";
        labelElement.Position = new PositionElement();
        labelElement.Position.Top = 5;
        labelElement.Position.Left = 1;
        contentElement.AddElement(labelElement);

        var textElement = new TextBoxElement();
        textElement.Name = "5165_indice_textbox";
        textElement.Value = "";
        textElement.Position = new PositionElement();
        textElement.Position.Top = 5;
        textElement.Position.Left = 15;
        textElement.Position.Width = 10;

        if (_this.controller.panel.mode === "5") {
            textElement.IsEnabled = false;
        }

        contentElement.AddElement(textElement);

        PLPN = _this.controller.GetValue("ROPLPN");

        // Fetch current value and populate the text box
        _this.getAlphaKPI(PLPN).then(function (response) {
            if (response.items && response.items.length > 0) {
                _this.controller.SetValue("5165_indice_textbox", response.items[0].AL30);
            }
            if (!(response.errorMessage === undefined)) {
                _this.controller.ShowMessage("Error: " + response.errorMessage);
            }
        });

        // Save on next-btn click
        $(document).ready(function () {
            $('#btn-next').click(async function () {
                await _this.saveValue();
            });
        });

        // Save on Enter key press
        $(document).on('keydown', '#5165_indice_textbox', async function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                await _this.saveValue();
            }
        });
    };

    SCR_5165_GetIndice_MMOPLP.prototype.saveValue = function () {
        var _this = this;
        var newValue = _this.controller.GetValue("5165_indice_textbox");
        return _this.chgAlphaKPI(PLPN, newValue);
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

    return SCR_5165_GetIndice_MMOPLP;
})();
