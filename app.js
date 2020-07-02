const fs = require("fs");
const ini = require('ini');
const request = require('request');
const Discord = require('discord.js');
const config = ini.parse(fs.readFileSync('settings.ini', 'utf-8'));
const HookNoParse = config.webhookURL
var getFromBetween = {
    results: [],
    string: "",
    getFromBetween: function (sub1, sub2) {
        if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var SP = this.string.indexOf(sub1) + sub1.length;
        var string1 = this.string.substr(0, SP);
        var string2 = this.string.substr(SP);
        var TP = string1.length + string2.indexOf(sub2);
        return this.string.substring(SP, TP);
    },
    removeFromBetween: function (sub1, sub2) {
        if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return false;
        var removal = sub1 + this.getFromBetween(sub1, sub2) + sub2;
        this.string = this.string.replace(removal, "");
    },
    getAllResults: function (sub1, sub2) {
        if (this.string.indexOf(sub1) < 0 || this.string.indexOf(sub2) < 0) return;
        var result = this.getFromBetween(sub1, sub2);
        this.results.push(result);
        this.removeFromBetween(sub1, sub2);
        if (this.string.indexOf(sub1) > -1 && this.string.indexOf(sub2) > -1) {
            this.getAllResults(sub1, sub2);
        }
        else return;
    },
    get: function (string, sub1, sub2) {
        this.results = [];
        this.string = string;
        this.getAllResults(sub1, sub2);
        return this.results;
    }
};
var webhookID = getFromBetween.get(HookNoParse, "webhooks/", "/");
var indexing = HookNoParse.lastIndexOf('/');
var webhookToken = HookNoParse.substring(indexing + 1);

const webhookClient = new Discord.WebhookClient(webhookID, webhookToken);
const cfg = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
const valC = cfg.Authentication.ROBLOSECURITY || cfg.Authentication.roblosecurity
const cookie = request.cookie('.ROBLOSECURITY=' + valC);

var timeToCheck = 5

var checkCount = -1
var currentID
var tradeID

var headers = {
    'Content-Type': 'application/json',
    'Cookie': cookie
};

var roliHeaders = {
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36"
};


var options = {
    url: "https://trades.roblox.com/v1/trades/Completed?sortOrder=Asc&limit=10",
    method: 'GET',
    headers: headers,
    json: true
};


function loopFunction() {
    fs.readFile("./CTNrecentTradeID.txt", function (err, buf) {
        currentID = buf.toString()
    });
    var robloxTradeData = request(options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            tradeID = body["data"][0].id
            tradePartner = body["data"][0].user.name
            if (tradeID != currentID) {

                var tradeInfoOptions = {
                    url: "https://trades.roblox.com/v1/trades/" + tradeID,
                    method: 'GET',
                    headers: headers,
                    json: true
                }

                request(tradeInfoOptions, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                        var playerAssetsArray = {}
                        var partnerAssetsArray = {}
                        var tradePartnerID = body["user"]["id"]
                        var userOffer = body.offers[0].userAssets
                        var partnerOffer = body.offers[1].userAssets
                        userOffer.forEach(function (item) {
                            var AssetID = item["assetId"]
                            var UAID = item["id"]

                            playerAssetsArray[AssetID] = [UAID] 
                        });

                        partnerOffer.forEach(function (item) {
                            var AssetID = item["assetId"]
                            var UAID = item["id"]

                            partnerAssetsArray[AssetID] = [UAID]
                        });

                        var rolimonOptions = {
                            url: "https://www.rolimons.com/itemapi/itemdetails",
                            method: '
                            ET',
                            headers: roliHeaders,
                            json: true
                        }

                        request(rolimonOptions, function (error, response, body) {
                            if (!error && response.statusCode === 200) {
                                var item_list = body["items"]
                                function calc(l) {
                                    var a = 0
                                    var t = 0
                                    var e = 0;
                                    for (var s in l) {
                                        var i = l[s].length
                                            , n = item_list[s][2]
                                            , c = item_list[s][3];
                                        a += (null == c ? n : c) * i,
                                            t += n * i,
                                            e += i
                                    }
                                    return {
                                        value: a,
                                        rap: t,
                                        num_limiteds: e
                                    }
                                }
                                var playerTradeData = calc(playerAssetsArray)
                                var partnerTradeData = calc(partnerAssetsArray)
                                var givenValue = playerTradeData.value
                                var recievedValue = partnerTradeData.value

                                if (givenValue <= 0) {
                                    givenValue = 0
                                }

                                if (recievedValue <= 0) {
                                    recievedValue = 0
                                }

                                var givenRAP = playerTradeData.rap
                                var recievedRAP = partnerTradeData.rap
                                const embed = {
                                "title": "Trade Completed",
                                "description": "A New trade has been completed!",
                                "url": "https://www.roblox.com/trades",
                                "color": 15101036,
                                "timestamp": new Date(),
                                "footer": {
                                    "text": "Dev: Chrrxs"
                                },
                                "thumbnail": {
                                    "url": "https://web.roblox.com/Thumbs/Avatar.ashx?x=100&y=100&Format=Png&userid=" + tradePartnerID
                                },
                                "author": {
                                    "name": "CTN",
                                    "icon_url": "https://media.giphy.com/media/cL4VwGyAEP76FQV4vs/giphy.gif"
                                },
                                "fields": [
                                    {
                                        "name": "Trade Partner",
                                        "value": tradePartner
                                    },
                                    {
                                        "name": "Value Given",
                                        "value": givenValue,
                                        "inline": false
                                    },
                                    {
                                        "name": "Value Recieved",
                                        "value": recievedValue,
                                        "inline": false
                                    },
                                    {
                                        "name": "Rap Given",
                                        "value": givenRAP,
                                        "inline": true
                                    },
                                    {
                                        "name": "Rap Recieved",
                                        "value": recievedRAP,
                                        "inline": true
                                    }
                                ]
                                };

                                webhookClient.send({
                                    username: 'CTN Open Source',
                                    avatarURL: 'https://media3.giphy.com/media/1QcqLUCuQca1edQ0rK/giphy.gif',
                                    embeds: [embed],
                                });
                            }
                            else { console.log(body) }
                        })


                    } else {
                        console.log(body)
                    }
                });

                fs.writeFile("./CTNrecentTradeID.txt", tradeID, (err) => {
                    if (err) console.log(err);
                });
            }
        } else {
            console.log(body)
        }
            });
    robloxTradeData.on('error', function (err) {
        console.log("ERROR: Cookie Invalid - Roblox Declined the request")
    });
    checkCount = checkCount + 1
    process.stdout.write(`Seconds: ${timeToCheck * checkCount}\r`);
    setTimeout(loopFunction, timeToCheck * 1000);
}

console.clear()
console.log("----------------------------------------------------\nCompleted Trade Notifier - Started! (Made by Chrrxs)")
console.log("----------------------------------------------------\nElapsed Time:")
loopFunction();
