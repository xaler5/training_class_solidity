pragma solidity <0.6.0;

import "./Oracle.sol";
import "./Player.sol";

contract Bidder {
    address public owner;

    Oracle public oracle;

    event Loser(address loser);
    event Winner(address winner);
    event PlayerCreated(string name, address adr, uint oracleCurrentValue, bool bet, uint betAmount);

    modifier restricted() {
        require(msg.sender == owner, "Unauthorized action");
        _;
    }

    Player[] public players;

    constructor(address oracleAdr) public {
        owner = msg.sender;
        oracle = Oracle(oracleAdr);
    }

    function createPlayer(string memory name, bool bet) public payable {
        uint oracleValue = getLatestExchangeRate();

        Player tmp = new Player(
            msg.sender,
            msg.value,
            oracleValue,
            name,
            bet
        );
        players.push(tmp);

        emit PlayerCreated(name, msg.sender, oracleValue, bet, msg.value);
    }

    function getPlayerCount() public view returns(uint) {
        return players.length;
    }

    function getPlayer(
        uint index
    ) public view returns(
        address adr,
        uint betAmount,
        uint currentOracleRate,
        string memory name,
        bool betChoide
    ) {
        return (
            players[index].adr(),
            players[index].betAmount(),
            players[index].currentOracleRate(),
            players[index].name(),
            players[index].betChoice()
        );
    }

    function closeMatch() public {
        uint new_rate = getLatestExchangeRate();

        checkWinLos(new_rate);

        delete players;
    }

    function checkWinLos(uint newRate) internal {

        for(uint i = 0; i < players.length; i++) {
            bool result = players[i].checkGame(newRate);
            address payable playerAdr =  players[i].adr();

            if(result) {
                playerAdr.transfer(2*players[i].betAmount());
                emit Winner(playerAdr);
            } else {
                emit Loser(playerAdr);
            }
        }
    }

    function getLatestExchangeRate() internal view returns(uint) {
        return oracle.last_exchange_rate();
    }

    function depositFund() public payable {
        return;
    }

    function withdrawFund() public restricted {
        return msg.sender.transfer(address(this).balance);
    }
}
