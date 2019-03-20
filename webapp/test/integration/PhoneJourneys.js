jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/App",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Browser",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Master",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/Detail",
	"edu/jh/mh/stoRtns/StoRtns/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "edu.jh.mh.stoRtns.StoRtns.view."
	});

	sap.ui.require([
		"edu/jh/mh/stoRtns/StoRtns/test/integration/NavigationJourneyPhone",
		"edu/jh/mh/stoRtns/StoRtns/test/integration/NotFoundJourneyPhone",
		"edu/jh/mh/stoRtns/StoRtns/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});