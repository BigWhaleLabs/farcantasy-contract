import { Farcantasy, Farcantasy__factory } from 'typechain'
import { ethers, run } from 'hardhat'
import { utils } from 'ethers'
import { version } from '../package.json'

const contractName = 'Farcantasy'
const contractSymbol = 'FRCNTSY'
const baseUri = 'https://metadata.farcantasy.xyz/metadata/'
const waitTime = 60 * 1000

type ConstructorArguments = [string, string, string, string]

async function printDeployer() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)
  console.log(
    'Account balance:',
    utils.formatEther(await deployer.getBalance())
  )
}

function waitForBlockchainUpdate() {
  console.log(
    `Wait for ${waitTime / 1000} seconds to make sure blockchain is updated`
  )
  return new Promise((resolve) => setTimeout(resolve, waitTime))
}

async function deployContract(
  factory: Farcantasy__factory,
  constructorArguments: ConstructorArguments
) {
  const contract = await factory.deploy(...constructorArguments)
  console.log(
    'Deploy tx gas price:',
    utils.formatEther(contract.deployTransaction.gasPrice || 0)
  )
  console.log(
    'Deploy tx gas limit:',
    utils.formatEther(contract.deployTransaction.gasLimit)
  )
  await contract.deployed()
  return contract
}

async function verifyContract(
  contract: Farcantasy,
  constructorArguments: ConstructorArguments
) {
  const address = contract.address
  console.log('Verifying contract on Etherscan')
  try {
    await run('verify:verify', {
      address,
      constructorArguments,
    })
    console.log(`${contractName} deployed and verified on blockchain explorer!`)
  } catch (err) {
    console.log(
      'Error verifying contract on Etherscan:',
      err instanceof Error ? err.message : err
    )
  }
}

async function main() {
  try {
    await printDeployer()
    const factory = await ethers.getContractFactory(contractName)
    const constructorArguments = [
      contractName,
      contractSymbol,
      version,
      baseUri,
    ] as ConstructorArguments
    const contract = await deployContract(factory, constructorArguments)
    console.log('Contract deployed to:', contract.address)
    await waitForBlockchainUpdate()
    await verifyContract(contract, constructorArguments)
    console.log('Contract address:', contract.address)
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  }
}

void main()
