"use strict";

var request = require("request");

var TOKEN = "124540712:AAGH0T0FCppq6anQrtS-mXyql_wfZAB5RtY";

var baseRequest = request.defaults({
    baseUrl: "https://api.telegram.org/bot" + TOKEN + "/"
});

var noop = function () { };
var callMethod = function (methodName, params, cb) {
    cb = cb || noop;
    var req = { uri: methodName, formData: params, method: "POST" };
    // как выяснилось, метод getMe не может обработать POST-запрос с multipart/form-data
    if (methodName === "getMe") {
        req.qs = params;
        delete req.formData;
    }
    baseRequest(req, function (err, response, body) {
        console.log(err, body);
        if (err) {
            return cb(err);
        }
        cb(err, JSON.parse(body));
    });
};

var getUpdatesOffset = 0;
var getUpdates = function (cb) {
    var params = { offset: getUpdatesOffset, timeout: 60 };
    callMethod("getUpdates", params, function (error, data) {
        if (data.result.length) {
            getUpdatesOffset = data.result[data.result.length - 1].update_id + 1;
        }
        cb(error, data);
    });
}

var logic = function (update) {
    var message = update.message;
    if (!message) {
        return;
    }

    if(message.text.substr(0,6) === "/roll ") {
    	var string, count, dice, modifer, roll, res, response;
    	var msg = message.text.substr(6);

    	string = msg.toString().split("d");
    	count = string[0];
    	if(!count) count = 1;

    	string = string[1].split("+");
    	dice = string[0];
    	modifer = string[1];
    	if(!modifer) modifer = 0;

 		roll = Math.floor(Math.random(count, dice*count) * (dice*count - count + 1) + 1);
 		res = Number(roll) + Number(modifer);

 		if(modifer != 0) {
 			response = "Dice: "+count+"d"+dice+"+"+modifer+"\n"+res + " ("+roll+" + "+modifer+")";
 		} else {
 			response = "Dice: "+count+"d"+dice+"\n"+res + " ("+roll+" + "+modifer+")";
 		}

    	return callMethod("sendMessage", { 
    		chat_id: message.chat.id, 
    		text: response
    	});
    }

    callMethod("sendMessage", { 
    	chat_id: message.chat.id, 
    	text: "Write '/roll diceType' to roll a dice.\nExamples:\n\n/roll 2d8+4\n/roll d20" 
    });
}

var runBot = function () {
    getUpdates(function (error, data) {
        if (!data.ok) {
            return console.log(data);
        }
        data.result.map(logic);
        runBot();
    });
};

callMethod("getMe", {}, function (error, data) {
    runBot();
});