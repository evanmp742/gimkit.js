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
  }
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function main(id, message) {
  const browser = await puppeteer.launch()
  
  const page = await browser.newPage()
  await page.goto('https://www.gimkit.com/play')

  await page.focus("input")
  await page.keyboard.type(id)
  await page.evaluate(() => Array.from(document.querySelectorAll('div')).find(x => x.innerHTML == 'Join').click())
  await page.waitFor(3000)

  await page.focus("input")
  await page.keyboard.type(message.member.user.tag)
  await page.evaluate(() => Array.from(document.querySelectorAll('div')).find(x => x.innerHTML == 'Join').click())
  await page.waitFor(3000)

  await page.waitForSelector('.sc-csuQGl')
  message.channel.send('game started')

  await page.waitForSelector('.notranslate')
  let options = await page.evaluate(() => Array.from(document.querySelectorAll('span.notranslate')).map(x => x.innerText))
  const gameEmbed = {
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

  function query(string) {
    return () => Array.from(document.querySelectorAll('span')).find(x => x.innerText.includes(string))
  }

  await message.channel.send({ embed: gameEmbed }).then(async message => {
    message.react('1️⃣').then(() => message.react('2️⃣')).then(() => message.react('3️⃣')).then(() => message.react('4️⃣'))

    const filter = (reaction, user) => {
      return ['1️⃣', '2️⃣', '3️⃣', '4️⃣'].includes(reaction.emoji.name) && user.id !== message.author.id
    }

    message.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
      .then(async collected => {
        const reaction = collected.first()

        if (reaction.emoji.name === '1️⃣') {
          console.log("eleleleklelelekeoijruis")
          console.log(await page.evaluate(query(options[1])))
          
        } else {
          message.channel.send('ehehe')
        }
      })
      .catch(collected => {
        message.channel.send('you did not react')
      })
  })

  await page.waitForSelector('.sc-eTuwsz')
  await page.evaluate(() => {
    function clap() {
      document.querySelector('.sc-eTuwsz').click()
      requestAnimationFrame(clap)
    }

    clap()
  })
  await new Promise(resolve => setTimeout(resolve, 100000))

  await page.screenshot({path: 'screenshot.png'})

  await browser.close()
}

client.login(token)