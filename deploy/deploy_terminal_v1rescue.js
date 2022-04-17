/**
 * Deploys Terminal V1rescue contract.
 */

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  console.log("v1 rescue deploy")

  // const { deploy } = deployments;
  // const { deployer } = await getNamedAccounts();

  // let chainId = await getChainId();

  // let chain;
  // let multisig;

  // console.log({ chainId, d: deployer });

  // switch (chainId) {
  //   // mainnet
  //   case '1':
  //     chain = 'mainnet';
  //     multisig = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
  //     break;
  //   // rinkeby
  //   case '4':
  //     chain = 'rinkeby';
  //     multisig = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
  //     break;
  //   // local
  //   case '31337':
  //     chain = 'localhost';
  //     multisig = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
  //     break;
  //   case '80001':
  //     chain = 'mumbai';
  //     multisig = '0x95C54D662c31672b2E9C572959AcF93cc883a0A5';
  //     break;
  //   default:
  //     throw new Error(`Chain id ${chainId} not supported`);
  // }

  // console.log({ chain });
  // console.log({ owner: multisig });

  // await deploy('TerminalV1Rescue', {
  //   from: deployer,
  //   args: [
  //     require(`../deployments/${chain}/Projects.json`).address,
  //     require(`../deployments/${chain}/FundingCycles.json`).address,
  //     require(`../deployments/${chain}/TicketBooth.json`).address,
  //     require(`../deployments/${chain}/OperatorStore.json`).address,
  //     require(`../deployments/${chain}/TerminalDirectory.json`).address,
  //     /*_governance=*/multisig
  //   ],
  //   log: true,
  // });
};

module.exports.tags = ['TerminalV1Rescue'];