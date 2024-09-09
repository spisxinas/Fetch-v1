sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
function (Controller) {
    "use strict";
/////////////////////////////////////////////////////////////////////////////////////////////////
    return Controller.extend("callgeneratior.controller.View1", {
         // Initialize the model and attach event listeners for paste and URL change
         onInit: function () {
            var oModel = new sap.ui.model.json.JSONModel({
                headers: [],
                params: [] // This will hold our query parameters
            });
            this.getView().setModel(oModel);

            var oUrlInput = this.byId("apiUrlInput");
            oUrlInput.attachLiveChange(this.onUrlChanged.bind(this));
        },
///////////////////////////////////////////////////////////////////////////////////////////////////
        // Take the parameters and dynamically add them to the Query params Section
        onUrlChanged: function () {
            var oUrlInput = this.byId("apiUrlInput").getValue();
        
            // Check if the input is not empty
            if (oUrlInput && oUrlInput.trim() !== "") {
                try {
                    // var url = new URL(oUrlInput);  // Ensure the URL is valid
                    this.extractQueryParams(oUrlInput);  // Extract and update query params
                } catch (error) {
                    var oModel = this.getView().getModel();
                    oModel.setProperty("/params", []);
                    console.error("Invalid URL entered:", oUrlInput);
                    
                }
            } else {
                // If the input is empty, clear the query parameters
                console.log("Input is empty, clearing query parameters.");
                var oModel = this.getView().getModel();
                oModel.setProperty("/params", []);  // Clear the parameters array
            }
        },
//////////////////////////////////////////////////////////////////////////////////////////////////     
        // Function to extract query parameters from the URL and update them in the model
        extractQueryParams: function (urlString) {
            try {
                var url = new URL(urlString);
                var searchParams = new URLSearchParams(url.search);
        
                var params = [];
                searchParams.forEach(function(value, key) {
                    params.push({ key: key, value: value });
                });
        
                // Update the params in the model
                var oModel = this.getView().getModel();
                oModel.setProperty("/params", params);  // Dynamically update parameters
            } catch (e) {
                var oModel = this.getView().getModel();
                oModel.setProperty("/params", []);
                console.error("Error parsing URL:", e);
                
            }
        },
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Add a new header to the headers list
        onAddHeader: function () {
            var oModel = this.getView().getModel();
            var headers = oModel.getProperty("/headers");
            headers.push({ name: "", value: "" });
            oModel.setProperty("/headers", headers);
        },

        // Generate the fetch code based on input and model data
        onGenerateCode: function () {
            var oView = this.getView();
            var apiUrl = oView.byId("apiUrlInput").getValue();
            var method = oView.byId("httpMethodSelect").getSelectedKey();
            var headers = this.getView().getModel().getProperty("/headers");
            var params = this.getView().getModel().getProperty("/params");
            var body = oView.byId("requestBodyInput").getValue();

            // Build headers object
            var headersObj = {};
            headers.forEach(function(header) {
                headersObj[header.name] = header.value;
            });

            // Build query params string
            var paramsString = params.map(function(param) {
                return encodeURIComponent(param.key) + "=" + encodeURIComponent(param.value);
            }).join("&");

            // Generate the fetch code
            var fetchCode = `
                fetch('${apiUrl}?${paramsString}', {
                    method: '${method}',
                    headers: ${JSON.stringify(headersObj)},
                    body: ${body ? `'${body}'` : 'null'}
                }).then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error('Error:', error));
            `;

            // Display generated code
            oView.byId("generatedCodeArea").setValue(fetchCode);
        },

        // Copy the generated code to the clipboard
        onCopyCode: function () {
            var code = this.getView().byId("generatedCodeArea").getValue();
            navigator.clipboard.writeText(code).then(function() {
                console.log('Code copied to clipboard!');
            });
        }
    });
});
