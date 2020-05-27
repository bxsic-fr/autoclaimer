const discord = require("discord.js")
const client = new discord.Client()
const fetch = require("node-fetch")
client.login(process.argv[2])
client.on("ready", () => {
    console.log("ready to accept nitro as " + client.user.tag)
})
function matchCode(text, callback){
    let codes = text.match(/https:\/\/discord\.gift\/[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789]+/)
    if(codes){
        callback(codes[0])
        return matchCode(text.slice(codes.index+codes[0].length), callback)
    }else{
        callback(null)
    }
}
client.on("message", message => {
    let codes = []
    matchCode(message.content, (code) => {
        if(!code)return
        if(!codes.includes(code))codes.push(code)
    })
    if(codes.length == 0)return
    codes.forEach(code => {
        fetch("https://canary.discordapp.com/api/v6/entitlements/gift-codes/"+code.split("/").pop()+"/redeem", {
            method: "post",
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "en-US",
                "Authorization": client.token,
                "Connection": "keep-alive",
                "Content-Length": JSON.stringify({channel_id: message.channel.id}).length,
                "Content-Type": "application/json",
                "Host": "canary.discordapp.com",
                "Referer": `https://canary.discordapp.com/channels/${message.channel.id}/${message.id}`,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0",
                "X-super-properties": Buffer.from(JSON.stringify({
                    "os":"Windows",
                    "browser":"Firefox",
                    "device":"",
                    "browser_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:66.0) Gecko/20100101 Firefox/66.0",
                    "browser_version":"66.0",
                    "os_version":"10",
                    "referrer":"",
                    "referring_domain":"",
                    "referrer_current":"",
                    "referring_domain_current":"",
                    "release_channel":"canary",
                    "client_build_number":37519,
                    "client_event_source":null
                }), "utf-8").toString("base64")
            },
            body: JSON.stringify({channel_id: message.channel.id})
        }).then(res => {
            if(res.status == 400 || res.status == 404)return console.log("code invalide "+code)
            res.json().then(json => {
                console.log(json)
                console.log("ce code a normalement été accepté")
            })
        }).catch(console.error)
    })
})