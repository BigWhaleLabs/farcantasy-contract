import { ethers } from 'hardhat'
import { expect } from 'chai'
import { utils } from 'ethers'

const baseUri = 'https://farcantasy.com/metadata/'

describe('Farcantasy contract tests', () => {
  before(async function () {
    this.accounts = await ethers.getSigners()
    this.owner = this.accounts[0]
    this.user = this.accounts[1]
    this.factory = await ethers.getContractFactory('Farcantasy')
  })

  describe('Constructor', function () {
    it('should deploy the contract with the correct fields', async function () {
      const name = 'Farcantasy'
      const symbol = 'FRCNTSY'
      const version = '1.0.0'
      const contract = await this.factory.deploy(name, symbol, version, baseUri)
      expect(await contract.name()).to.equal(name)
      expect(await contract.symbol()).to.equal(symbol)
    })
  })

  it('should correctly set idCap and mint', async function () {
    const contract = await this.factory.deploy(
      'Farcantasy',
      'FRCNTSY',
      '1.0.0',
      baseUri
    )
    expect(await contract.idCap()).to.equal(1000)
    await expect(
      contract.mint(0, { value: utils.parseEther('0.0065') })
    ).to.be.revertedWith('There is no genesis user here! Weird, right?')
    // Call setIdCap
    await contract.setIdCap(1)
    // Mint
    await contract.mint(1, { value: utils.parseEther('0.0065') })
    await expect(
      contract.mint(1, { value: utils.parseEther('0.0065') })
    ).to.be.revertedWith('Token already minted')
    await expect(
      contract.mint(2, { value: utils.parseEther('0.0065') })
    ).to.be.revertedWith('This token is unmintable yet, check back later!')
    // Increase cap
    await contract.setIdCap(10)
    // Try minting for free
    await expect(contract.mint(2)).to.be.revertedWith(
      'Value must be greater than 0.0065'
    )
    await expect(
      contract.mint(2, { value: utils.parseEther('0.0064') })
    ).to.be.revertedWith('Value must be greater than 0.0065')
    // Mint again
    await contract.mint(3, { value: utils.parseEther('0.0065') })
    const signer = (await ethers.getSigners())[0]
    expect(await signer.provider?.getBalance(signer.address)).to.equal(
      '9999996236770296819921'
    )
  })
})
