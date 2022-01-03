const { network } = require("hardhat");
const { Factory } = require("../hardhat.contracts.helpers");

let networkToUse = network.name;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];

  let config;

  if (networkToUse != "mumbai" && networkToUse != "polygon") {
    console.log(networkToUse);
  } else if (networkToUse === "polygon") {
    console.log(networkToUse);
  } else if (networkToUse === "mumbai") {
    console.log(networkToUse);
  } else {
    throw new Error(`network ${networkToUse} un-accounted for`);
  }

  let FactoryContract = await deploy(Factory, {
    from: deployer.address,
    log: true,
  });

  console.log(" NFT Factory deployed to: ", FactoryContract.address);

  if (networkToUse == "mumbai" || networkToUse == "polygon") {
    console.log(networkToUse);
    console.log("");
    console.log("");
    console.log("Contract verification command");
    console.log("----------------------------------");
    console.log(
      `npx hardhat verify --network ${networkToUse} --contract contracts/${Factory}.sol:${Factory} ${FactoryContract.address}  `
    );
    console.log("");
    console.log("");
  }
};

module.exports.tags = ["deployFactory"];
