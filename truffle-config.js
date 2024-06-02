require('babel-register');
require('babel-polyfill');

const HDWalletProvider = require('@truffle/hdwallet-provider')

module.exports = {
  networks: {
    sepolia: {
      provider: () => new HDWalletProvider({
      mnemonic: {
      phrase: "begin cash usual slogan scan air dirt message judge flower champion hamster"
      },
      providerOrUrl: "https://sepolia.infura.io/v3/76def37e505441f3a9b0b7b6c30bde9d"
      }),
      network_id: 11155111, // Sepolia's network ID
      gas: 6000000, // Adjust the gas limit as per your requirements
      gasPrice: 5000000000, // Set the gas price to an appropriate value
      confirmations: 2, // Set the number of confirmations needed for a transaction
      timeoutBlocks: 200, // Set the timeout for transactions
      skipDryRun: true, // Skip the dry run option
      from: "0x3497009fA3027d269524a6597245E1e15CBbA3Ff"
     }
  },
  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
