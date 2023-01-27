import { ethers, run } from 'hardhat'
import { utils } from 'ethers'
import { version } from '../package.json'

async function main() {
  const [deployer] = await ethers.getSigners()

  // Deploy the contract
  console.log('Deploying contracts with the account:', deployer.address)
  console.log(
    'Account balance:',
    utils.formatEther(await deployer.getBalance())
  )

  const contractName = 'Farcantasy'
  const contractSymbol = 'FRCNTSY'
  const baseUri = 'https://farcantasy.com/metadata/'
  console.log(`Deploying ${contractName}...`)
  const Contract = await ethers.getContractFactory(contractName)
  const contract = await Contract.deploy(
    contractName,
    contractSymbol,
    version,
    baseUri
  )

  console.log(
    'Deploy tx gas price:',
    utils.formatEther(contract.deployTransaction.gasPrice || 0)
  )
  console.log(
    'Deploy tx gas limit:',
    utils.formatEther(contract.deployTransaction.gasLimit)
  )
  await contract.deployed()
  const address = contract.address

  console.log('Contract deployed to:', address)
  console.log('Wait for 1 minute to make sure blockchain is updated')
  await new Promise((resolve) => setTimeout(resolve, 60 * 1000))

  // Try to verify the contract on Etherscan
  console.log('Verifying contract on Etherscan')
  try {
    await run('verify:verify', {
      address,
      constructorArguments: [contractName, contractSymbol, version, baseUri],
    })
  } catch (err) {
    console.log(
      'Error verifiying contract on Etherscan:',
      err instanceof Error ? err.message : err
    )
  }

  // Print out the information
  console.log(`${contractName} deployed and verified on blockchain explorer!`)
  console.log('Contract address:', address)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
