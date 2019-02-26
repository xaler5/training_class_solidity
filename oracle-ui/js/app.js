angular
    .module('oracleUi', [])
    .controller('oracleUiController', function ($http, $timeout) {

        var oracleUi = this;
        var oracleJson;

        oracleUi.step = 1;
        console.log(oracleUi);

        $http.get("./Oracle.json")
            .then(function(json) {
                oracleJson = json;
                console.log(json);
            })


        oracleUi.connect = function (event, host, address) {
            event.preventDefault();
            //here host and address are undefined
            console.log("HELLO");
            console.log(host);
            console.log(address);
            console.log(oracleUi.host);
            console.log(oracleUi.address);
            web3 = new Web3(new Web3.providers.HttpProvider(host));
            console.log(web3);

            var oracleContract = new web3.eth.contract(
                oracleJson.data.abi,
                address
            );
            console.log(oracleContract);

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
