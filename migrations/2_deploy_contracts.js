var Oracle = artifacts.require("./Oracle.sol");
var Bidder = artifacts.require("./Bidder.sol");

module.exports = function(deployer) {
  return deployer.deploy(Oracle);
};
