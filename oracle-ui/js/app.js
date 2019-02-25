angular
    .module('oracleUi', [])
    .controller('oracleUiController', function ($http, $timeout) {
        var oracleUi = this;

        oracleUi.step = 1;
        console.log(oracleUi);


        $http.get("./Oracle.json")
            .then(function(oracleJson) {
                console.log(oracleJson);
            })

        
        oracleUi.connect = function (event, host, address) {
            event.preventDefault();

            oracleUi.connecting = true;
            console.log('connected');

            console.log('connecting to ', host);
            
            
            $timeout(function () {
                oracleUi.connecting = true;
                $('#toast-connect').toast('show');
                oracleUi.step = 2;
            }, 2000)
        }

        oracleUi.setPrice = function (event, price) {
            event.preventDefault();
        }
    })