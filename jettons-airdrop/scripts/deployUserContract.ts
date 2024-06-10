import { Address, toNano } from '@ton/core';
import { UserContract } from '../wrappers/UserContract';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const userContract = provider.open(UserContract.createFromConfig({
        owner_address: Address.parse("0QAZWpJf_wKa71UQJ49e2exbTbvHaz67f4Ip8NIyXquH-Kdc"),
        parent_address: Address.parse(""),
        campaign_id: 1,
        public_key: 59404852957881491208161262178047543490527709553548189276561698965588786171491n,
    }, await compile('UserContract')));

    await userContract.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(userContract.address);

    // run methods on `userContract`
}
