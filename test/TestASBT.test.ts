import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { solidity } from "ethereum-waffle";
import { deployments, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TestASBT, TestASBT__factory } from "../typechain";

chai.use(chaiAsPromised);
chai.use(solidity);
const expect = chai.expect;

// contract instances
let testASBT: TestASBT;

let owner: SignerWithAddress;
let address1: SignerWithAddress;
let address2: SignerWithAddress;

describe("Test ASBT", () => {
  before(async () => {
    [, owner, address1, address2] = await ethers.getSigners();
  });

  beforeEach(async () => {
    await deployments.fixture("TestASBT", {
      fallbackToGlobal: true
    });

    const { address: testASBTAddress } = await deployments.get("TestASBT");

    testASBT = TestASBT__factory.connect(testASBTAddress, owner);
  });

  describe("sbt information", () => {
    it("should be able to get sbt information", async () => {
      expect(await testASBT.name()).to.equal("Test ASBT");

      expect(await testASBT.symbol()).to.equal("TASBT");
    });
  });

  describe("mint", () => {
    it("should fail to mint from non minter address", async () => {
      await expect(
        testASBT
          .connect(address1)
          .mint(ethers.constants.AddressZero, address1.address)
      ).to.be.reverted;
    });

    it("should mint twice", async () => {
      await testASBT
        .connect(owner)
        .mint(ethers.constants.AddressZero, address1.address);
      await testASBT
        .connect(owner)
        .mint(ethers.constants.AddressZero, address1.address);

      expect(await testASBT.totalSupply()).to.equal(2);
      expect(await testASBT.tokenByIndex(0)).to.equal(0);
      expect(await testASBT.tokenByIndex(1)).to.equal(1);
    });

    it("should mint from minter address", async () => {
      const mintTx = await testASBT
        .connect(owner)
        .mint(ethers.constants.AddressZero, address1.address);
      const mintReceipt = await mintTx.wait();

      const toAddress = mintReceipt.events![1].args![1];

      expect(toAddress).to.equal(address1.address);
    });
  });

  describe("burn", () => {
    it("should burn", async () => {
      // we mint
      let mintTx = await testASBT
        .connect(owner)
        .mint(ethers.constants.AddressZero, address1.address);
      let mintReceipt = await mintTx.wait();
      const tokenId1 = mintReceipt.events![0].args![1].toNumber();

      // we mint again
      mintTx = await testASBT
        .connect(owner)
        .mint(ethers.constants.AddressZero, address1.address);
      mintReceipt = await mintTx.wait();
      const tokenId2 = mintReceipt.events![0].args![1].toNumber();

      expect(await testASBT.balanceOf(address1.address)).to.be.equal(2);
      expect(await testASBT["ownerOf(uint256)"](tokenId1)).to.be.equal(
        address1.address
      );
      expect(await testASBT["ownerOf(uint256)"](tokenId2)).to.be.equal(
        address1.address
      );

      await testASBT.connect(address1).burn(tokenId1);

      expect(await testASBT.balanceOf(address1.address)).to.be.equal(1);

      await testASBT.connect(address1).burn(tokenId2);

      expect(await testASBT.balanceOf(address1.address)).to.be.equal(0);
    });
  });

  describe("tokenUri", () => {
    it("should get a valid token URI from its tokenId", async () => {
      const mintTx = await testASBT
        .connect(owner)
        .mint(ethers.constants.AddressZero, address1.address);

      const mintReceipt = await mintTx.wait();
      const tokenId = mintReceipt.events![0].args![1].toNumber();
      const tokenUri = await testASBT.tokenURI(tokenId);

      // check if it's a valid url
      expect(() => new URL(tokenUri)).to.not.throw();
      // we expect that the token uri is already encoded
      expect(tokenUri).to.equal(encodeURI(tokenUri));
      expect(tokenUri).to.contain("testserver/");
    });
  });
});
