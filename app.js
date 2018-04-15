const vorpal = require('vorpal')();
const client = require('./client.js');
const io = require('socket.io-client');
const Blockchain = require("./Blockchain.js");
const blockchain = new Blockchain();
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
var fs = require("fs");

var blockchainFile = fs.readFileSync("blockchain.json");
if (JSON.parse(blockchainFile).length > 1) {
    blockchain.replaceChain(JSON.parse(blockchainFile));
} else {
    fs.writeFile("blockchain.json", JSON.stringify(blockchain.blockchain), "utf8", function() {});
}

var socket = io.connect('http://10.7.2.96:3100');
socket.emit('client');

socket.on('reconnect', function() {
    socket.emit('client');
})
socket.on('client transaction', function(data) {
    var transactionFile = fs.readFileSync('transactions.json');
    var transactions = JSON.parse(transactionFile);
    var keypair = ec.keyFromPublic(data.sender, 'hex');
    if (keypair.verify(data.amount, data.sign) == true) {
        transactions.push(data);
        fs.writeFile("transactions.json", JSON.stringify(transactions), "utf8", function() {});
    }
});

vorpal.use(client, { 'blockchain': blockchain });