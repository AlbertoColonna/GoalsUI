var userModel	= null;
var periodNotValid   = 1;
var nameNotValid	 = 2;
var checkSuccessfull = 3;
var settingsModel = null;
var oModel = null;
var oThis = null;

sap.ui.define([
		"sap/m/MessageToast"
	], 
	

sap.ui.controller("view.goalsOverview", { 
	
	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf view.View1
	 */
	onInit: function () {
		
		oThis = this;
		
	    userModel =  new sap.ui.model.json.JSONModel();
	   	userModel.loadData("/ITM_GOAL/srv/goals/user");  
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
		
	},

	onAdd: function() {
    	oModel = sap.ui.getCore().getModel("goals");
		var aGoals = oModel.getProperty("/");
		var aUser   = userModel.getProperty("/userName");
	
		var oNewGoal =
		{
		     name	  : "",
		     start	  : "",
		     due	  : "",
		     state	  : "None",
		     userName : aUser
		};
		
		aGoals.push(oNewGoal);
		oModel.setProperty("/", aGoals); 
		
		$('html, body').animate({scrollTop:$(document).height()}, 'slow');
    },
    
    onSave: function(onEvent) {
        oModel = sap.ui.getCore().getModel("goals");
        var oData = oModel.getJSON();               
        var aGoals = oModel.getProperty("/");
        var validityCheck = this.checkGoalData(aGoals);
        
        //If time period or goal name are not valid, don't save data
        switch(validityCheck) {
        	case periodNotValid:
        		sap.m.MessageToast.show("The start date must be earlier than the due date.");
        		break;
        	case nameNotValid:
    			sap.m.MessageToast.show("The name of goal cannot be empty. Please specify a name.");        		
    			break;
    		default:
    			break;
        }
        if(validityCheck == checkSuccessfull) {
	        var async = typeof sync !== "undefined" ? async : true;
	        var ajaxData = jQuery.ajax({
	        	type : "POST",
	            contentType : "application/json;charset=UTF-8",
	            url : "/ITM_GOAL/srv/goals",
	            data : oData,
	            async: async,
	    			success: function(data) {
/*	    				oModel = new sap.ui.model.json.JSONModel();
						sap.ui.getCore().setModel(oModel, "goals");
						oModel.loadData("/ITM_GOAL/srv/goals");  */
						oThis.loadGoalsModel();	
	    				sap.m.MessageToast.show("Your goals have been successfully saved.");
	            	},
	        		error: function (response) {
	    				sap.m.MessageToast.show("An error occured when trying to save your goals.");
	    			}
	        });  
        }
	},	
	
	onCancel: function(oEvent){
		if(!this.oDialogF){
			this.oDialogF = sap.ui.xmlfragment("view.Dialog", this);
			this.getView().addDependent(this.oDialogF);
		}
		this.oDialogF.open();
	},
	
	onCloseDialog: function (oEvent) {
		this.oDialogF.close();
	},

	onCancelDialog: function(oEvent){
								// set mock model
		var oModelCount = new sap.ui.model.json.JSONModel();
    	oModelCount = sap.ui.getCore().getModel("count");
		oModelCount.loadData("/ITM_GOAL/srv/goals/count");  
						
		
		var app = this.getView().getParent();
		app.to("goalStart");
		this.oDialogF.close();
	},
	
	checkGoalRow: function (goals){
		var name = "";
		var rowCount = 0;
		
		console.log("Test Test Test");
		
		for(var i=0;i<goals.length;i++) {
			if(rowCount < name[i].split(/\r|\r\n|\n/).length){
	    			rowCount = name[i].split(/\r|\r\n|\n/).length;
	    		}
		}
	},
	
	checkGoalData: function (goals) {
		var dateStart = null;
		var dateDue   = null;
		var name = "";
        var aGoals = oModel.getProperty("/");	
        var goalsTmp = [];

		
        for(var i=0;i<goals.length;i++) {
    		dateStart = new Date(goals[i].start);
    		dateDue   = new Date(goals[i].due);  
                                               
    		if(dateDue.getTime() < dateStart.getTime()) {
    			goals[i].valueState = "Error";
				aGoals = goals;
				oModel.setProperty("/", aGoals);  			
				
    			return periodNotValid;
			}
			else{
    			goals[i].valueState = "None";
				aGoals = goals;
				oModel.setProperty("/", aGoals);  			
			}
			
			name = goals[i].name;

			//Check if goal name is empty
			if(!name.trim()) {
    			goals[i].valueStateName = "Error";
				aGoals = goals;
				oModel.setProperty("/", aGoals);  				
				
    			return nameNotValid;
    		}
    		else
    		{  
    			goals[i].valueStateName = "None";
				aGoals = goals;
				oModel.setProperty("/", aGoals);  	    			
    		}
		}
		
		return checkSuccessfull;
	},
	
	statusColor: function (sStatus) {
		    console.log("TestX");
		    
			switch (sStatus) {
				case "None":
					return "bgGreen";
				case "Off Target":
					return "bgRed";
				case "On Track":
					return "bgBlue";
				case "Achieved":
					return "bgRed";
				case "No Longer Valid":
					return "bgRed";
				default:
					return sStatus;
			}
		}
	
})
);