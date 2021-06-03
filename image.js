const puppeteer = require("puppeteer")
const cheerio = require("cheerio")
const conn = require("./models/Database").conn()

;(async () => {
  conn.connect()
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  conn.query(
    "SELECT * FROM `campsites` WHERE `images` IS NULL LIMIT 500",
    async function (err, results, fields) {
      if (err) throw err

      for (let i = 0; i < results.length; i++) {
        const id = results[i].id
        const name = results[i].name
        // await page.goto(`https://www.google.com.tw/search?q=${name}%20訂位`)

        // 圖片搜尋首頁
        let url = 'https://www.google.com.tw/search?newwindow=1&hl=zh-TW&authuser=0&tbm=isch&sxsrf=ALeKk02BzaqsyXKTcBT9bxyyFAfS5VNTDQ%3A1622704642936&source=hp&biw=1369&bih=764&ei=AoK4YKieNq2Kr7wPgcmqmAo&oq=%E6%B0%B4%E4%B9%8B%E5%AE%9A%E8%8E%8A%E5%9C%92&gs_lcp=CgNpbWcQDDIECAAQGFCjtAdY06YIYOSuCGgCcAB4AIABNIgBZJIBATKYAQCgAQKgAQGqAQtnd3Mtd2l6LWltZ7ABAA&sclient=img&ved=0ahUKEwiop8Lu9frwAhUtxYsBHYGkCqMQ4dUDCAc'
        url += '&q=' + name
        await page.goto(url);

        const body = await page.content()
        const $ = await cheerio.load(body)

        let images = []
        for (let i = 1; i <= 10; i++) {
          images.push($('#islmp').find('img').eq(i - 1).attr('src'));
        }

        if (images[0] != undefined) {
          const join = images.join("\n");
          const sql = `UPDATE campsites SET images = '${join}' WHERE id = ${id}`
          console.log(id)
          conn.query(sql, [], function (err, results, fields) {
            if (err) throw err
          })
        } else {
          break
        }
      }

      console.log("Done.")
    }
  )
})()
