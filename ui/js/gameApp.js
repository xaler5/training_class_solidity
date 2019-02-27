angular
    .module('gameUi', [])
    .controller('gameUiController', function ($http, $timeout, $scope, $location) {

        var gameUi = this;
        var bidderJson;
        var bidderContract;
        var accounts;
        var web3;
        console.log(location.search);

        gameUi.master = /\?master/.test(location.search);
        gameUi.players = [];
        var Player = function (
            name,
            address,
            betAmount,
            betChoice,
            oracleCurrentRate,
            balance
        ) {
            this.name = name;
            this.address = address;
            this.betAmount = betAmount;
            this.betChoice = betChoice;
            this.oracleCurrentRate = oracleCurrentRate;
            this.balance = balance;

            return this;
        }

        gameUi.step = 1;

        $http.get("js/Bidder.json")
            .then(function(json) {
                bidderJson = json;
            }
        )

        gameUi.closeMatch = function () {
            console.log('close match');
            //select winner and
        }

        gameUi.connect = function (event, host, address) {
            event.preventDefault();

            web3 = new Web3(new Web3.providers.HttpProvider(host));

            bidderContract = web3.eth.contract(
                bidderJson.data.abi
            ).at(address);

            web3.eth.getAccounts(function(error, result) {
                accounts = result;
            });

            bidderContract.getPlayerCount(function(error, result) {

                for(var i = 0; i < result.toNumber(); i++) {
                    bidderContract.getPlayer(i, function(error, result) {
                        var balance = web3.fromWei(web3.eth.getBalance(result[0]).toNumber(), 'ether');
                        var betAmount = web3.fromWei(result[1].toNumber(), 'ether');
                        var tmpPlayer = new Player(
                            result[3],
                            result[0],
                            betAmount,
                            result[4] ? "It goes up" : "It goes down",
                            result[2].toNumber() / 10000,
                            balance
                        )

                        gameUi.players.push(tmpPlayer);
                    });
                }
            });

            gameUi.connecting = true;

            $timeout(function () {
                gameUi.connecting = true;
                $('#toast-connect').toast('show');
                gameUi.step = 2;
            }, 2000)

        }

        gameUi.createPlayer = function (event, playerName, playerBet, playerAmount) {
            event.preventDefault();

            if(!playerName) return null;

            var bet;
            if(playerBet = "It will go up") bet = true;
            else if(playerBet = "It will go down") bet = false;
            else return null;

            //convert amount to wei
            if(!playerAmount) return null;
            amount = playerAmount * 10e17;

            gameUi.creatingPlayer = true;
            var indexAddress = gameUi.players.length > 0 ? gameUi.players.length - 1 : 0

            bidderContract.createPlayer(
                playerName,
                bet,
                {
                    from: accounts[indexAddress],
                    value: amount,
                    gas: 2000000
                },
                (err, res) => {
                    bidderContract.getPlayer(gameUi.players.length-1, function(error, result) {
                        var balance = web3.fromWei(web3.eth.getBalance(result[0]).toNumber(), 'ether');
                        var betAmount = web3.fromWei(result[1].toNumber(), 'ether');
                        var tmpPlayer = new Player(
                            result[3],
                            result[0],
                            betAmount,
                            result[4] ? "It goes up" : "It goes down",
                            result[2].toNumber() / 10000,
                            balance
                        );
                        $timeout(() => {
                            gameUi.players.push(tmpPlayer);
                        })
                    })
                }
            )

            $timeout(function () {
                gameUi.creatingPlayer = true;
                //gameUi.step = 3;
            }, 2000)
        }
    })
