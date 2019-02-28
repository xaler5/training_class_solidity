var Oracle = artifacts.require("./Oracle.sol");

module.exports = function(deployer) {
  return deployer.deploy(Oracle);
};
