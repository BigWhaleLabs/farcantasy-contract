// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@big-whale-labs/versioned-contract/contracts/Versioned.sol";

contract Farcantasy is ERC721, Ownable, Versioned {
  string public baseURI;
  uint256 public idCap = 1000;

  constructor(
    string memory tokenName,
    string memory tokenSymbol,
    string memory version,
    string memory _newBaseURI
  ) ERC721(tokenName, tokenSymbol) Versioned(version) {
    baseURI = _newBaseURI;
  }

  function _baseURI() internal view override returns (string memory) {
    return baseURI;
  }

  function setBaseURI(string memory _newBaseURI) external onlyOwner {
    baseURI = _newBaseURI;
  }

  function mint(uint256 tokenId) external payable {
    // Check if value is > 0.0065 ETH
    require(msg.value >= 0.0065 ether, "Value must be greater than 0.0065");
    // Check if token id is valid
    require(tokenId > 0, "There is no genesis user here! Weird, right?");
    require(
      tokenId <= idCap,
      "This token is unmintable yet, check back later!"
    );
    // Check if token already minted
    require(_ownerOf(tokenId) == address(0), "Token already minted");
    // Mint
    _safeMint(msg.sender, tokenId);
    // Send value to owner
    payable(owner()).transfer(msg.value);
  }

  function setIdCap(uint256 _idCap) external onlyOwner {
    idCap = _idCap;
  }
}
