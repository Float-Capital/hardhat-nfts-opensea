const { network } = require("hardhat");
const {
  Factory,
  ,
} = require("../hardhat.contracts.helpers");

let networkToUse = network.name;

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const feeRecipient = accounts[1];

  let config;
  let networkConfirmations;

  if (networkToUse != "mumbai" && networkToUse != "polygon") {
    console.log(networkToUse);
    networkConfirmations = 0;
    config = require("../nfts/config/local");
  } else if (networkToUse === "polygon") {
    console.log(networkToUse);
    networkConfirmations = 2;
    config = require("../nfts/config/polygon");
  } else if (networkToUse === "mumbai") {
    console.log(networkToUse);
    networkConfirmations = 2;
    config = require("../nfts/config/mumbai");
  } else {
    throw new Error(`network ${networkToUse} un-accounted for`);
  }

  let { nfts } = config;

  for (var i = 0; i < nfts.length; i++) {
    let nft = nfts[i];
    let numTokens = nft.numberOfTokens;
    let bps = 1000;
    // deploy nft
    let nftAddress = await deployNFT(
      deployer,
      feeRecipient,
      networkConfirmations,
      nft.name,
      nft.symbol,
      nft.baseURI,
      numTokens,
      bps
    );
    console.log(nftAddress);

    // mint tokens
    await mintCollection(
      deployer,
      nftAddress,
      nft.name,
      nft.symbol,
      nft.receiverAddress,
      nft.numberOfTokens
    );
  }
};

async function deployNFT(
  deployer,
  feeRecipient,
  networkConfirmations,
  name,
  symbol,
  baseURI,
  numTokens,
  feeBps
) {
  console.log("Deploying NFTs with the account:", deployer.address);

  const Erc721Factory = await deployments.get(Factory);
  const erc721Factory = await ethers.getContractAt(
    Factory,
    Erc721Factory.address
  );
  console.log(numTokens);

  let tx = await erc721Factory
    .connect(deployer)
    .deployNFT(
      name,
      symbol,
      baseURI,
      deployer.address,
      feeRecipient.address,
      numTokens,
      feeBps
    );

  let receipt = await tx.wait(networkConfirmations);

  let nftAddress;
  for (var x = 0; x < receipt.events.length; x++) {
    let event = receipt.events[x];
    if (event["event"] == "NFTDeployed") {
      nftAddress = event["args"][0];
      console.log(event["event"]);
    }
  }

  console.log("NFT deployed to: ", nftAddress);

  console.log("");
  console.log("");
  console.log("Contract verification command");
  console.log("----------------------------------");
  console.log(
    `npx hardhat verify --network ${networkToUse} --contract contracts/${}.sol:${} ${nftAddress} "${name}" "${symbol}" "${baseURI}" "${deployer.address}" "${feeRecipient.address}" "${numTokens}" "${feeBps}"`
  );
  console.log("");
  console.log("");

  return nftAddress;
}

async function mintCollection(
  admin,
  nftAddress,
  name,
  symbol,
  receiverAddress,
  numberOfTokens
) {
  console.log("Minting tokens with the account:", admin.address);

  const erc721 = await ethers.getContractAt(, nftAddress);

  for (var i = 0; i < numberOfTokens; i++) {
    console.log("------------------------------------------------------------");

    let tokenId = i + 1;

    console.log("Minting tokenId: ", tokenId);
    console.log("Minting to: ", receiverAddress);

    let mintTx = await erc721.connect(admin).mint(receiverAddress);

    console.log("Mint transaction: ");
    console.log(mintTx);
  }
  console.log("Minting complete");
}

module.exports.tags = ["deployAndMintNfts"];
