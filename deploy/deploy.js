const { ethers } = require('hardhat');

/**
 * Deploys the entire Juice V1 contract suite.
 *
 * Example usage:
 *
 * npx hardhat deploy --network rinkeby
 */
module.exports = async ({ deployments, getChainId }) => {
    console.log('Start deploy.js');

    const { deploy } = deployments;
    const [deployer] = await ethers.getSigners();

    let multisigAddress;
    let chainlinkV2UsdEthPriceFeed;
    let chainId = await getChainId();
    let baseDeployArgs = {
        from: deployer.address,
        log: true,
        // On mainnet, we will not redeploy contracts if they have already been deployed.
        skipIfAlreadyDeployed: chainId === '1',
    };
    let protocolProjectStartsAtOrAfter;
    let chain = 'localhost'; // default
    // todo
    let projectID = '12'
    let memo = ''

    console.log({ deployer: deployer.address, chain: chainId });

    switch (chainId) {
        // mainnet
        case '1':
            chain = 'mainnet';
            multisigAddress = '0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e';
            chainlinkV2UsdEthPriceFeed = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419';
            protocolProjectStartsAtOrAfter = 1649531973;
            break;
        // rinkeby
        case '4':
            chain = 'rinkeby';
            multisigAddress = '0xAF28bcB48C40dBC86f52D459A6562F658fc94B1e';
            chainlinkV2UsdEthPriceFeed = '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e';
            protocolProjectStartsAtOrAfter = 0;
            break;
        // hardhat / localhost
        case '31337':
            chain = 'hardhat'
            multisigAddress = deployer.address;
            protocolProjectStartsAtOrAfter = 0;
            break;
        // bsc
        case '97':
            chain = 'bsctestnet'
            multisigAddress = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
            chainlinkV2UsdEthPriceFeed = '0x2514895c72f50D8bd4B4F9b1110F0D6bD2c97526';
            protocolProjectStartsAtOrAfter = 0;
            break;
        // mumbai/Polygon
        case '80001':
            chain = 'mumbai';
            multisigAddress = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
            chainlinkV2UsdEthPriceFeed = '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada';
            protocolProjectStartsAtOrAfter = 0;
            break;
    }

    console.log({ multisigAddress, protocolProjectStartsAtOrAfter });

    // Deploy a OperatorStore contract.
    const OperatorStore = await deploy('OperatorStore', {
        ...baseDeployArgs,
        args: [],
    });

    // Deploy a Projects contract.
    // @param IOperatorStore _operatorStore A contract storing operator assignments.
    const Projects = await deploy('Projects', {
        from: deployer.address,
        args: [OperatorStore.address],
    });

    // Deploy a TerminalDirectory.
    // @param IProjects _projects A Projects contract which mints ERC-721's that represent project ownership and transfers.
    // @param IOperatorStore _operatorStore A contract storing operator assignments.
    const TerminalDirectory = await deploy('TerminalDirectory', {
        ...baseDeployArgs,
        args: [Projects.address, OperatorStore.address],
    });

    // Deploy a Directory.
    // @param ITerminalDirectory _terminalDirectory A directory of a project's current Juicebox terminal to receive payments in.
    // @param uint256 _projectId The ID of the project to pay when this contract receives funds.
    // @param string _memo The memo to use when this contract forwards a payment to a terminal.
    const Directory = await deploy('DirectPaymentAddress', {
        ...baseDeployArgs,
        args: [TerminalDirectory.address, projectID, memo]
    });

    // Deploy a FundingCycles.
    // @param ITerminalDirectory _terminalDirectory A directory of a project's current Juicebox terminal to receive payments in.
    const FundingCycles = await deploy('FundingCycles', {
        ...baseDeployArgs,
        args: [TerminalDirectory.address],
    });

    // Deploy a ModStore contract.
    // @param IProjects _projects,
    // @param IOperatorStore _operatorStore,
    // @paramITerminalDirectory _terminalDirectory
    await deploy('ModStore', {
        ...baseDeployArgs,
        args: [Projects.address, OperatorStore.address, TerminalDirectory.address]
    });

    // Deploy a Prices contract.
    const Prices = await deploy('Prices', {
        ...baseDeployArgs,
        args: []
    });

    // Deploy a Active7DaysFundingCycleBallot contract.
    const Active7DaysFundingCycleBallot = await deploy('Active7DaysFundingCycleBallot', {
        ...baseDeployArgs,
        args: [],
    });

    // Deploy a Governance contract.
    // @param uint256 _projectId, 
    // @param ITerminalDirectory _terminalDirectory
    const Governance = await deploy('Governance', {
        ...baseDeployArgs,
        args: [projectID, TerminalDirectory.address]
    });

    // Deploy a TicketBooth contract.
    // @param IProjects _projects,
    // @param IOperatorStore _operatorStore,
    // @param ITerminalDirectory _terminalDirectory
    const TicketBooth = await deploy('TicketBooth', {
        ...baseDeployArgs,
        args: [Projects.address, OperatorStore.address, TerminalDirectory.address]
    });

    // Deploy a ProxyPaymentAddressManager contract.
    // @param ITerminalDirectory _terminalDirectory,
    // @param ITicketBooth _ticketBooth
    const ProxyPaymentAddressManager = await deploy('ProxyPaymentAddressManager', {
        ...baseDeployArgs,
        args: [TerminalDirectory.address, TicketBooth.address]
    });

    await deploy('TerminalV1', {
        from: deployer,
        args: [
            require(`../deployments/${chain}/Projects.json`).address,
            require(`../deployments/${chain}/FundingCycles.json`).address,
            require(`../deployments/${chain}/TicketBooth.json`).address,
            require(`../deployments/${chain}/OperatorStore.json`).address,
            require(`../deployments/${chain}/ModStore.json`).address,
            require(`../deployments/${chain}/Prices.json`).address,
            require(`../deployments/${chain}/TerminalDirectory.json`).address,
      /*_governance=*/multisigAddress
        ],
        log: true,
    });

    await deploy('TerminalV1_1', {
        from: deployer,
        args: [
            require(`../deployments/${chain}/Projects.json`).address,
            require(`../deployments/${chain}/FundingCycles.json`).address,
            require(`../deployments/${chain}/TicketBooth.json`).address,
            require(`../deployments/${chain}/OperatorStore.json`).address,
            require(`../deployments/${chain}/ModStore.json`).address,
            require(`../deployments/${chain}/Prices.json`).address,
            require(`../deployments/${chain}/TerminalDirectory.json`).address,
      /*_governance=*/multisigAddress
        ],
        log: true,
    });

    await deploy('TerminalV1Rescue', {
        from: deployer,
        args: [
            require(`../deployments/${chain}/Projects.json`).address,
            require(`../deployments/${chain}/FundingCycles.json`).address,
            require(`../deployments/${chain}/TicketBooth.json`).address,
            require(`../deployments/${chain}/OperatorStore.json`).address,
            require(`../deployments/${chain}/TerminalDirectory.json`).address,
      /*_governance=*/multisigAddress
        ],
        log: true,
    });

    console.log('Done');
};
