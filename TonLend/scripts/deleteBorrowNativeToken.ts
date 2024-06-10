import {NetworkProvider} from "@ton/blueprint";
import {Address} from "@ton/core";
import Main from "../wrappers/Main";
import NatLend from "../wrappers/Main";

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    const admin = provider.sender().address;
    if (!admin) {
        ui.write('no provider address')
        return
    }

    const mainAddr = Address.parse(await ui.input('Enter main contract address'))
    const main = provider.open(new Main(mainAddr))

    const typeAmount = parseInt(await ui.input('Enter the type amount of borrowing [1 or 2]'), 10);
    if (typeAmount !== 1 || typeAmount !== 2) {
        await ui.write(`type amount can be 1 or 2, got ${typeAmount}`)
        return
    }

    const lendAmount = BigInt(await ui.input('Enter lend ton amount'))
    const borrowAmount = BigInt(await ui.input('Enter borrow ton amount'))


    await NatLend.sendNewBorrow(provider.sender(), {
        typeAmount,
        oldTime: 0,
        statusLender: 0,
        lenderAddress: provider.sender().address,
        lendAmount,
        typeBorrowAmount: 0,
        borrowAddress: provider.sender().address,
        time: BigInt(Date.now()),
        borrowAmount,
    })

    await ui.write('transaction was sended')
}
