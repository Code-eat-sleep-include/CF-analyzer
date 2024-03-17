const puppeteer = require('puppeteer')

const scrapeUserSubmissions = async function (userName, password) {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
        dumpio: false
    });
    const page = await browser.newPage();

    await page.setViewport({ height: 720, width: 1200 });
    await page.goto(`https://codeforces.com/enter?back=%2Fsubmissions%2F${userName}`, { waitUntil: 'networkidle0' });
    await page.type('#handleOrEmail', userName);
    await page.type('#password', password);

    await page.click('.submit');
    await page.waitForNetworkIdle();

    let pagination;

    try {
        pagination = await page.$$eval('.page-index', items => items[items.length - 1].getAttribute('pageindex'))
    }
    catch {
        return "Error";
    }

    let pages = Number(pagination);

    let array = [];
    let pageCount = 2;

    while (pageCount <= pages) {

        let submissions = await page.$$eval('.status-small', items => {
            let temp = []
            for (let i = 1; i < items.length; i += 3) {
                if (items[i + 1].innerText == "Accepted") {
                    temp.push(items[i].innerText);
                }
            }
            return temp;
        })

        for (let i of submissions){
            array.push(i);
        }

        await page.goto(`https://codeforces.com/submissions/${userName}/page/${pageCount}`);
        pageCount++;
        await page.waitForNetworkIdle();
    }

    let set = new Set(array);
    let probs = []
    for (let i of set){
        probs.push(i.split(" - ")[1])
    }

    browser.close();

    return probs;
}

module.exports = scrapeUserSubmissions;
