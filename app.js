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
                        var userOffer = body.offers[1].userAssets
                        var partnerOffer = body.offers[0].userAssets
                        userOffer.forEach(function (item) {
                            var AssetID = item["assetId"]
                            var UAID = item["id"]
                            if (playerAssetsArray[AssetID] !== undefined) {
                                playerAssetsArray[AssetID].push(UAID)
                            } else {
                                playerAssetsArray[AssetID] = [UAID]
                            }
                        });

                        partnerOffer.forEach(function (item) {
                            var AssetID = item["assetId"]
                            var UAID = item["id"]
                            if (partnerAssetsArray[AssetID] !== undefined) {
                                partnerAssetsArray[AssetID].push(UAID)
                            } else {
                                partnerAssetsArray[AssetID] = [UAID]

                            }
                        });

                        var rolimonOptions = {
                            url: "https://www.rolimons.com/itemapi/itemdetails",
                            method: 'GET',
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
                                function getNonValued(l) {
                                    var total = 0
                                    for (var s in l) {
                                        if (item_list[s][3] == -1) {
                                            total = total + parseInt(item_list[s][2]) + 1
                                        }
                                    }
                                    return {
                                        extra: total
                                    }
                                }

                                var playerTradeData = calc(playerAssetsArray)
                                var partnerTradeData = calc(partnerAssetsArray)
                                var additionalRapPlayer = getNonValued(playerAssetsArray)
                                var additionalRapPartner = getNonValued(partnerAssetsArray)

                                var recievedValue = partnerTradeData.value + additionalRapPartner.extra

                                var givenValue = playerTradeData.value + additionalRapPlayer.extra

                                var givenRAP = playerTradeData.rap
                                var recievedRAP = partnerTradeData.rap

                                const embed = {
                                    "title": "Trade Completed",
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
                                        "name": "CTN (Open Source)",
                                        "icon_url": "https://img.icons8.com/cotton/2x/checkmark.png"
                                    },
                                    "fields": [
                                        {
                                            "name": "Trade Partner",
                                            "value": tradePartner
                                        },
                                        {
                                            "name": "Value Given",
                                            "value": recievedValue,
                                            "inline": false
                                        },
                                        {
                                            "name": "Value Recieved",
                                            "value": givenValue,
                                            "inline": false
                                        }
                                    ]
                                };

                                webhookClient.send({
                                    username: 'Trade Notifier',
                                    avatarURL: 'https://tr.rbxcdn.com/34a1c42bb0265048b32998a9ec040fc0/420/420/Decal/Png',
                                    content: config.mention,
                                    embeds: [embed],
                                });
                            }
                            else { console.log(body) }
                        })


                    } else {
                        console.log(body)
                    }
                });

                fs.writeFile("./CTNrecentTradeID.txt", tradeID.toString(), (err) => {
                    //ERROR FIX: If you get an error saying invalid arg type try changing 'tradeID' to 'tradeID.toString()`
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
