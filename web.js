const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
const conn = require("./models/Database").conn()

;(async () => {
  conn.connect()
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  conn.query(
    "SELECT * FROM `campsites` WHERE id > 204 AND `website` IS NULL LIMIT 500",
    async function (err, results, fields) {
      if (err) throw err

      for (let i = 0; i < results.length; i++) {
        const id = results[i].id
        const name = results[i].name
        await page.goto(`https://www.google.com.tw/search?q=${name}`)
        const body = await page.content()
        const $ = await cheerio.load(body)

        const stores = $("div.kp-hc").first()
        const contents = $("div.wp-ms").first()

        if ($.text().substring(0, 20) != 'https://www.google.c') {
          const store = {
            website: ''
          }

          stores.find('a').each(function (i, element) {
            if ($(this).text() == '網站') {
              store.website = $(this).attr('href');
            }
          })

          console.log(id, store)

          if (store.website != '') {
            const sql = `UPDATE campsites SET website = '${store.website}' WHERE id = ${id}`
            conn.query(sql)
          }
        } else {
          break
        }
      }

      console.log("Done.")
    }
  )

  // conn.end()

  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();

  // await page.goto('https://www.google.com.tw/search?q=三富休閒農場%20訂位');
  // // await page.waitForSelector('div.g');

  // const body = await page.content()
  // const $ = await cheerio.load(body)

  // console.log($('div.g').first().find('a').first().attr('href'))
  // console.log($('div.g').eq(1).find('a').first().attr('href'))
  // console.log($('div.g').eq(2).find('a').first().attr('href'))
})()
