import { toNano, beginCell, Dictionary, Address } from '@ton/core';
import { compile, NetworkProvider } from '@ton/blueprint';
import NatLend from '../wrappers/Main';

export async function run(provider: NetworkProvider) {
    const ui = provider.ui();

    const sender = provider.sender();
    const admin: Address = sender.address!;

    let ltv = 75,
        liquidationThreshold = 80,
        liquidationBonus = 5,
        borrowingEnabled = 1,
        isActive = 1,
        liquidityRate = 1900000000,
        variableBorrowRate = 3200000000;

    let configuration = beginCell()
       .storeUint(ltv, 64)
        .storeUint(liquidationThreshold, 64)
        .storeUint(liquidationBonus, 64)
        .storeUint(borrowingEnabled, 64)
        .storeUint(isActive, 64)
        .storeUint(liquidityRate, 64)
        .storeUint(variableBorrowRate, 64)
        .endCell();

    const mainCode = await compile('Main');

    const origBody = beginCell().storeUint(0x186a1, 32).storeUint(0, 64).endCell();

    const main = provider.open(
        NatLend.createFromConfig(
            {
                ondaCode: mainCode,
                OrigBody: origBody,
                owner_address: admin,
                oracle: Address.parse('kQCIxdC5CyuiWH7MAWFc94Kafxy2BDruOsM46LNHsqdPXEyj'),
                jetton_wallet_x_address: Address.parse('kQDQw9-8FGsa7kI4evxi0C0lOvHoQVtVXuie2QuUWk2foxUE'),
                minter_otoken_address: Address.parse('kQCrk8qF6cVq8wJef_zYH9tjJm9VePINjEe6dBVbnIXMHuBn'),
                jetton_wallet_otoken_address: Address.parse('kQCrk8qF6cVq8wJef_zYH9tjJm9VePINjEe6dBVbnIXMHuBn'),
                configuration,
            },
            await compile('Main'),
        ),
    );

    await main.sendDeploy(provider.sender());

    await provider.waitForDeploy(main.address);
}
