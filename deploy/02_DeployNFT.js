const { network } = require("hardhat");
const { NFTFactory, NFT } = require("../hardhat.contracts.helpers");

let networkToUse = network.name;

const treasury = "0xeb1bB399997463d8Fd0cb85C89Da0fc958006441";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const accounts = await ethers.getSigners();
  const deployer = accounts[0];
  const feeRecipient = treasury;

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

  let { nft } = config;

  let numTokens = nft.numberOfTokens;
  let bps = 1000;
  // deploy nft
  let nftAddress = "0x1370c5C10829Efbbd43f5De5E0e76492284C91cd";
  // let nftAddress = await deployNFT(
  //   deployer,
  //   feeRecipient,
  //   networkConfirmations,
  //   nft.name,
  //   nft.symbol,
  //   nft.baseURI,
  //   numTokens,
  //   bps
  // );
  console.log(nftAddress);

  for (var i = 0; i < nft.receiverAddresses.length; i++) {
    // mint tokens
    await mintNft(
      deployer,
      nftAddress,
      nft.name,
      nft.symbol,
      nft.receiverAddresses[i],
      nft.numberOfTokens
    );

    let tokenId = i + 1;

    console.log("Minting tokenId: ", tokenId);
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

  const Erc721Factory = await deployments.get(NFTFactory);
  const erc721Factory = await ethers.getContractAt(
    NFTFactory,
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
      feeRecipient,
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
    `npx hardhat verify --network ${networkToUse} --contract contracts/${NFT}.sol:${NFT} ${nftAddress} "${name}" "${symbol}" "${baseURI}" "${deployer.address}" "${feeRecipient.address}" "${numTokens}" "${feeBps}"`
  );
  console.log("");
  console.log("");

  return nftAddress;
}

async function mintNft(admin, nftAddress, name, symbol, receiverAddress) {
  console.log("Minting tokens with the account:", admin.address);

  const erc721 = await ethers.getContractAt(NFT, nftAddress);

  console.log("------------------------------------------------------------");

  console.log("Minting to: ", receiverAddress);

  let mintTx = await erc721.connect(admin).mint(receiverAddress);

  console.log("Mint transaction: ");
  console.log(mintTx);

  console.log("Minting complete");
}

module.exports.tags = ["deployAndMintNfts"];
