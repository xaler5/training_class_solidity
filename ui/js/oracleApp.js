angular
    .module('oracleUi', [])
    .controller('oracleUiController', function ($http, $timeout, $scope) {

        var oracleUi = this;
        var oracleJson;
        var oracleContract;
        var accounts;
        var web3;
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

            oracleContract.NewValue({fromBlock: "latest"},function(error, result){

                if (!error) {
                    $timeout(function () {
                       oracleUi.currentPrice = result.args.value.toNumber() / 10000;
                    }, 1000)
                }
            });

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
                function(error, result) {
                    $timeout(function () {
                      oracleUi.currentPrice = oracleContract.last_exchange_rate().toString(10) / 10000;
                    }, 1000)
                }
            );
        }
    })
