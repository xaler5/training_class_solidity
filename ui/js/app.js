angular
    .module('oracleUi', [])
    .controller('oracleUiController', function ($http, $timeout, $scope) {

        var oracleUi = this;
        var oracleJson;
        var oracleContract;
        var accounts;
        oracleUi.step = 1;

        $http.get("js/Oracle.json")
            .then(function(json) {
                oracleJson = json;
            })

        oracleUi.connect = function (event, host, address) {
            event.preventDefault();

            web3 = new Web3(new Web3.providers.HttpProvider(host));

            oracleContract = web3.eth.contract(
                oracleJson.data.abi
            ).at(address);

            web3.eth.getAccounts(function(error, result) {
                accounts = result;
            });

            oracleUi.currentPrice = oracleContract.last_exchange_rate().toString(10) / 10000;
            oracleUi.connecting = true;

            $timeout(function () {
                oracleUi.connecting = true;
                $('#toast-connect').toast('show');
                oracleUi.step = 2;
            }, 2000)
        }

        oracleUi.setPrice = (event, price) => {
            event.preventDefault();
            var finalPrice = price * 10000;


            oracleContract.set(
                finalPrice,
                {from: accounts[0]},
                (error, result) => {
                    $timeout(() => oracleUi.currentPrice = oracleContract.last_exchange_rate().toString(10) / 10000)
                }
            )
        }
    })

    angular
        .module('gameUi', [])
        .controller('gameUiController', function ($http, $timeout, $scope) {

    })
