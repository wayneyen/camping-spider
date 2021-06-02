const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const conn = require('./models/Database').conn();

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  conn.connect();

  await page.goto('https://gis.tbroc.gov.tw/TTE/index.jsp');
  await page.waitForSelector('table.table_6');

  for (let i = 1; i <= 199; i++) {
    await page.select('#PGA01', i.toString());
    await page.waitForSelector('table.table_6');

    const body = await page.content()
    const $ = await cheerio.load(body)

    $('table.table_6 tr').each(function() {
      const name = $(this).find('td.table_6').first().text();
      const city = $(this).find('td.table_6').eq(1).text();
      const land = $(this).find('td.table_6').eq(2).text();
      const usage = $(this).find('td.table_6').eq(3).text();
      const business = $(this).find('td.table_6').eq(4).text();
      const legal = $(this).find('td.table_6').eq(5).text();
      const illegal = $(this).find('td.table_6').eq(6).text();
      const indigenous = $(this).find('td.table_6').eq(7).text();
      if (name !== '') {
        const sql = 'INSERT INTO `campsites` (`name`, `city`, `land`, `usage`, `business`, `legal`, `illegal`, `indigenous`) VALUES (?)';
        conn.query(sql, [[name, city, land, usage, business, legal, illegal, indigenous]], function (err, result) {
          if (err) throw err;
          console.log(name);
        });
      }
    });
  }

  await browser.close();
  conn.end();
})();
