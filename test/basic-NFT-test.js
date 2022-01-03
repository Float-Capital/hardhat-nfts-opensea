const {
  Factory,
  ,
} = require("../hardhat.contracts.helpers");
const { expect } = require("chai");

describe(" NFT  contract", function () {
  let Factory;
  let deployer;
  let user1;
  let user2;
  let user3;
  let ;
  let name;
  let symbol;
  let testUri;
  let maxTokenAmount;
  let defaultBps = 1000;

  beforeEach(async function () {
    const accounts = await ethers.getSigners();
    deployer = accounts[0];
    user1 = accounts[1];
    user2 = accounts[2];
    user3 = accounts[3];
    salesRecipient = accounts[4];
    network = 0;

    maxTokenAmount = 10;

    const FactoryContract = await ethers.getContractFactory(
      Factory
    );

    Factory = await FactoryContract.deploy();
    name = "test";
    symbol = "TST";
    testUri = "testUri/";

    let deployTx = await Factory
      .connect(deployer)
      .deployNFT(
        name,
        symbol,
        testUri,
        deployer.address,
        salesRecipient.address,
        maxTokenAmount,
        defaultBps
      );
    await new Promise((res) => setTimeout(() => res(null), 5000));

    let nftAddress = await Factory.nfts(0);

     = await ethers.getContractAt(, nftAddress);
  });
  it("should  assign correct parameters when created", async function () {
    let nftSaleRecipient = await .saleFeesRecipient();
    await expect(nftSaleRecipient).to.be.equal(salesRecipient.address);
  });
  it("should allow owner to mint nft", async function () {
    await expect(.connect(deployer).mint(user1.address)).to.emit(
      ,
      "Transfer"
    );

    expect(await .ownerOf(1)).to.be.equal(user1.address);
  });
  it("should return correct uri", async function () {
    await expect(.connect(deployer).mint(user1.address)).to.emit(
      ,
      "Transfer"
    );
    let tokenUri = await .tokenURI(1);
    console.log(tokenUri);
    expect(tokenUri).to.be.equal(testUri + "1.json");
  });
  it("should not allow other account to mint", async function () {
    await expect(
      .connect(user1).mint(user1.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
  it("should not allow more than max mints", async function () {
    for (let i = 1; i <= maxTokenAmount; i++) {
      await .connect(deployer).mint(user1.address);
    }
    await expect(
      .connect(deployer).mint(user1.address)
    ).to.be.revertedWith("Max No. NFTS minted");
  });
  it("should support fee interface", async function () {
    let interfaceId = 0xb7799584;
    expect(await .connect(deployer).supportsInterface(interfaceId))
      .to.be.true;
  });
});
