import { Address, toNano } from '@ton/core';
import { Main } from '../wrappers/Main';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const main = provider.open(Main.createFromConfig({
        publicKey: 59404852957881491208161262178047543490527709553548189276561698965588786171491n,
        userContractCode: await compile("UserContract"),
        adminAddress: Address.parse("0QAZWpJf_wKa71UQJ49e2exbTbvHaz67f4Ip8NIyXquH-Kdc") as Address
    }, await compile('Main')));

    await main.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(main.address);

    // run methods on `main`
}
