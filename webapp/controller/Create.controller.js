/*global location */
sap.ui.define([
	"edu/jh/mh/stoRtns/StoRtns/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"edu/jh/mh/stoRtns/StoRtns/model/formatter",
	"sap/ui/core/message/Message",
	"sap/ui/core/MessageType",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem"
], function (BaseController,
	JSONModel,
	formatter,
	Message,
	MessageType,
	MessageBox,
	MessageToast,
	MessagePopover,
	MessagePopoverItem) {
	"use strict";

	return BaseController.extend("edu.jh.mh.stoRtns.StoRtns.controller.Create", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				dataChanged: false,
				delay: 0,
				mode: "create",
				lineItemListTitle: this.getResourceBundle().getText("detailLineItemTableHeading")
			});

			this.getRouter().getRoute("creObject").attachPatternMatched(this._onObjectMatched, this);
			this.setModel(oViewModel, "viewModel");
			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
			this._oODataModel = this.getOwnerComponent().getModel();
			this._oResourceBundle = this.getResourceBundle();

		},
		
		
		onExit: function () {

		},




		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		onMessagesButtonPress: function (oEvent) {

			var oMessagesButton = oEvent.getSource();
			if (!this._messagePopover) {
				this._messagePopover = new MessagePopover({
					items: {
						path: "message>/",
						template: new MessagePopoverItem({
							description: "{message>description}",
							type: "{message>type}",
							title: "{message>message}"
						})
					}
				});
				oMessagesButton.addDependent(this._messagePopover);
			}
			this._messagePopover.toggle(oMessagesButton);
		},

		/**
		 * Event handler (attached declaratively) for the view Create Rtn Order button.  
		 * @function
		 * @public
		 */

		onSegmentedBtnPressed: function (oEvent) {
			var oSource = oEvent.getSource();
			var sSelectedBtnKey = oSource.getSelectedKey();

			var oTable = this.getView().byId(sap.ui.core.Fragment.createId("frgItemDetails", "lineItemsList"));
			var oItems = oTable.getItems();
			var oModel = this.getOwnerComponent().getModel();

			Object.keys(oItems).forEach(function (nItemIndex) {
				var sPath = oItems[nItemIndex].getBindingContextPath();
				var sZrEbeln = oModel.getProperty(sPath + "/ZrEbeln");

				if (sZrEbeln === "" && sSelectedBtnKey === "selSegBtn2") {
					oModel.setProperty(sPath + "/Zslctd", "X");
					oModel.setProperty(sPath + "/RtMenge", oModel.getProperty(sPath + "/Menge"));
				} else {
					oModel.setProperty(sPath + "/Zslctd", "");
					oModel.setProperty(sPath + "/RtMenge", "0.000");
				}
			});
			this.setViewDataChanged(oModel.hasPendingChanges());

		},

		onChangeCheckbox: function (event) {
			var oSource = event.getSource();
			var sValueCheckBox = oSource.getSelected();
			var sPathCheckBox = oSource.getBindingContext().sPath;

			var oTable = this.getView().byId(sap.ui.core.Fragment.createId("frgItemDetails", "lineItemsList"));
			var oItems = oTable.getItems();
			var oModel = this.getOwnerComponent().getModel();

			Object.keys(oItems).forEach(function (nItemIndex) {
				var sPathCurrentItem = oItems[nItemIndex].getBindingContextPath();
				var aCells = oItems[nItemIndex].getCells();
				if (sPathCurrentItem === sPathCheckBox) {
					if (sValueCheckBox === true) {
						oModel.setProperty(sPathCurrentItem + "/Zslctd", "X");
						oModel.setProperty(sPathCurrentItem + "/RtMenge", oModel.getProperty(sPathCurrentItem + "/Menge"));

						var oGrundField = aCells.find(function (element) {
							var sGrundNameExp = "cbGrundEdit";
							if (element.getId().includes(sGrundNameExp)) {
								element.setRequired(true);
							}
						});

					} else {
						oModel.setProperty(sPathCurrentItem + "/Zslctd", "");
						oModel.setProperty(sPathCurrentItem + "/RtMenge", "0.000");
					}
				}
			});

			this.setViewDataChanged(oModel.hasPendingChanges());

		},

		hideMaster: function (oEvent) {
			//@sap.ui.Button
			var oSource = oEvent.getSource();

			var oControl = this.getView().getParent().getParent();
			if (oControl.getMode() === "ShowHideMode") {
				oControl.setMode(sap.m.SplitAppMode.HideMode);
				oSource.setIcon("sap-icon://exit-full-screen");
			} else {
				oControl.setMode(sap.m.SplitAppMode.ShowHideMode);
				oSource.setIcon("sap-icon://full-screen");
			}

		},

		handleValidationError: function (oEvent) {
			//var oSource = oEvent.getSource();
			//var sId = oSource.getId();
			// getting dynamic Input control created using view, concat it with 'value' property of input 
			var oMessageTarget = oEvent.getSource().getId() + "/value";
			var oMessageProcessor = new sap.ui.core.message.ControlMessageProcessor();
			var oMessageManager = sap.ui.getCore().getMessageManager();

			// change value state on error 
			//oEvent.getSource().setValueState(sap.ui.core.ValueState.Error);

			// registering message processor to message manager 
			oMessageManager.registerMessageProcessor(oMessageProcessor);

			// adding new message to message model 
			oMessageManager.addMessages(new sap.ui.core.message.Message({
				message: "Please enter Reason code",
				type: sap.ui.core.MessageType.Error,
				target: oMessageTarget,
				processor: oMessageProcessor
			}));

		},

		handleValidationSuccess: function (oEvent) {

			// change value state on error 
			oEvent.getSource().setValueState(sap.ui.core.ValueState.None);

			// get message manager 
			var oMessageManager = sap.ui.getCore().getMessageManager();
			// Extract and remove the technical messages
			oMessageManager.removeAllMessages();


			var oModel = this.getOwnerComponent().getModel();
			this.setViewDataChanged(oModel.hasPendingChanges());

		},

		setViewDataChanged: function (bDataChanged) {
			var oViewModel = this.getView().getModel("viewModel");
			oViewModel.setProperty("/dataChanged", bDataChanged);
		},

		onRtnQtyEntered: function (oEvent) {
			var oSource = oEvent.getSource();
			var nRtnQtyValue = oSource.getValue();

			var oBindingContext = oSource.getBindingContext();
			var nQtyValue = oBindingContext.oModel.getProperty(oBindingContext.sPath + "/Menge");
			if ( parseInt(nRtnQtyValue,10) > parseInt(nQtyValue,10)) {
				oSource.setValueState("Error");
				oSource.setValueStateText("Please enter Rtn Qty less than issued Qty");
			} else {
				oSource.setValueState("None");
				oSource.setValueStateText("");
			}
		},

		/**
		 * Event handler (attached declaratively) for the view save button. Saves the changes added by the user. 
		 * @function
		 * @public
		 */

		onSave: function (oSBEvent) {

			var that = this,
				oModel = this.getModel(),
				oAppModel = this.getModel("appView"),
				oViewModel = this.getModel("viewModel");

			// abort if the  model has not been changed
			if (!oModel.hasPendingChanges()) {
				MessageBox.information(
					this._oResourceBundle.getText("noChangesMessage"), {
						id: "noChangesInfoMessageBox",
						styleClass: that.getOwnerComponent().getContentDensityClass()
					}
				);
				return;
			}

			var bHasErrors = false;
			sap.ui.getCore().getMessageManager().removeAllMessages();
			
			// Set the Comment length to 25
			var oComment = this.getView().byId(sap.ui.core.Fragment.createId("frgItemDetails", "headerComment"));
			var sComment = oComment.getValue();
			if (sComment.length > 25 ) {
				oComment.setValue( sComment.substr(0,25) );
			}

			// Validate Item Values
			var oTable = this.getView().byId(sap.ui.core.Fragment.createId("frgItemDetails", "lineItemsList"));
			var oItems = oTable.getItems();

 
			Object.keys(oItems).forEach(function (nItemIndex) {
				var sPathCurrentItem = oItems[nItemIndex].getBindingContextPath();

				var oLineItem = oItems[nItemIndex].getBindingContext().getObject();
				var aCells = oItems[nItemIndex].getCells();
			
				if ( oLineItem.Zslctd === "X"  &&  ( oLineItem.Grund === "" || oLineItem.Grund === "0000" ) ) {

					aCells.find(function (listItem) {
						if (listItem.getId().includes("cbGrundEdit")) {

							listItem.setValueState("Error");
							var sMessageText = "Please enter Reason code for item " + oLineItem.Ebelp;

							var oMessage = new Message({
								message: sMessageText,
								type: MessageType.Error,
								target: sPathCurrentItem + "/Grund",
								processor: oViewModel
							});
							sap.ui.getCore().getMessageManager().addMessages(oMessage);
							bHasErrors = true;

						}
					});

				}

				if ( oLineItem.Zslctd === "X"  
						&& ( parseInt(oLineItem.RtMenge,10)  > parseInt(oLineItem.Menge,10) 
						||  oLineItem.RtMenge === "0" 
						||  oLineItem.RtMenge === "" 
						) ) {

					aCells.find(function (listItem) {
						if (listItem.getId().includes("inputRtMenge")) {

							listItem.setValueState("Error");
							var sMessageText = "Please enter return Qty equal or less than Issued Qty for Item " + oLineItem.Ebelp;

							var oMessage = new Message({
								message: sMessageText,
								type: MessageType.Error,
								target: sPathCurrentItem + "/RtMenge",
								processor: oViewModel
							});
							sap.ui.getCore().getMessageManager().addMessages(oMessage);
							bHasErrors = true;

						}
					});

				}

			});

			if (bHasErrors) {
				return;
			}

			oAppModel.setProperty("/busy", true);
			// attach to the request completed event of the batch
			oModel.attachEventOnce("batchRequestCompleted", function (oEvent) {
				if (that._checkIfBatchRequestSucceeded(oEvent)) {
					that._fnUpdateSuccess();
				} else {
					that._fnUpdateFailed();
					MessageBox.error(that._oResourceBundle.getText("updateError"));
				}
			});

			oModel.submitChanges({
				// Success Message
				success: function () {
					MessageToast.show("Return Order Created", {
						duration: 3000, // default
						width: "15em", // default
						my: sap.ui.core.Popup.Dock.CenterCenter,
						at: sap.ui.core.Popup.Dock.CenterCenter,
						of: window, // default
						offset: "0 0", // default
						collision: "fit fit", // default
						onClose: null, // default
						autoClose: false, // default
						animationTimingFunction: "ease", // default
						animationDuration: 1000, // default
						closeOnBrowserNavigation: true // default
					});

					oAppModel.setProperty("/busy", false);
					that.setViewDataChanged(false);

				}

			}, {
				//Error Message
				error: function () {
					MessageToast.show("Error updating record");
				}
			});
		},




		/**
		 * Event handler (attached declaratively) for the view cancel button. Asks the user confirmation to discard the changes. 
		 * @function
		 * @public
		 */
		onCancel: function () {

			sap.ui.getCore().getMessageManager().removeAllMessages();

			// check if the model has been changed
			if (this.getModel().hasPendingChanges()) {
				// get user confirmation first
				this._showConfirmQuitChanges(); // some other thing here....
			} else {
				// cancel without confirmation
				this._navBack();
			}
		},


		/* =========================================================== */
		/* Internal functions
		/* =========================================================== */


		/**
		 * Opens a dialog letting the user either confirm or cancel the quit and discard of changes.
		 * @private
		 */
		_showConfirmQuitChanges: function () {
			var oComponent = this.getOwnerComponent(),
				oModel = this.getModel();
			var that = this;
			MessageBox.confirm(
				this._oResourceBundle.getText("confirmCancelMessage"), {
					styleClass: oComponent.getContentDensityClass(),
					onClose: function (oAction) {
						if (oAction === sap.m.MessageBox.Action.OK) {
							oModel.resetChanges();
							that._navBack();
						}
					}
				}
			);
		},

		_checkIfBatchRequestSucceeded: function (oEvent) {
			var oParams = oEvent.getParameters();
			var aRequests = oEvent.getParameters().requests;
			var oRequest;
			if (oParams.success) {
				if (aRequests) {
					for (var i = 0; i < aRequests.length; i++) {
						oRequest = oEvent.getParameters().requests[i];
						if (!oRequest.success) {
							return false;
						}
					}
				}
				return true;
			} else {
				return false;
			}
		},

		/**
		 * Handles the success of updating an object
		 * @private
		 */

		_fnUpdateSuccess: function (oEvent) {
			this.getModel("appView").setProperty("/busy", false);
			this.getView().unbindObject();
			//this.getRouter().getTargets().display("object");
			this._navBack();

		},

		/**
		 * Handles the failure of creating/updating an object
		 * @private
		 */
		_fnUpdateFailed: function () {
			this.getModel("appView").setProperty("/busy", false);

		},

		/**
		 * Navigates back in the browser history, if the entry was created by this app.
		 * If not, it navigates to the Details page
		 * @private
		 */
		_navBack: function () {
			var oHistory = sap.ui.core.routing.History.getInstance(),
				sPreviousHash = oHistory.getPreviousHash();

			this.getView().unbindObject();
			if (sPreviousHash !== undefined) {
				// The history contains a previous entry
				history.go(-1);
			} else {

				this.getRouter().navTo("object", {
					Ebeln: this.getModel("viewModel").getProperty("/sObjectId")
				}, true);
			}
		},

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var oParameter = oEvent.getParameter("arguments");
			for (var value in oParameter) {
				if (oParameter.hasOwnProperty(value)) {
					oParameter[value] = decodeURIComponent(oParameter[value]);
				}
			}
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("stortnhdrSet", oParameter);
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("viewModel");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		/**
		 * Event handler for binding change event
		 * @function
		 * @private
		 */

		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding(),
				oViewModel = this.getModel("viewModel"),
				oAppViewModel = this.getModel("appView");

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getBoundContext().getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Ebeln,
				sObjectName = oObject.Ebeln;

			oViewModel.setProperty("/sObjectId", sObjectId);
			oViewModel.setProperty("/sObjectPath", sPath);
			oAppViewModel.setProperty("/itemToSelect", sPath);
			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("shareSaveTileAppTitle", [sObjectName]));
			oViewModel.setProperty("/shareOnJamTitle", sObjectName);
			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));

			oViewModel.attachPropertyChange(function (oEvent) {
				this.setViewDataChanged(this.getModel().hasPendingChanges());
			}.bind(this));

			var oSegBtnGrp = this.getView().byId(sap.ui.core.Fragment.createId("frgItemDetails", "segBtnGrp"));
			oSegBtnGrp.setSelectedKey("selSegBtn1");

		},

		/**
		 * Event handler for metadata loaded event
		 * @function
		 * @private
		 */

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("viewModel"),
				oLineItemTable = this.getView().byId(sap.ui.core.Fragment.createId("frgItemDetails", "lineItemsList")),
				oSegBtnGrp = this.getView().byId(sap.ui.core.Fragment.createId("frgItemDetails", "segBtnGrp")),
				iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);
			oViewModel.setProperty("/lineItemTableDelay", 0);

			oLineItemTable.attachEventOnce("updateFinished", function () {
				// Restore original busy indicator delay for line item table
				oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
			});

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
			oSegBtnGrp.setSelectedItem("selSegBtn1");

		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function () {
			var oViewModel = this.getModel("viewModel");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/**
		 * Event handler when the share in JAM button has been clicked
		 * @public
		 */
		onShareInJamPress: function () {
			var oViewModel = this.getModel("viewModel"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});

			oShareDialog.open();
		}

	});
});