var express = require('express');
var request = require("request");
var jsdom = require('jsdom');
const
{
    JSDOM
} = jsdom;
const
{
    window
} = new JSDOM('<html></html>');
var $ = require('jquery')(window);
var app = express();
app.use(express.static('client'))


var fs = require('fs');

var pKey = fs.readFileSync(__dirname + "/key.key");
var cert = fs.readFileSync(__dirname + "/cert.cert");
var bundle = fs.readFileSync(__dirname + "/bundle.ca-bundle");
var creds = {key: pKey, cert: cert, ca: bundle, requestCert: false,rejectUnauthorized: false};


var server = require('https').createServer(creds, app);
var io = require('socket.io')(server);

var baseUrl = "https://faceinthe.space:3000"
var tempImage;
var data;

server.listen(1024);
console.log(process.env.IP);
var path = require('path');
app.get('/authenticate', function(req, res)
{
    res.sendFile(__dirname + '/client/authenticate.html');
});

/*app.get('/', function(req, res)
{
    res.sendFile(__dirname + "/admin/index.html");
});*/

io.on('connection', function(socket)
{
    socket.on('authenticate', function(data)
    {
        console.log("auth-request");

		tempData = data; 
        $.post(baseUrl + "/identifyUser", data)
            .done(function(data)
            {
                console.log(data)
                socket.broadcast.emit('auth-result', data); // { personId : adfsdfasdf-qerqfads, error : 0 }

                if (data.error == 0)
                {
                    socket.emit('auth-result',
                    {
                        id: data.personId,
                        result: true
                    });
                }
                else
                {
                    socket.emit('auth-result',
                    {
                        result: false
                    });
                }
            });
    });
    socket.on('addUser', function(data)
    {
        console.log("adding user");

        if (!data.image) data.image = tempData.image;
        if (!data.group) data.group = tempData.group;

        var ename = data.name;

        

       $.post(baseUrl + "/addUser", data)
            .done(function(data)
            {
                console.log(data)
                socket.broadcast.emit('auth-result',
                {
                    personId: data.personId,
                    result: true


                });
                
                
                console.log("emitting added user");
                io.sockets.emit('addedUser',
                {
                    name: ename,
                    id: data.personId
                });

        
                tempData = null;
            });
    });

});
