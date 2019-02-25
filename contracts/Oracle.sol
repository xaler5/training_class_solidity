pragma solidity >=0.4.21 <0.6.0;

contract Oracle {
  address public owner;
  uint public last_exchange_rate = 11355;

  constructor() public {
    owner = msg.sender;
  }

  modifier restricted() {
    require(msg.sender == owner);
    _;
  }

  function set(uint new_exchange_rate) public restricted {
    last_exchange_rate = new_exchange_rate;
  }
}

