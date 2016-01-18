var oModel = null;
var oModelCount = null;

sap.ui.define([
		"jquery.sap.global",
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel"
	], 
	
	function(jQuery, Controller, JSONModel) {
		"use strict";
	
		var PageController = Controller.extend("view.goalStart", {
	
			onInit : function (evt) {
				
				console.log("Test");
				// set mock model
				oModelCount = new sap.ui.model.json.JSONModel();
				//this.getView().setModel(oModel);
    			sap.ui.getCore().setModel(oModelCount, "count");				
				oModelCount.loadData("/ITM_GOAL/srv/goals/count");  
			},
			
			
			handleTilePress: function(oEvent) {
				
				this.loadGoalsModel();
				
				var app = this.getView().getParent();
				app.to("goalsOverview");
			},
			
	loadGoalsModel: function(){
		
		var objString;
		var jsonString;
		
		oModel = new sap.ui.model.json.JSONModel();
		sap.ui.getCore().setModel(oModel, "goals");
		
		oModel.loadData("/ITM_GOAL/srv/goals","",false);  
		
		var aGoals = oModel.getProperty("/");
		
		for(var i=0;i<aGoals.length;i++)
		{
			
			objString = JSON.stringify(aGoals[i]);
			objString = objString.replace("}", ",\"valueState\" : \"None\" }");
			objString = objString.replace("}", ",\"valueStateName\" : \"None\" }");			
			objString = objString.replace("}", ",\"colorClass\" : \"bgGreen\" }");		

			jsonString = jsonString + "," +objString;
		}
		
		jsonString = jsonString.replace("undefined","");
		jsonString = jsonString.replace(",", "[");
		jsonString = jsonString + "]";
		
		aGoals = JSON.parse(jsonString);
		oModel.setProperty("/", aGoals); 		
		
	}
		});
	
		return PageController;
});