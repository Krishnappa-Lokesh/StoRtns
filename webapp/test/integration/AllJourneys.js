jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 stortnhdrSet in the list
// * All 3 stortnhdrSet have at least one stortnItems

sap.ui.require([
	"sap/ui/test/Opa5",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/App",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Browser",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Master",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Detail",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Create",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "edu.jh.mh.stoRtns.StoRtns.view."
	});

	sap.ui.require([
		"edu/jh/mh/stoRtns/StoRtns/test/integration/MasterJourney",
		"edu/jh/mh/stoRtns/StoRtns/test/integration/NavigationJourney",
		"edu/jh/mh/stoRtns/StoRtns/test/integration/NotFoundJourney",
		"edu/jh/mh/stoRtns/StoRtns/test/integration/BusyJourney",
		"edu/jh/mh/stoRtns/StoRtns/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});