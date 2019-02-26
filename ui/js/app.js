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
            
        var gameUi = this;
        var bidderJson;
        var bidderContract;
        var accounts;
        var web3;
        var name1;
        var bet1;
        var amount1;
        var name2;
        var bet2;
        var amount2;
        gameUi.step = 1;

        $http.get("js/Bidder.json")
            .then(function(json) {
                bidderJson = json;
            }
        )

        gameUi.connect = function (event, host, address) {
            event.preventDefault();

            web3 = new Web3(new Web3.providers.HttpProvider(host));

            bidderContract = web3.eth.contract(
                bidderJson.data.abi
            ).at(address);

            web3.eth.getAccounts(function(error, result) {
                accounts = result;
            });

            gameUi.connecting = true;

            $timeout(function () {
                gameUi.connecting = true;
                $('#toast-connect').toast('show');
                gameUi.step = 2;
            }, 2000)
        }

        gameUi.subscribePlayer1 = function (event, playerName1, playerBet1, playerAmount1) {
            event.preventDefault();

            if(!playerName1) return null;

            if(playerBet1 = "Up") bet1 = true;
            else if(playerBet2 = "Down") bet1 = false;
            else return null;

            //convert amount to wei
            if(!playerAmount1) return null;
            amount1 = playerAmount1 * 10e17;

            gameUi.subscribingPlayer1 = true;

            bidderContract.subscribe(
                playerName1,
                bet1,
                {
                    from: accounts[0],
                    value: amount1,
                    gas: 2000000
                },
                (error, result) => {
                    $timeout(() => {
                        $('#toast-connect').toast('hide');
                        gameUi.playerAddress1 = accounts[1];
                        gameUi.playerAmount1 = bidderContract.current_bet();
                        gameUi.playerName1 = bidderContract.players[0]().name;
                        gameUi.playerBet1 = bidderContract.players[0]().bet ? "It will go up" : "It will go down";
                    })
                }
            )

            $timeout(function () {
                gameUi.subscribingPlayer1 = true;
                gameUi.step = 3;
            }, 2000)
        }

        gameUi.subscribePlayer2 = function (event, playerName2, playerBet2, playerAmount2) {
            event.preventDefault();

            if(!playerName2) return null;

            if(playerBet2 = "Up") bet2 = true;
            else if(playerBet2 = "Down") bet2 = false;
            else return null;

            //convert amount to wei
            if(!playerAmount2) return null;
            amount2 = playerAmount2 * 10^18;

            gameUi.subscribingPlayer2 = true;

            bidderContract.subscribe(
                playerName2,
                bet2,
                {
                    from: accounts[2],
                    value: amount2,
                    gas: 2000000
                },
                (error, result) => {
                    $timeout(() => {
                        gameUi.subscribingPlayer2 = true;
                        gameUi.playerAddress2 = accounts[2];
                        gameUi.playerAmount2 = bidderContract.current_bet();
                        gameUi.playerName2 = bidderContract.players[0]().name;
                        gameUi.playerBet2 = bidderContract.players[0]().bet ? "It will go up" : "It will go down";
                    })
                }
            )

            $timeout(function () {
                gameUi.subscribingPlayer2 = true;
                gameUi.step = 4;
            }, 2000)
        }

    })
