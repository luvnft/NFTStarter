use openzeppelin_token::erc721::interface::{IERC721MetadataDispatcher, IERC721MetadataDispatcherTrait, IERC721Dispatcher, IERC721DispatcherTrait};
use starknet::ContractAddress;
use snforge_std::{declare, ContractClassTrait, DeclareResultTrait, start_cheat_caller_address_global, stop_cheat_caller_address_global, test_address};
use nftstarter::{INFTStarterDispatcherTrait, INFTStarterDispatcher};
use snforge_std::signature::{KeyPair, KeyPairTrait};
use snforge_std::signature::stark_curve::{StarkCurveKeyPairImpl, StarkCurveSignerImpl, StarkCurveVerifierImpl};

// generate random for test
fn get_key_pair() -> KeyPair<felt252, felt252> {
    KeyPair {
        secret_key: 1183708387333094467338972781907037627743714726817597220764976276679731789225,
        public_key: 907904319746593147422496688023288902048747180391836133816328634772543169266
    }
}

fn deploy_contract() -> ContractAddress {
    let contract = declare("NFTStarter").unwrap().contract_class();
    let name: felt252 = 'NFTStarter';
    let symbol: felt252 = 'NFTS';
    let contract_address = contract.precalculate_address(@array![name, 10, symbol, 4, get_key_pair().public_key]);
    start_cheat_caller_address_global(test_address());
    contract.deploy(@array![name, 10, symbol, 4, get_key_pair().public_key]).unwrap();
    stop_cheat_caller_address_global();
    contract_address
}


#[test]
fn test_metadata() {
    let contract_address = deploy_contract();

    let dispatcher = IERC721MetadataDispatcher { contract_address };
    let name = dispatcher.name();
    let symbol = dispatcher.symbol();

    let dispatcher = INFTStarterDispatcher { contract_address };
    let public_key_signer = dispatcher.get_public_key_signer();

    assert_eq!(name, "NFTStarter");
    assert_eq!(symbol, "NFTS");
    assert_eq!(public_key_signer, get_key_pair().public_key);
}

#[test]
fn test_lazy_mint() {
    let contract_address = deploy_contract();
    let dispatcher = INFTStarterDispatcher { contract_address };

    let key_pair = get_key_pair();

    let msg_hash: felt252 = 0x12345678;
    let (r, s): (felt252, felt252) = key_pair.sign(msg_hash).unwrap();

    let uri  = 'https://api.example.com/v1/';
    let signature = array![r, s].span();
    let token_id : u256 = 1;

    dispatcher.lazy_mint(test_address(), uri, token_id, msg_hash, signature);

    let is_valid = key_pair.verify(msg_hash, (r, s));
    assert_eq!(is_valid, true);

    let token_uri = dispatcher.get_token_uri(token_id);
    assert_eq!(token_uri, 'https://api.example.com/v1/');

    let dispatcher = IERC721Dispatcher { contract_address };
    let owner = dispatcher.owner_of(token_id);

    assert_eq!(owner, test_address());
}

#[test]
#[should_panic(expected: ('replay signature',))]
fn test_lazy_mint_revert_with_replay_signature() {
    let contract_address = deploy_contract();
    let dispatcher = INFTStarterDispatcher { contract_address };

    let key_pair = get_key_pair();

    let msg_hash: felt252 = 0x12345678;
    let (r, s): (felt252, felt252) = key_pair.sign(msg_hash).unwrap();

    let uri  = 'https://api.example.com/v1/';
    let signature = array![r, s].span();
    let token_id : u256 = 1;

    assert_eq!(dispatcher.signature_is_used(signature), false);
    dispatcher.lazy_mint(test_address(), uri, token_id, msg_hash, signature);

    assert_eq!(dispatcher.signature_is_used(signature), true);
    dispatcher.lazy_mint(test_address(), 'https://api.example.com/v2/', token_id + 1, msg_hash, signature);
}

#[test]
#[should_panic(expected: ('invalid signature',))]
fn test_lazy_mint_revert_with_invalid_signature() {
    let contract_address = deploy_contract();
    let dispatcher = INFTStarterDispatcher { contract_address };

    // random key pair # signer key pair
    let key_pair = KeyPairTrait::<felt252, felt252>::generate();

    let msg_hash: felt252 = 0x12345678;
    let (r, s): (felt252, felt252) = key_pair.sign(msg_hash).unwrap();

    let uri  = 'https://api.example.com/v1/';
    let signature = array![r, s].span();
    let token_id : u256 = 2;

    dispatcher.lazy_mint(test_address(), uri, token_id, msg_hash, signature);
}

#[test]
fn test_contract_can_receive_nft() {
    let contract_address = deploy_contract();
    let dispatcher = INFTStarterDispatcher { contract_address };

    let key_pair = get_key_pair();

    let msg_hash: felt252 = 0x12345678;
    let (r, s): (felt252, felt252) = key_pair.sign(msg_hash).unwrap();

    let uri  = 'https://api.example.com/v1/';
    let signature = array![r, s].span();
    let token_id : u256 = 1;

    assert_eq!(dispatcher.signature_is_used(signature), false);
    dispatcher.lazy_mint(test_address(), uri, token_id, msg_hash, signature);

    start_cheat_caller_address_global(test_address());
    let dispatcher = IERC721Dispatcher { contract_address };
    dispatcher.transfer_from(test_address(), contract_address, token_id);
    stop_cheat_caller_address_global();

    let dispatcher = IERC721Dispatcher { contract_address };
    let owner = dispatcher.owner_of(token_id);

    assert_eq!(owner, contract_address);
}

