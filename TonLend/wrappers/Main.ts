import {
    Contract,
    ContractProvider,
    Sender,
    Address,
    Cell,
    contractAddress,
    beginCell,
    Dictionary,
    SendMode,
    TupleBuilder,
} from '@ton/core';

import { op, query } from './common';

type lendInfo = {
    typeLendAmount: number;
    status: number;
    lender: Address;
    time: number;
    lendValue: bigint;
};

type borrowInfo = {
    typeBorrowAmount: number;
    lender: Address;
    time: number;
    borrowValue: bigint;
    price: number;
};

export interface createForDeploy {
    OrigBody: Cell;
    ondaCode: Cell;
    jetton_wallet_x_address: Address;
    minter_otoken_address: Address;
    jetton_wallet_otoken_address: Address;
    oracle: Address;
    owner_address: Address;
    configuration: Cell;
}

export function createForDeployToCell(config: createForDeploy): Cell {
    const walletCell = beginCell()
        .storeAddress(config.jetton_wallet_x_address)
        .storeAddress(config.minter_otoken_address)
        .storeAddress(config.jetton_wallet_otoken_address);
    return beginCell()
        .storeRef(config.OrigBody)
        .storeRef(config.ondaCode)
        .storeAddress(config.owner_address)
        .storeAddress(config.oracle)
        .storeRef(walletCell)
        .storeDict(null)
        .storeDict(null)
        .storeRef(config.configuration)
        .endCell();
}

export default class NatLend implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new NatLend(address);
    }

    static createFromConfig(config: createForDeploy, code: Cell, workchain = 0) {
        const data = createForDeployToCell(config);
        const init = { code, data };
        return new NatLend(contractAddress(workchain, init), init);
    }

    async sendMessage(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint | string;
            bounce?: boolean;
            sendMode?: SendMode;
            body?: Cell | string;
        },
    ) {
        await provider.internal(via, opts);
    }

    async sendDeploy(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: '0.01',
            bounce: false,
        });
    }

    async sendAction(provider: ContractProvider, via: Sender, body: Cell) {
        var res = await provider.internal(via, {
            value: '1',
            body: body,
        });
        return res;
    }

    async getVariableBorrowAPY(provider: ContractProvider) {
        const { stack } = await provider.get('getVariableBorrowAPY', []);
        return stack.readBigNumber();
    }

    async getAlgebra(provider: ContractProvider) {
        const { stack } = await provider.get('getAlgebra', []);
        return stack;
    }

    async getLendInfo(provider: ContractProvider, user: Address) {
        try {
            let args = new TupleBuilder();
            args.writeAddress(user);
            const { stack } = await provider.get('get_lend_info', args.build());
            return stack.readCell();
        } catch (e) {
            return beginCell()
                .storeUint(0, 2)
                .storeUint(0, 2)
                .storeAddress(user)
                .storeUint(0, 64)
                .storeCoins(0)
                .endCell();
        }
    }

    async getBorrowInfo(provider: ContractProvider, user: Address) {
        try {
            let args = new TupleBuilder();
            args.writeAddress(user);
            const { stack } = await provider.get('get_borrow_info', args.build());
            return stack.readCell();
        } catch (e) {
            return beginCell()
                .storeUint(0, 2)
                .storeAddress(user)
                .storeUint(0, 64)
                .storeCoins(0)
                .storeUint(0, 64)
                .endCell();
        }
    }

    async getTest(provider: ContractProvider, user: Address) {
        let args = new TupleBuilder();
        args.writeNumber(10 * 10 ** 9);
        args.writeAddress(user);
        args.writeNumber(1.45 * 10 ** 9);
        const { stack } = await provider.get('test', args.build());
        return stack;
    }

    async getTest1(provider: ContractProvider) {
        let args = new TupleBuilder();
        args.writeNumber(10000000000);
        args.writeNumber(2450000000);
        args.writeNumber(32471);
        const { stack } = await provider.get('test1', args.build());
        return stack.readBigNumber();
    }

    async parseLendSlice(data: Cell) {
        let dataSlice = data.beginParse();
        const obj: lendInfo = {
            typeLendAmount: dataSlice.loadUint(2),
            status: dataSlice.loadUint(2),
            lender: dataSlice.loadAddress(),
            time: dataSlice.loadUint(64),
            lendValue: dataSlice.loadCoins(),
        };
        return obj;
    }

    async parseBorrowSlice(data: Cell) {
        let dataSlice = data.beginParse();
        const obj: borrowInfo = {
            typeBorrowAmount: dataSlice.loadUint(2),
            lender: dataSlice.loadAddress(),
            time: dataSlice.loadUint(64),
            borrowValue: dataSlice.loadCoins(),
            price: dataSlice.loadUint(64),
        };
        return obj;
    }

    async sendNewBorrow(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint | string;
            bounce?: boolean;
            sendMode?: SendMode;
            queryId?: bigint;
            owner?: Address;
            coins?: bigint;
        },
    ) {
        await this.sendMessage(provider, via, {
            value: opts.value,
            bounce: opts.bounce,
            sendMode: opts.sendMode,
            body: beginCell()
                .storeUint(op.NewBorrow, 32)
                .storeUint(opts.queryId ?? 0, 64)
                .storeAddress(opts.owner)
                .storeCoins(opts.coins ?? 0)
                .endCell(),
        });
    }

    async sendNewLandNativeToken(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint | string;
            bounce?: boolean;
            sendMode?: SendMode;
            queryId?: bigint;
            owner?: Address;
            coins?: bigint;
        },
    ) {
        await this.sendMessage(provider, via, {
            value: opts.value,
            bounce: opts.bounce,
            sendMode: opts.sendMode,
            body: beginCell()
                .storeUint(op.NewLendNativeToken, 32)
                .storeUint(opts.queryId ?? 0, 64)
                .storeAddress(opts.owner)
                .storeCoins(opts.coins ?? 0)
                .endCell(),
        });
    }
}
