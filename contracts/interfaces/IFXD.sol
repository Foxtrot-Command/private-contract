// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IFXD is IERC20 {
    function secureTransfer(
        IERC20 token,
        address receiver,
        uint256 amount,
        string memory reason
    ) external returns (bool);
    function setCooldownExempt(address addr, bool state) external;
    function setFoundationExempt(address addr, bool state) external;
}