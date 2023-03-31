// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@masa-finance/masa-contracts-identity/contracts/tokens/MasaSBTAuthority.sol";

/// @title Test ASBT
/// @author Masa Finance
/// @notice Test Soulbound token
/// @dev Inherits from the ASBT contract.
contract TestASBT is MasaSBTAuthority {
    /// @notice Creates a new Test ASBT
    /// @dev Creates a new Test ASBT, inheriting from the Masa ASBT contract.
    /// @param admin Administrator of the smart contract
    /// @param name Name of the token
    /// @param symbol Symbol of the token
    /// @param baseTokenURI Base URI of the token
    constructor(
        address admin,
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) MasaSBTAuthority(admin, name, symbol, baseTokenURI) {}

    /// @notice Mints a new SBT
    /// @dev The caller must have the MINTER role
    /// @param to Address of the owner of the new identity
    /// @return The NFT ID of the newly minted SBT
    function mint(address to) public returns (uint256) {
        uint256 tokenId = _mintWithCounter(to);

        emit Minted(tokenId, to);

        return tokenId;
    }

    event Minted(uint256 tokenId, address to);
}
