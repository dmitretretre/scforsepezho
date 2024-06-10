import {NetworkProvider} from "@ton/blueprint";
import {Address} from "@ton/core";
import {Main} from "../wrappers/Main";

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    const admin = provider.sender().address;
    if (!admin) {
        ui.write('no provider address')
        return
    }

    const mainAddr = Address.parse(await ui.input('Enter main contract address'))
    const main = provider.open(Main.createFromAddress(mainAddr))

    const typeAmount = parseInt(await ui.input('Enter the type amount of borrowing [1 or 2]'), 10);
    if (typeAmount !== 1 || typeAmount !== 2) {
        await ui.write(`type amount can be 1 or 2, got ${typeAmount}`)
        return
    }

    const lendAmount = BigInt(await ui.input('Enter the lend amount'))
    const confirm = await ui.input(`Send to ${lendAmount.toString(10)} borrow request, [yN]`)
    if (confirm.toLowerCase() !== 'y') {
        return
    }

    await main.sendNewBorrow(provider.sender(), {
        value: '0.1',
        typeAmount,
        statusLender: 0,
        oldTime: 0,
        lendAmount,
    })
}