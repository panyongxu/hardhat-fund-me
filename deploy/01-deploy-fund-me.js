const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  // deploy 部署  get 获取合约
  const { deploy, get, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const {
    networkConfig,
    DECIMALS,
    INITIAL_PRICE,
  } = require("../helper-hardhat-config");
  const  {verify}  = require("../utils/verify");

  let ethUsdPriceFeedAddress;
  // 当是hardhat或者本地开发时 走mock合约
  if (chainId == 31337) {
    const ethUsdAggregator = await get("MockV3Aggregator");
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    // 获取测试网地址
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  });
  log(`FundMe deployed at ${fundMe.address}`)
  if (chainId !== 31337 && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, [ethUsdPriceFeedAddress]);
  }

  log("----------------------------------------------------------------");
};
module.exports.tags = ["all","FundMe"];
