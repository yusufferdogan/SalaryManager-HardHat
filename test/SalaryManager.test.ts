import { expect, assert } from 'chai';
import { Contract, ContractFactory, Signer } from 'ethers';
import { ethers } from 'hardhat';

const contractName: string = 'SalaryManager';
const erc20ContractName: string = 'FooToken';

function toWei(ether: any) {
  return 10 ** 8 * ether;
}

describe(contractName, () => {
  let contract: Contract;
  let erc20Contract: Contract;
  let signer: Signer, signer1: Signer, signer2: Signer;
  let address: string, address1: string, address2: string;

  before(async () => {
    [signer, signer1, signer2] = await ethers.getSigners();
    [address, address1, address2] = [
      await signer.getAddress(),
      await signer1.getAddress(),
      await signer2.getAddress(),
    ];
  });

  beforeEach(async () => {
    const Erc20Contract: ContractFactory = await ethers.getContractFactory(
      erc20ContractName
    );
    erc20Contract = await Erc20Contract.deploy('100000000000000');
    await erc20Contract.deployed();

    const Contract: ContractFactory = await ethers.getContractFactory(
      contractName
    );

    contract = await Contract.deploy(erc20Contract.address);
    await contract.deployed();
  });

  it('the ERC20 address should be correct', async () => {
    const tokenAddress: string = await contract.erc20();

    assert.equal(
      tokenAddress,
      erc20Contract.address,
      'The token address must be valid.'
    );
  });

  it('reverts on different lengths of payees and amounts', async () => {
    await expect(
      contract.pay([address1], [1000000, 1000000], {
        from: address,
      })
    ).to.be.revertedWith('SalaryManager::pay: INVALID_INPUT_LENGTH');
  });

  it('reverts on insufficient allowance', async () => {
    await expect(
      contract.pay([address1, address2], [1000000, 1000000], {
        from: address,
      })
    ).to.be.revertedWith('ERC20: insufficient allowance');
  });

  it('reverts on insufficient allowance when has allowance but not enough for all payments', async () => {
    erc20Contract.approve(contract.address, toWei(100));
    await expect(
      contract.pay([address1, address2], [toWei(100), toWei(500)], {
        from: address,
      })
    ).to.be.revertedWith('ERC20: insufficient allowance');
  });

  it('emits PaymentERC20 event on successful payment', async () => {
    erc20Contract.approve(contract.address, toWei(100));
    await expect(
      contract.pay([address1], [toWei(100)], {
        from: address,
      })
    )
      .to.emit(contract, 'PaymentERC20')
      .withArgs(address1, toWei(100));
  });

  it('emits PaymentERC20 event on multiple payments', async () => {
    erc20Contract.approve(contract.address, toWei(300));
    await expect(
      contract.pay([address1, address2], [toWei(100), toWei(200)], {
        from: address,
      })
    )
      .to.emit(contract, 'PaymentERC20')
      .withArgs(address2, toWei(200));
  });
});
