import {NetworkProvider} from "@ton/blueprint";
import {Address, fromNano, toNano} from "@ton/core";
import {Main} from "../wrappers/Main";
import autoMockOff = jest.autoMockOff;

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    const admin = provider.sender().address;
    if (!admin) {
        ui.write('no provider address')
        return
    }

    const mainAddr = Address.parse(await ui.input('Enter main contract address'))
    const main = provider.open(Main.createFromAddress(mainAddr))

    const tonAmount = toNano(await ui.input('Enter the amount of ton to top up'))
    const confirm = await ui.input(`Send ${fromNano(tonAmount)} to top up [yN]`)
    if (confirm.toLowerCase() !== 'y') {
        return
    }

    await main.sendTopUp(provider.sender(), {
        value: tonAmount,
    })

    await ui.write('transaction was sended')
}