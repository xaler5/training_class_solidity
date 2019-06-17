angular
    .module('gameUi', [])
    .controller('gameUiController', function ($http, $timeout, $scope, $location) {
        var gameUi = this;
        var bidderJson;
        var bidderContract;
        var accounts;
        var web3;

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
            this.winner = false;
            this.loser = false;

            return this;
        }

        gameUi.step = 1;
        gameUi.master = /\?master/.test(location.search);
        gameUi.players = [];
        gameUi.currentRate;

        $http.get("js/Bidder.json")
            .then(function(json) {
                bidderJson = json;
            }
        )

        var loadValues = function(error, result) {
            $timeout(function() {
                gameUi.currentRate = result.toNumber() / 10000;
            });
        };

        gameUi.connect = function (event, host, address) {
            event.preventDefault();

            gameUi.connecting = true;

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
                            result[4],
                            result[2].toNumber() / 10000,
                            balance
                        )

                        gameUi.players.push(tmpPlayer);
                    });
                }
            });

            bidderContract.getLatestExchangeRate(function(error, result) {
                $timeout(function() {
                    gameUi.currentRate = result.toNumber() / 10000;
                });
            });

            bidderContract.PlayerCreated({fromBlock: "latest"},function(error, result){
                if (!error) {
                    var balance = web3.fromWei(web3.eth.getBalance(result.args.adr).toNumber(), 'ether');
                    var betAmount = web3.fromWei(result.args.betAmount.toNumber(), 'ether');
                    var tmpPlayer = new Player(
                        result.args.name,
                        result.args.adr,
                        betAmount,
                        result.args.bet,
                        result.args.oracleCurrentValue.toNumber() / 10000,
                        balance
                    );

                    $timeout(function() {
                        gameUi.players.push(tmpPlayer);
                    });
                } else {
                      console.log("Error receiving createdPlayer")
                      console.log(error);
                }
            });

            bidderContract.Winner({fromBlock: "latest"},function(error, result){
                if (error) {
                    console.log("Error recieving winner")
                    console.log(error);
                    return;
                }
                $timeout(function() {
                    for(var i = 0; i < gameUi.players.length; i++) {
                        if(gameUi.players[i].address == result.args.winner) {
                            gameUi.players[i].winner = true;
                            return;
                        }
                    }
                });
            });

            bidderContract.Loser({fromBlock: "latest"},function(error, result){
                if (error) {
                    console.log("Error recieving loser")
                    console.log(error);
                    return;
                }

                $timeout(function() {
                    for(var i = 0; i < gameUi.players.length; i++) {
                        if(gameUi.players[i].address == result.args.loser) {
                            gameUi.players[i].loser = true;
                            return;
                        }
                    }
                });
            });

            $timeout(function () {
                gameUi.connecting = false;
                $('#toast-connect').toast('show');
                gameUi.step = 2;
            }, 2000)

            $timeout(function () {
                $('#toast-connect').toast('hide');
            }, 6000)
        }

        gameUi.createPlayer = function (event, playerName, playerBet, playerAmount) {
            event.preventDefault();

            var bet =!!parseInt(playerBet);

            if(!playerName || !playerAmount) return;

            gameUi.creatingPlayer = true;

            //convert amount to wei
            amount = playerAmount * 10e17;

            bidderContract.createPlayer(
                playerName,
                bet,
                {
                    from: accounts[gameUi.players.length],
                    value: amount,
                    gas: 2000000
                },
                function(err, res) {
                    if(err) {
                        console.log(err);
                        gameUi.creatingPlayer = true;
                    }
                }
            )

        }

        gameUi.reset = function () {
            $timeout(function() {
                gameUi.players = [];
                gameUi.creatingPlayer = false;
            });
        }

        gameUi.closeMatch = function () {
            bidderContract.closeMatch({from: accounts[0], gas: 6721974}, function(err,res) {
                if(err)  {
                    console.log(err);
                    return;
                }
                bidderContract.getLatestExchangeRate(loadValues)
            });
        }
    })
