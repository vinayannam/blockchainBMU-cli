class Block {
    constructor(index, previousHash, timestamp, data, hash, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.nonce = nonce;
    }

    static get genesis() {
        return new Block(
            0,
            "0",
            0,
            "Welcome to BMU Blockchain",
            "000dc75a315c77a1f9c98fb6247d03dd18ac52632d7dc6a9920261d8109b37cf",
            0
        );
    }
}

module.exports = Block;