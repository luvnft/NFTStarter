use starknet::ContractAddress;

#[derive(Drop, Serde)]
struct MyData {
    a: felt252, // recipientAddress
    b: felt252, // token_id
}

#[starknet::interface]
pub trait INFTStarter<TContractState> {
    fn get_token_uri(self: @TContractState, token_id: u256) -> felt252;
    fn get_public_key_signer(self: @TContractState) -> felt252;
    fn lazy_mint(ref self: TContractState, to: ContractAddress, uri: felt252, token_id: u256, msg_hash: felt252, signature: Span<felt252>);
    fn signature_is_used(self: @TContractState, signature: Span<felt252>) -> bool;
}

#[starknet::interface]
pub trait IContractL1<T> {
    fn send_message_struct(ref self: T, to_address: starknet::EthAddress, data: MyData);
}

#[starknet::contract]
pub mod NFTStarter {
    use openzeppelin_token::erc721::interface::ERC721ABI;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::account::utils::signature::is_valid_stark_signature;
    use openzeppelin_token::erc721::{ERC721Component, ERC721HooksEmptyImpl};
    use openzeppelin_token::erc721::interface::IERC721_RECEIVER_ID;
    use starknet::ContractAddress;
    use starknet::storage::{Map, StorageMapReadAccess, StorageMapWriteAccess, StoragePointerWriteAccess, StoragePointerReadAccess, StoragePathEntry};
    use core::num::traits::Zero;
    use super::MyData;
    use starknet::{EthAddress, SyscallResultTrait};
    use starknet::syscalls::send_message_to_l1_syscall;
    use starknet::{get_caller_address, get_contract_address};

    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        pub nft_uri: Map<u256, felt252>,
        pub public_key_signer: felt252,
        pub sig_is_used: Map<felt252, Map<felt252, bool>>
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        ValueReceivedFromL1: ValueReceived,
        StructReceivedFromL1: StructReceived
    }

    #[derive(Drop, starknet::Event)]
    struct ValueReceived {
        #[key]
        l1_address: felt252,
        value: felt252,
    }

    #[derive(Drop, starknet::Event)]
    struct StructReceived {
        #[key]
        l1_address: felt252,
        data_recipient: felt252,
        data_token_id: felt252
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        name: felt252,
        name_length: usize,
        symbol: felt252,
        symbol_length: usize,
        public_key: felt252,
    ) {
        let mut name_collection = "";
        name_collection.append_word(name, name_length);

        let mut symbol_collection = "";
        symbol_collection.append_word(symbol, symbol_length);

        self.erc721.initializer(name_collection, symbol_collection, "");
        self.public_key_signer.write(public_key);
    }

    pub mod Errors {
        pub const INVALID_SIGNATURE: felt252 = 'invalid signature';
        pub const REPLAY_SIGNATURE: felt252 = 'replay signature';
        pub const NOT_OWN_NFT: felt252 = 'is not the owner of the token';
    }

    #[abi(embed_v0)]
    impl INFTStarterImpl of super::INFTStarter<ContractState> {
        fn get_token_uri(self: @ContractState, token_id: u256) -> felt252 {
            self.nft_uri.read(token_id)
        }

        fn get_public_key_signer(self: @ContractState) -> felt252 {
            self.public_key_signer.read()
        }

        fn lazy_mint(ref self: ContractState, to: ContractAddress, uri: felt252, token_id: u256, msg_hash: felt252, signature: Span<felt252>) {
            let public_key = self.get_public_key_signer();

            assert(
                !self.sig_is_used.entry(*signature.at(0)).entry(*signature.at(1)).read(),
                Errors::REPLAY_SIGNATURE
            );

            assert(
                is_valid_stark_signature(msg_hash, public_key, signature),
                Errors::INVALID_SIGNATURE
            );

            self.sig_is_used.entry(*signature.at(0)).entry(*signature.at(1)).write(true);
            self.erc721.mint(to, token_id);
            self.nft_uri.write(token_id, uri);
        }

        fn signature_is_used(self: @ContractState, signature: Span<felt252>) -> bool {
            self.sig_is_used.entry(*signature.at(0)).entry(*signature.at(1)).read()
        }
    }

    #[l1_handler]
    fn msg_handler_struct(ref self: ContractState, from_address: felt252, data: MyData) {
        assert(!data.a.is_zero(), 'recipient is invalid');

        let to = data.a.try_into().unwrap();

        self.erc721.mint(to, data.b.into());

        self.emit(StructReceived { l1_address: from_address, data_recipient: data.a, data_token_id: data.b });
    }

    #[abi(embed_v0)]
    impl ContractL1Impl of super::IContractL1<ContractState> {
        fn send_message_struct(ref self: ContractState, to_address: EthAddress, data: MyData) {
            let msg_sender = get_caller_address();
            let token_id : u256 = data.b.into();

            assert(self.owner_of(token_id) == msg_sender, Errors::NOT_OWN_NFT);
            self.transfer_from(msg_sender, get_contract_address(), token_id);

            let mut buf: Array<felt252> = array![];
            data.serialize(ref buf);
            send_message_to_l1_syscall(to_address.into(), buf.span()).unwrap_syscall();
        }
    }

    #[external(v0)]
    fn onERC721Received(
        self: @ContractState,
        operator: ContractAddress,
        from: ContractAddress,
        tokenId: u256,
        data: Span<felt252>,
    ) -> felt252 {
        IERC721_RECEIVER_ID
    }

    #[external(v0)]
    fn on_erc721_received(
        self: @ContractState,
        operator: ContractAddress,
        from: ContractAddress,
        token_id: u256,
        data: Span<felt252>,
    ) -> felt252 {
        IERC721_RECEIVER_ID
    }
}


