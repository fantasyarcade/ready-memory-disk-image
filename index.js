// TODO: label
// TODO: validate disk image

const {
    writeFixedLengthAsciiString,
    readUint32BE,
    writeUint32BE
} = require('@fantasyarcade/uint8array-utils');

const DiskHeader = 'READYOK';
const DiskHeaderSize = DiskHeader.length + 1;

const OffsetHeader          = 0;
const OffsetBlockSize       = DiskHeaderSize;
const OffsetBlockCount      = OffsetBlockSize + 4;
const OffsetFileSystemType  = OffsetBlockCount + 4;
const MetaBlockLength       = OffsetFileSystemType + 4;

exports.createInitialDiskImage = function(blockSize, blockCount, fsType) {
    const buffer = new ArrayBuffer(blockSize * blockCount);
    const bytes = new Uint8Array(buffer);
    writeFixedLengthAsciiString(bytes, OffsetHeader, DiskHeaderSize, DiskHeader);
    writeUint32BE(bytes, OffsetBlockSize, blockSize);
    writeUint32BE(bytes, OffsetBlockCount, blockCount);
    writeUint32BE(bytes, OffsetFileSystemType, fsType);
    return new MemoryDiskImage(bytes);
}

exports.validateDiskImageBytes = function(bytes) {
    // TODO ...
}

exports.parseDiskImage = function(bytes) {
    return new MemoryDiskImage(bytes);
}

class MemoryDiskImage {
    constructor(data) {
        this._blockSize = readUint32BE(bytes, OffsetBlockSize);
        this._blockCount = readUint32BE(bytes, OffsetBlockCount);
        this._fsType = readUint32BE(bytes, OffsetFileSystemType);
        this._data = data;
    }

    get blockSize() { return this._blockSize; }
    get blockCount() { return this._blockCount; }
    get fileSystemType() { return this._fsType; }

    zeroBlock(block) {
        const start = block * this.blockSize;
        const end = start + this.blockSize;
        for (let i = start; i < end; ++i) {
            this._data[i] = 0x00;
        }
    }

    writeBlock(block, data) {
        let rp = 0, wp = block * this.blockSize;
        while (rp < this.blockSize) {
            this._data[wp++] = data[rp++];
        }
    }

    readBlock(block, outBuffer) {
        let rp = block * this.blockSize, wp = 0;
        while (wp < this.blockSize) {
            outBuffer[wp++] = this._data[rp++];
        }
    }
};