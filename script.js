import puppeteer, { Frame } from "puppeteer";

const getPage = async (year, gameDay) => {
    const browser = await puppeteer.launch({
        headless: "new",
        defaultViewport: null
    });

    // Open a new page
    const page = await browser.newPage();
    const url = "https://www.gazzetta.it/calcio/fantanews/voti/serie-a-" + (year - 1) + "-" + (year - 2000) + "/giornata-" + gameDay;
    console.log(url);
    await page.goto(url, {
        waitUntil: "domcontentloaded",
    });

    setTimeout(() => { page.click("#privacy-cp-wall-accept"); }, 2000);
    const teams = await page.evaluate(() => {
        let playerList = [];
        let voteList = [];
        let playerWithVotes = [];
        Array.from(document.querySelectorAll(".playerNameIn")).map(player => playerList.push(player.innerText));
        Array.from(document.querySelectorAll(".inParameter.fvParameter")).map(vote => {
            if (vote.innerText !== "FV")
                voteList.push(vote.innerText)
        });

        for (let i = 0; i < playerList.length; i++) {
            playerWithVotes.push(new Object({
                pName: playerList[i],
                pVotes: voteList[i]
            }));
        }

        return playerWithVotes;
    });

    await new Promise(r => setTimeout(r, 2500));
    console.log(teams);
    await browser.close();

};

const programArgs = process.argv.slice(2);
if (programArgs.length != 1) {
    throw new Error("args more or less than 1");
} else {
    if (programArgs[0] < 1 || programArgs[0] > 38) {
        throw new Error("Game day is not between the 1st and 38th one");
    } else {
        let dateOfToday = new Date();
        let year = dateOfToday.getFullYear();
        if (dateOfToday.getMonth() > 7 && dateOfToday.getMonth() < 13) {
            getPage(year, programArgs[0]);
        } else {
            getPage(year - 1, programArgs[0]);
        }
    }
}