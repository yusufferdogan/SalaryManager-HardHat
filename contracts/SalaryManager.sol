// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
    @author yusufferdogan
    @title Send your ERC20 assets to multiple addresses  
*/
contract SalaryManager {
    using SafeERC20 for IERC20;
    event PaymentERC20(address to, uint256 amount);

    /* solhint-disable-next-line state-visibility */
    IERC20 immutable erc20;

    constructor(address tokenAddress) {
        erc20 = IERC20(tokenAddress);
    }

    /**
        @notice This function works like:
        send amounts[0] token to payees[0]
        when you call this function be sure that
        payee takes number of amounts token which has same index
        length of @param payees and @param amounts must be same 
    */
    function pay(address[] calldata payees, uint256[] calldata amounts) external {
        /* solhint-disable-next-line reason-string */
        require(payees.length == amounts.length, "SalaryManager::pay: INVALID_INPUT_LENGTH");
        for (uint256 i; i < payees.length; i++) {
            erc20.safeTransferFrom(msg.sender, payees[i], amounts[i]);
            emit PaymentERC20(payees[i], amounts[i]);
        }
    }

    /** 
        @notice uncomment this function to run tests
    */
    function getErc20() public view returns (IERC20) {
        return erc20;
    }
}
