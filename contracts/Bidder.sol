pragma solidity <0.6.0;

import "./Oracle.sol";

contract Bidder {
    address public owner;
    bool public subscriptions_open;
    uint public current_bet = 100000000000000000;
    uint public current_rate;
    Oracle public oracle;

    event PlayersMatched(address player_1, address player_2, uint current_bet);
    event Losers(string message);
    event Winner(address winner);
    event Draw(string message);

    struct Player {
        string name;
        address payable adr;
        bool bet;
    }

    modifier restricted() {
        require(msg.sender == owner, "Unauthorized action");
        _;
    }

    modifier closedSubscriptions() {
        require(subscriptions_open == false, "Unauthorized action");
        _;
    }

    mapping(uint => Player) public players;
    Player[] public playersArray;

    constructor(address oracleAdr) public {
        owner = msg.sender;
        subscriptions_open = true;
        oracle = Oracle(oracleAdr);
        current_rate = oracle.last_exchange_rate();
    }

    function subscribe(string memory name, bool bet) public payable {
        require(playersArray.length <= 2, "Two players are still playing wait for them to close the match");
        require(msg.value == current_bet, "Passed amount is different from the current bet");

        Player memory tmp = Player(name, msg.sender, bet);
        playersArray.push(tmp);
        players[playersArray.length-1] = playersArray[playersArray.length-1];

        if(playersArray.length == 2) {
            emit PlayersMatched(players[0].adr, players[1].adr, current_bet);
            subscriptions_open = false;
        }
    }

    function setBet(uint new_bet) public restricted {
        current_bet = new_bet;
    }

    function closeMatch() closedSubscriptions public {
        uint new_rate = checkLatestExchangeRate();

        bool result = new_rate > current_rate ? true : false;

        checkWinLos(result);

        subscriptions_open = true;

        delete playersArray;
    }

    function checkWinLos(bool result) internal {
        if(players[0].bet == result && players[1].bet == result) {
            //draw
            players[0].adr.transfer(current_bet/2);
            players[1].adr.transfer(current_bet/2);
            emit Draw("Draw each player will recieve the same amount (1 bet splitted)");

        } else if (players[0].bet == result) {
            //player 1 wins

            players[0].adr.transfer(2*current_bet);
            emit Winner(players[0].adr);
        } else if (players[1].bet == result) {
            //player 2 wins

            players[1].adr.transfer(2*current_bet);
            emit Winner(players[1].adr);
        }
        else {
            //nobody win

            emit Losers("Nobody win, contract keep the bets");
        }
    }

    function checkLatestExchangeRate() internal view returns(uint) {
        uint tmp = oracle.last_exchange_rate();
        require(tmp != current_rate, "Oracle is not update with the latest info, come back in a while");
        return tmp;
    }

    function depositFund() public payable {
        return;
    }

    function withdrawFund() public restricted {
        return msg.sender.transfer(address(this).balance);
    }
}
