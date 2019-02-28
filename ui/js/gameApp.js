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

            return this;
        }

        gameUi.step = 1;
        gameUi.master = /\?master/.test(location.search);
        gameUi.players = [];
        gameUi.winners = [];

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

            bidderContract.PlayerCreated({fromBlock: "latest"},function(error, result){

                if (!error) {
                    var balance = web3.fromWei(web3.eth.getBalance(result.args.adr).toNumber(), 'ether');
                    var betAmount = web3.fromWei(result.args.betAmount.toNumber(), 'ether');
                    var tmpPlayer = new Player(
                        result.args.name,
                        result.args.adr,
                        betAmount,
                        result.args.bet ? "It goes up" : "It goes down",
                        result.args.oracleCurrentValue.toNumber() / 10000,
                        balance
                    );
                    $timeout(function() {
                        gameUi.players.push(tmpPlayer);
                    });
                } else {
                      console.log("Error recieving createdPlayer")
                      console.log(error);
                }
             });

             bidderContract.Winner({fromBlock: "latest"},function(error, result){
                 if (!error) {
                       console.log("WINNER");
                       for(var i = 0; i < gameUi.players.length; i++) {
                           if(gameUi.players[i].address == result.args.winner) {
                               console.log(gameUi.players[i]);
                               gameUi.winners.push(gameUi.players[i]);
                           }
                       }
                 } else {
                       console.log("Error recieving winner")
                       console.log(error);
                 }
              });

              bidderContract.Loser({fromBlock: "latest"},function(error, result){
                  if (!error) {
                      console.log("LOSER");
                      for(var i = 0; i < gameUi.players.length; i++) {
                          if(gameUi.players[i].address == result.args.loser) {
                              console.log(gameUi.players[i])
                          }
                      }
                  } else {
                        console.log("Error recieving loser event")
                        console.log(error);
                  }
               });

            $timeout(function () {
                gameUi.connecting = true;
                $('#toast-connect').toast('show');
                gameUi.step = 2;
            }, 2000)

        }

        gameUi.closeMatch = function () {
            console.log('close match');
            bidderContract.closeMatch({from: accounts[0], gas: 2000000}, function(err,res) {
                if(err)  {
                    console.log(err);
                } else {
                    $timeout(function () {
                        gameUi.players = gameUi.winners;
                    }, 1000);
                }
            });

        }

        gameUi.createPlayer = function (event, playerName, playerBet, playerAmount) {
            event.preventDefault();
            if(!playerName) return null;

            var bet;
            if(playerBet == "It will go up") bet = true;
            else if(playerBet == "It will go down") bet = false;
            else return null;

            //convert amount to wei
            if(!playerAmount) return null;
            amount = playerAmount * 10e17;

            gameUi.creatingPlayer = true;

            bidderContract.createPlayer(
                playerName,
                bet,
                {
                    from: accounts[gameUi.players.length],
                    value: amount,
                    gas: 2000000
                },
                function(err, res) {
                    if(err) console.log(err);
                }
            )

            $timeout(function () {
                gameUi.creatingPlayer = true;
            }, 2000)
        }
    })
