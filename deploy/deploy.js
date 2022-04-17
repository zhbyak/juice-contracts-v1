module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
    console.log("Start initDAO deploy")
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    let chainId = await getChainId();

    let chain;
    let multisig;

    let baseDeployArgs = {
        from: deployer,
        log: true,
        // On mainnet, we will not redeploy contracts if they have already been deployed.
        skipIfAlreadyDeployed: chainId === '1',
    };

    console.log({ chainId, d: deployer });

    switch (chainId) {
        // mainnet
        case '1':
            chain = 'mainnet';
            multisig = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
            break;
        // rinkeby
        case '4':
            chain = 'rinkeby';
            multisig = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
            break;
        // local
        case '31337':
            chain = 'localhost';
            multisig = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
            break;
        case '80001':
            chain = 'mumbai';
            multisig = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
            break;
        default:
            throw new Error(`Chain id ${chainId} not supported`);
    }

    console.log({ chain });
    console.log({ owner: multisig });


    // Deploy a OperatorStore contract.
    const OperatorStore = await deploy('OperatorStore', {
        from: deployer,
        args: [],
    });

    // Deploy a Projects contract.
    // @param IOperatorStore _operatorStore A contract storing operator assignments.
    const Projects = await deploy('Projects', {
        from: deployer,
        args: [OperatorStore.address],
    });

    // Deploy a TerminalDirectory.
    // @param IProjects _projects A Projects contract which mints ERC-721's that represent project ownership and transfers.
    // @param IOperatorStore _operatorStore A contract storing operator assignments.
    const TerminalDirectory = await deploy('TerminalDirectory', {
        from: deployer,
        args: [Projects.address, OperatorStore.address],
    });

    // Deploy a Directory.
    // @param ITerminalDirectory _terminalDirectory A directory of a project's current Juicebox terminal to receive payments in.
    // @param uint256 _projectId The ID of the project to pay when this contract receives funds.
    // @param string _memo The memo to use when this contract forwards a payment to a terminal.
    // const Directory = await deploy('DirectPaymentAddress', {
    //     from: deployer,
    //     args: [TerminalDirectory.address, projectID, memo]
    // });

    // Deploy a FundingCycles.
    // @param ITerminalDirectory _terminalDirectory A directory of a project's current Juicebox terminal to receive payments in.
    const FundingCycles = await deploy('FundingCycles', {
        from: deployer,
        args: [TerminalDirectory.address],
    });

    // Deploy a ModStore contract.
    // @param IProjects _projects,
    // @param IOperatorStore _operatorStore,
    // @paramITerminalDirectory _terminalDirectory
    await deploy('ModStore', {
        from: deployer,
        args: [Projects.address, OperatorStore.address, TerminalDirectory.address]
    });

    // Deploy a Prices contract.
    const Prices = await deploy('Prices', {
        from: deployer,
        args: []
    });

    // Deploy a Active7DaysFundingCycleBallot contract.
    const Active7DaysFundingCycleBallot = await deploy('Active7DaysFundingCycleBallot', {
        from: deployer,
        args: [],
    });

    // Deploy a Governance contract.
    // @param uint256 _projectId, 
    // @param ITerminalDirectory _terminalDirectory
    const Governance = await deploy('Governance', {
        from: deployer,
        args: [1, TerminalDirectory.address]
    });

    // Deploy a TicketBooth contract.
    // @param IProjects _projects,
    // @param IOperatorStore _operatorStore,
    // @param ITerminalDirectory _terminalDirectory
    const TicketBooth = await deploy('TicketBooth', {
        from: deployer,
        args: [Projects.address, OperatorStore.address, TerminalDirectory.address]
    });

    // Deploy a ProxyPaymentAddressManager contract.
    // @param ITerminalDirectory _terminalDirectory,
    // @param ITicketBooth _ticketBooth
    const ProxyPaymentAddressManager = await deploy('ProxyPaymentAddressManager', {
        from: deployer,
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
      /*_governance=*/multisig
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
          /*_governance=*/multisig
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
          /*_governance=*/multisig
        ],
        log: true,
    });
};

module.exports.tags = ['TerminalV1_1'];