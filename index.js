const puppeteer = require('puppeteer')
const readline = require('readline')
const Discord = require('discord.js')
const client = new Discord.Client()
const { prefix, token } = require('./config.json')

const correctEmbed = {
  "title": "correct!",
    "author": {
    "name": "gimkit bot",
    "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
  },
  "color": 53380,
  "fields": [
    {
      "name": "Money",
      "value": "(insert value here)"
    }
  ]
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`)
})

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return

  const args = message.content.slice(prefix.length).split(' ')
  const command = args.shift().toLowerCase()

  if (command === 'joingame') {
    if (!args.length) {
      return message.channel.send(`You didn't provide the game id, ${message.author}!`);
    } else {
      const gamecode = args[0]
      main(gamecode, message)
    }
  } else if (command === 'embedtest') {
    message.channel.send({ embed: gameEmbed }).then(message => {
      message.react('1️⃣').then(() => message.react('2️⃣')).then(() => message.react('3️⃣')).then(() => message.react('4️⃣'))

      const filter = (reaction, user) => {
        return ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].includes(reaction.emoji.name) && user.id !== message.author.id
      }

      message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
        .then(collected => {
          const reaction = collected.first()

          if (reaction.emoji.name === '1️⃣') {
            message.delete()
            message.channel.send({ embed: correctEmbed }).then(message => {
              message.react('👍')

              const filter = (reaction, user) => {
                return ['👍'].includes(reaction.emoji.name) && user.id !== message.author.id
              }

              message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
                .then(collected => {
                  const reaction = collected.first()

                  if (reaction.emoji.name === '👍') {
                    message.delete()
                  }
                })
                .catch(collected => {
                  message.channel.send('you reacted with neither a thumbs up, nor a thumbs down.')
                })
            })
          } else {
            message.channel.send('ehehe')
          }
        })
        .catch(collected => {
          message.channel.send('you reacted with neither a thumbs up, nor a thumbs down.')
        })
    })
  } else if (command === 'help') {
    // const data = { type: "ok" }
    const helpEmbed = new Discord.MessageEmbed()
      .setColor('0xffff75')
      .setTitle('Command To Run')
      .setDescription('-joingame (gamecode)')
    
    message.channel.send({ embed: helpEmbed })
  }
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function main(id, message) {
  const browser = await puppeteer.launch({ headless: false })
  
  const page = await browser.newPage()
  await page.goto('https://www.gimkit.com/play')

  await page.waitForSelector("input")
  await page.focus("input")
  await page.keyboard.type(id)
  await page.evaluate(() => Array.from(document.querySelectorAll('div')).find(x => x.innerHTML == 'Join').click())
  await page.waitFor(3000)

  await page.focus("input")
  await page.keyboard.type(message.member.user.tag)
  await page.evaluate(() => Array.from(document.querySelectorAll('div')).find(x => x.innerHTML == 'Join').click())
  await page.waitFor(3000)

  await page.waitForSelector("span.notranslate")
  message.channel.send('game started')

  function createGameEmbed(options) {
    return {
      "title": options[0],
      "author": {
        "name": "gimkit bot",
        "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
      },
      "color": 0x03a5fc,
      "fields": [
        {
          "name": "1️⃣",
          "value": options[1],
          "inline": true
        },
        {
          "name": "2️⃣",
          "value": options[2],
          "inline": true
        },
        {
          "name": "3️⃣",
          "value": options[3],
          "inline": true
        },
        {
          "name": "4️⃣",
          "value": options[4],
          "inline": true
        }
      ]
    }
  }

  const endElement = () => page.$$('div')
    .then(x => x.map(y => y.asElement()))
    .then(x => x.map(async y => Object.assign(y, {innerText: await page.evaluate(z => z.innerText, y)})))
    .then(x => Promise.all(x))
    .then(x => x.some(y => y.innerText === 'Final Balance'))

  /* page.waitForSelector('.infinite', { timeout: 0 }).then(async () => await page.evaluate(() => {
    for (let i = 0; i < 1000; i++) {
      Array.from(document.querySelectorAll('.infinite')).filter(x => x.innerText.includes('👏'))[0].click()
    }
  })) */

  page.waitForSelector('.infinite', { timeout: 0 }).then(() => {
    page.evaluate(async () => {
      for (i = 0; i < 1000; i++) {
        document.querySelectorAll('.infinite').forEach(x => x.click())
        await new Promise(res => setTimeout(res, 100))
      }
    })
  })

  while (true) {
    if (await endElement()) break
    await page.waitForSelector('.notranslate')
    if (await endElement()) break

    const options = await page.evaluate(() => Array.from(document.querySelectorAll('span.notranslate')).map(x => x.innerText))
    const gameEmbed = createGameEmbed(options)

    if (await endElement()) break
    await message.channel.send({ embed: gameEmbed })
      .then(embeddedmessage => {
        embeddedmessage.react('1️⃣')
        embeddedmessage.react('2️⃣')
        embeddedmessage.react('3️⃣')
        embeddedmessage.react('4️⃣')
      })
    if (await endElement()) break

    const react = await new Promise(resolve => client.on("messageReactionAdd", (reaction, user) => {
      if (user.id === message.author.id) {
        if (reaction.emoji.name === '1️⃣') resolve(1)
        if (reaction.emoji.name === '2️⃣') resolve(2)
        if (reaction.emoji.name === '3️⃣') resolve(3)
        if (reaction.emoji.name === '4️⃣') resolve(4)
        client.removeAllListeners("messageReactionAdd")
      }
    }))

    if (await endElement()) break
    await page.$$(`span.notranslate`)
      .then(x => x.map(y => y.asElement()))
      .then(x => x.map(async y => Object.assign(y, {innerText: await page.evaluate(z => z.innerText, y)})))
      .then(x => Promise.all(x))
      .then(x => x.filter(y => y.innerText === options[react])[0])
      .then(x => x.click())
    if (await endElement()) break

    if (await endElement()) break
    await page.waitFor(2000)
    if (await endElement()) break

    if (await endElement()) break
    await page.$$('div')
      .then(x => x.map(y => y.asElement()))
      .then(x => x.map(async y => Object.assign(y, {innerText: await page.evaluate(z => z.innerText, y)})))
      .then(x => Promise.all(x))
      .then(x => x.filter(y => y.innerText === 'Continue')[0])
      .then(x => x.click())
    if (await endElement()) break

    if (await endElement()) break
    await page.waitFor(2000)
    if (await endElement()) break
  }

  for (let i = 0; i <= 1000; i++) {
    // page.waitForSelector('.infinite', { timeout: 0 }).then(x => x.click())
    await page.evaluate(() => document.querySelectorAll('.infinite').forEach(x => x.click()))
    await page.waitFor(2000)
  }

  await page.waitFor(2000)

  console.log('iruhdnisvjkn')

  await browser.close()
}

client.login(token)