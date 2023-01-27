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
    const version = '1.0.0'
    const contract = await this.factory.deploy(
      'Farcantasy',
      'FRCNTSY',
      '1.0.0',
      baseUri
    )
    expect(await contract.idCap()).to.equal(1000)
    // Call setIdCap
    await contract.setIdCap(1)
    // Mint
    await contract.mint({ value: utils.parseEther('0.0065') })
    await expect(
      contract.mint({ value: utils.parseEther('0.0065') })
    ).to.be.revertedWith('Cap reached, check back later!')
    // Increase cap
    await contract.setIdCap(10)
    // Try minting for free
    await expect(contract.mint()).to.be.revertedWith(
      'Value must be greater than 0.0065'
    )
    await expect(
      contract.mint({ value: utils.parseEther('0.0064') })
    ).to.be.revertedWith('Value must be greater than 0.0065')
    // Mint again
    await contract.mint({ value: utils.parseEther('0.0065') })
    expect(await contract.tokenId()).to.equal(3)
    const signer = (await ethers.getSigners())[0]
    expect(await signer.provider?.getBalance(signer.address)).to.equal(
      '9999996391469514460636'
    )
  })
})
