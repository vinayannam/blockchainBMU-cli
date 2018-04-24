const P2p = require("./P2p.js");
var fs = require("fs");
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
var colors = require('colors');


function client(vorpal, data) {
    const p2p = new P2p(data.blockchain);
    vorpal
        .use(connectCommand, p2p)
        .use(blockchainCommand, data.blockchain)
        .use(mineCommand, { 'p2p': p2p, 'blockchain': data.blockchain })
        .use(openCommand, p2p)
        .use(transactionsCommand)
        .use(welcome)
        .delimiter('BMU-Blockchain \\O/→>>'.red)
        .show()
}

module.exports = client;

function welcome(vorpal) {
    vorpal.exec("help");
    vorpal.log("Welcome to BMU Blockchain CLI!\n".magenta.bold);
}

function connectCommand(vorpal, p2p) {
    vorpal
        .command('connect <host>', "Connect to a new peer. Eg: connect 10.7.2.96")
        .alias('c')
        .action(function(args, callback) {
            if (args.host) {
                try {
                    p2p.connectToPeer(args.host, 2727);
                } catch (err) {
                    this.log(err);
                }
            }
            callback();
        })
}

function blockchainCommand(vorpal, blockchain) {
    vorpal
        .command('blockchain', 'See the current state of the blockchain.')
        .alias('bc')
        .action(function(args, callback) {
            this.log(':--- Blockchain ---:'.yellow);
            for (var i = 0; i <= 0; i++) {
                var block = blockchain.blockchain[i];
                this.log();
                this.log('Index: '.cyan, String(block.index).white);
                this.log('Previous Hash: '.cyan, String(block.previousHash).white);
                this.log('Timestamp: '.cyan, String(block.timestamp).white);
                this.log('Data: {'.cyan);
                this.log('  Genesis : '.magenta, String(block.data).white);
                this.log(' }'.cyan);
                this.log('Hash: '.cyan, String(block.hash).white);
                this.log('Nonce: '.cyan, String(block.nonce).white);
            }
            for (var i = 1; i < blockchain.blockchain.length; i++) {
                var block = blockchain.blockchain[i];
                this.log();
                this.log('Index: '.cyan, String(block.index).white);
                this.log('Previous Hash: '.cyan, String(block.previousHash).white);
                this.log('Timestamp: '.cyan, String(block.timestamp).white);
                this.log('Data: {'.cyan);
                var data = JSON.parse(block.data);
                this.log('  Sender: '.magenta, String(data.sender).white);
                this.log('  Receiver: '.magenta, String(data.reciever).white);
                this.log('  Amount: '.magenta, String(data.amount).white);
                this.log('  Timestamp: '.magenta, String(data.timestamp).white);
                this.log('}'.cyan);
                this.log('Hash: '.cyan, String(block.hash).white);
                this.log('Nonce: '.cyan, String(block.nonce).white);
            }
            this.log();
            callback();
        })
}

function mineCommand(vorpal, funcs) {
    vorpal
        .command('mine', 'Mine a new block in chronological order. Eg: mine')
        .alias('m')
        .action(function(args, callback) {
            var transactionsFile = fs.readFileSync('transactions.json');
            var transactions = JSON.parse(transactionsFile);
            var blockchain = funcs.blockchain;
            var p2p = funcs.p2p;
            if (transactions.length == 0) {
                this.log('No new transactions.');
            } else {
                var transaction = transactions[0];
                var keypair = ec.keyFromPublic(transaction.sender, 'hex');
                if (keypair.verify(transaction.amount, transaction.sign) == true) {
                    blockchain.mine(JSON.stringify(transaction));
                } else {
                    this.log('Sorry! the latest transaction seems to be corrupted. Fetching latest blockchain...');
                }
                transactions.splice(0, 1);
            }
            fs.writeFile("transactions.json", JSON.stringify(transactions), "utf8", function() {});
            fs.writeFile("blockchain.json", JSON.stringify(blockchain.blockchain), "utf8", function() {});
            p2p.broadcastLatest();
            callback();
        })
}

function openCommand(vorpal, p2p) {
    vorpal
        .command('open', 'Open port to accept incoming connections. Eg: open')
        .alias('o')
        .action(function(args, callback) {
            p2p.startServer(2727);
            this.log(`Listening to peers on 2727`);
            callback();
        })
}

function transactionsCommand(vorpal) {
    vorpal
        .command('transactions', 'Show the un-mined transactions.')
        .alias('t')
        .action(function(args, callback) {
            var transactionsFile = fs.readFileSync('transactions.json');
            var transactions = JSON.parse(transactionsFile);
            this.log(':--- Transactions ---:'.yellow);
            for (var i = 0; i < transactions.length; i++) {
                this.log();
                var transaction = transactions[i];
                this.log('Index: '.cyan, String(i + 1).white);
                this.log('Sender: '.cyan, String(transaction.sender).white);
                this.log('Receiver: '.cyan, String(transaction.reciever).white);
                this.log('Amount: '.cyan, String(transaction.amount).white);
                this.log('Timestamp: '.cyan, String(transaction.timestamp).white);
            }
            this.log();
            callback();
        })
}