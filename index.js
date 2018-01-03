const Telegraf = require('telegraf')
const LocalSession = require('telegraf-session-local')
const commandParts = require('telegraf-command-parts')
const request = require('request')
const throttledRequest = require('throttled-request')(request)

throttledRequest.configure({
    requests: 1,
    milliseconds: 2000
})

const getStatUrl = (wallet) => {
    return `https://api.etn.spacepools.org/v1/stats/address/${wallet}`
}

const getPriceUrl = () => {
    return 'https://api.coinmarketcap.com/v1/ticker/electroneum/'
}

const bot = new Telegraf(process.env.BOT_TOKEN)

const isValidWallet = function (w) {
    return (/^etn(.)/.test(w) && w.length > 60)
}

const helpOutput = [
    '/add_wallet [ENT WALLET]-- add wallet to list',
    '/wallets -- wallets list',
    '/stat -- stat for each wallet',
    '/price -- price info',
]


bot.use((new LocalSession({database: 'var/session.json'})).middleware())
bot.use(commandParts())

bot.start((ctx) => {
    console.log('started:', ctx.from.id)
    ctx.session = {
        wallets: {},
    }
    ctx.reply('Welcome!')
    return ctx.reply(helpOutput.join('\n'))
})

bot.command('add_wallet', (ctx) => {
    const wallet = ctx.state.command.args
    if (isValidWallet(wallet)) {
        if (ctx.session.wallets[wallet]) {
            return ctx.reply('Wallet is already added')
        }
        ctx.session.wallets[wallet] = {}
        console.log('Add wallet', wallet)
        return ctx.reply('Wallet was added')
    }
    return ctx.reply('Invalid wallet')
})

bot.command('wallets', (ctx) => {
    let wallets = Object.keys(ctx.session.wallets)
    if (wallets.length === 0) {
        return ctx.reply(`You don't have any wallets`)
    }

    return ctx.reply('Yours wallets:\n' + wallets.join('\n'))
})

bot.command('stat', (ctx) => {
    let wallets = Object.keys(ctx.session.wallets)
    if (wallets.length === 0) {
        return ctx.reply(`You don't have any wallets`)
    }
    ctx.reply('Please, wait ⌛')
    wallets.map(async (wallet) => {
        try {
            let url = getStatUrl(wallet)
            throttledRequest(url, {json: true}, (err, res, body) => {
                if (err) {
                    console.log('Error occurred')
                    console.log(err)
                    return ctx.reply('error')
                }
                if (body.stats) {
                    const output = [
                        `💳 Wallet: ${wallet}`,
                        `🏦 Pending Balance: ${(body.stats.balance / 100)} ETN`,
                        `💵 Total Paid: ${(body.stats.paid / 100)} ETN`,
                        `⚙️ Hash Rate: ${(body.stats.hashrate | 0)}`
                    ]
                    return ctx.reply(output.join('\n'))
                }
                return ctx.reply('Error')
            })
        } catch (e) {
            console.log('Error: ' + e.message)
            ctx.reply('error')
        }
    })
})

const chartEmoji = (value) => {
    return value > 0 ? '📈' : '📉'
}

bot.command('price', (ctx) => {
    ctx.reply('Please, wait ⌛')

    throttledRequest(getPriceUrl(), {json: true}, (err, res, data) => {
        if (data[0]) {
            data = data[0]
            let output = [
                `💰 ETN to USD: ${data.price_usd}`,
                `💰 ETN to BTC: ${data.price_btc}`,
                `${chartEmoji(data.percent_change_1h)} Change 1 hour: ${data.percent_change_1h}%`,
                `${chartEmoji(data.percent_change_24h)} Change 24 hours: ${data.percent_change_24h}%`,
                `${chartEmoji(data.percent_change_7d)} Change 7 days: ${data.percent_change_7d}%`,
            ]
            ctx.reply(output.join('\n'))
        } else {
            return ctx.reply('Error')
        }
    })
})

bot.command('help', (ctx) => {
    ctx.reply(helpOutput.join('\n'))
})

bot.startPolling()