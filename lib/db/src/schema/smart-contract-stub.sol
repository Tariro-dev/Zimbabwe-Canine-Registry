// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZimbabweCanineRegistry
 * @dev Immutable on-chain registry for canine identities and pedigree verification.
 */
contract ZimbabweCanineRegistry {
    struct CanineRecord {
        string microchipId;
        bytes32 dataHash; // keccak256 hash of the full registry record
        address owner;
        uint256 registeredAt;
        bool isStolen;
    }

    mapping(string => CanineRecord) public registry;
    mapping(address => bool) public authorizedVets;
    address public regulator;

    event Registered(string microchipId, bytes32 dataHash, address owner);
    event StolenFlagUpdated(string microchipId, bool isStolen);
    event OwnershipTransferred(string microchipId, address from, address to);

    modifier onlyRegulator() {
        require(msg.sender == regulator, "Not regulator");
        _;
    }

    constructor() {
        regulator = msg.sender;
    }

    function registerCanine(
        string memory _microchipId,
        bytes32 _dataHash,
        address _owner
    ) public onlyRegulator {
        require(registry[_microchipId].registeredAt == 0, "Already registered");

        registry[_microchipId] = CanineRecord({
            microchipId: _microchipId,
            dataHash: _dataHash,
            owner: _owner,
            registeredAt: block.timestamp,
            isStolen: false
        });

        emit Registered(_microchipId, _dataHash, _owner);
    }

    function setStolenStatus(string memory _microchipId, bool _status) public {
        require(msg.sender == registry[_microchipId].owner || msg.sender == regulator, "Unauthorized");
        registry[_microchipId].isStolen = _status;
        emit StolenFlagUpdated(_microchipId, _status);
    }

    function authorizeVet(address _vet, bool _status) public onlyRegulator {
        authorizedVets[_vet] = _status;
    }
}
