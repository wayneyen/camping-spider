const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
const conn = require("./models/Database").conn()

;(async () => {
  conn.connect()
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  conn.query(
    "SELECT * FROM `campsites` WHERE `stores` IS NULL LIMIT 500",
    async function (err, results, fields) {
      if (err) throw err

      for (let i = 0; i < results.length; i++) {
        const id = results[i].id
        const name = results[i].name
        await page.goto(`https://www.google.com.tw/search?q=${name}%20訂位`)

        const body = await page.content()
        const $ = await cheerio.load(body)

        const stores = $("div#rhs").first().html()

        if (body != undefined) {
          if (stores) {
            const sql = `UPDATE campsites SET stores = '${btoa(stores)}' WHERE id = ${id}`
            console.log(id)
            conn.query(sql, [], function (err, results, fields) {
              if (err) throw err
            })
          } else {
            const sql = `UPDATE campsites SET stores = 'none' WHERE id = ${id}`
            console.log(id + ' none')
            conn.query(sql, [], function (err, results, fields) {
              if (err) throw err
            })
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
