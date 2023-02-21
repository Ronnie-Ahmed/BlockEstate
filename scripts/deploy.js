// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat")
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether")
}
async function main() {
    const [buyer, seller, inspector, lender] = await ethers.getSigners()
    const realfactory = await ethers.getContractFactory("RealEstate")
    const realestate = await realfactory.deploy()
    await realestate.deployed()
    for (let i = 0; i < 3; i++) {
        const transaction = await realestate
            .connect(seller)
            .mint(
                `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${
                    i + 1
                }.json`
            )
        await transaction.wait()
    }
    console.log(`Deployed at : ${realestate.address}`)
    console.log(`Minting properties
     `)
    const escrowfactory = await ethers.getContractFactory("Escrow")
    const escrow = await escrowfactory.deploy(
        realestate.address,
        seller.address,
        inspector.address,
        lender.address
    )
    await escrow.deployed()
    for (let i = 0; i < 3; i++) {
        const transaction = await realestate
            .connect(seller)
            .approve(escrow.address, i + 1)
        await transaction.wait()
    }
    let transaction = await escrow
        .connect(seller)
        .list(1, buyer.address, tokens(20), tokens(10))
    await transaction.wait()

    transaction = await escrow
        .connect(seller)
        .list(2, buyer.address, tokens(15), tokens(5))
    await transaction.wait()

    transaction = await escrow
        .connect(seller)
        .list(3, buyer.address, tokens(10), tokens(5))
    await transaction.wait()

    console.log(`Finished.`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
