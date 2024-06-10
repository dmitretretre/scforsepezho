import {NetworkProvider} from "@ton/blueprint";
import {Address} from "@ton/core";
import Main from '../wrappers/Main';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    const admin = provider.sender().address;
    if (!admin) {
        ui.write('no provider address')
        return
    }

    const mainAddr = Address.parse(await ui.input('Enter main contract address'))
    const main = provider.open(Main.createFromAddress(mainAddr))

    const value = await ui.input('Enter the amount of ton to lend')
    const confirm = await ui.input(`Confirm sending ${value} ton to lend, [yN]`)
    if (confirm.toLowerCase() !== 'y') {
        return
    }

    await main.sendNewLandNativeToken(provider.sender(), {
        value,
    })

    await ui.write('Transaction was sended')
}
