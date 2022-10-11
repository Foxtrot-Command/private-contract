// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "contracts/interfaces/IFXD.sol";

contract MockFXD is IFXD, ERC20 {

    address internal _owner;

    mapping (address => bool) internal _authorizations;
    mapping (address => bool) internal _isCooldownExempt;
    mapping (address => bool) internal _isFoundationExempt;

    event WithdrawTokensFromMainContract(address from, address to, uint256 amount, string reason);

    constructor() ERC20("Mock FXD", "FXD") {
        _owner = msg.sender;
        _authorizations[_owner] = true;
        _mint(address(this), 215e6 * 10**18);
    }

    modifier authorized() {
        require(_authorizations[msg.sender] == true, "OAuth: you're not authorized"); _;
    }

    function secureTransfer(
        IERC20 token,
        address receiver,
        uint256 amount,
        string memory reason
    ) external override returns (bool) {
        require(token.balanceOf(address(this))>= amount, "FXD: Unavailable amount");
        token.transfer(receiver, amount);
        emit WithdrawTokensFromMainContract(msg.sender, receiver, amount, reason);
        return true;
    }

    function setCooldownExempt(address addr, bool state) public override authorized() {
        _isCooldownExempt[addr] = state;
    }

    function setFoundationExempt(address addr, bool state) public override authorized() {
        _isFoundationExempt[addr] = state;
    }
}