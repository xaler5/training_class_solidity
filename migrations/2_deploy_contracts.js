var Oracle = artifacts.require("./Oracle.sol");
var Bidder = artifacts.require("./Bidder.sol");

module.exports = function(deployer) {
  deployer.deploy(Oracle).then(function(instance) {
      return deployer.deploy(Bidder, instance.address);
  });
};
