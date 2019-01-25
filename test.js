const request = require('request')
const throttledRequest = require('throttled-request')(request)

throttledRequest.configure({
    requests: 1,
    milliseconds: 2000
})

const ctx = {
    reply: (msg) => {
        console.log(msg)
    }
}

const getStatUrl = (wallet) => {
    return `https://api.etn.spacepools.org/v1/stats/address/${wallet}`
}

const getSocialUrl = () => {
    return 'https://api.coinmarketcap.com/v1/ticker/electroneum/'
}
//
// throttledRequest(getSocialUrl(), {json: true}, (err, res, data) => {
//     if (data[0]) {
//         data = data[0]
//         console.log(data)
//
//         let output = [
//             `💰 ETN to USD: ${data.price_usd}`,
//             `💰 ETN to BTC: ${data.price_btc}`,
//             `${chartEmoji(data.percent_change_1h)} Change 1 hour: ${data.percent_change_1h}%`,
//             `${chartEmoji(data.percent_change_24h)} Change 24 hours: ${data.percent_change_24h}%`,
//             `${chartEmoji(data.percent_change_7d)} Change 7 days: ${data.percent_change_7d}%`,
//         ]
//         ctx.reply(output.join('\n'))
//     } else {
//         return ctx.reply('Error')
//     }
// })


const wallet = 'etnk1NYv8ndBc4K68rgnPxJ7Arz6rVMQYbq4gjgWK7wAMX5VnhnYmY6GWi4BCNv7de6JHFhMDvNEsU4MDCV2QpkM7NqUmMvWco'

let url = getStatUrl(wallet)
throttledRequest(url, {json: true}, (err, res, body) => {
})