pragma solidity <0.6.0;

contract Player {
  address payable public adr;

  uint public betAmount;
  uint public currentOracleRate;

  string public name;

  bool public betChoice;

  constructor(address payable _adr, uint _betAmount, uint _currentOracleRate, string memory _name, bool _betChoice) public {
    adr = _adr;
    betAmount = _betAmount;
    currentOracleRate = _currentOracleRate;
    name = _name;
    betChoice = _betChoice;
  }

  function checkGame(
      uint oracleRate
  ) public view returns(bool) {
      if(
          currentOracleRate > oracleRate && !betChoice ||
          currentOracleRate < oracleRate && betChoice
      ) {
          return true;
      }
      return false;
  }
}
