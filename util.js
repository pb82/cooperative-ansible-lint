const fs = require('fs');

const batchMaxFiles = 10;
const batchMaxSizeBytes = 100 * 1024;
const excludeDirectories = ['.github', 'venv', 'docs'];

// lists all files in a directory recursively
exports.listFiles = function listFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (f) {
        const file = dir + '/' + f;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (excludeDirectories.indexOf(f) >= 0) return;
            results = results.concat(listFiles(file));
        } else {
            const fileType = file.split(".").pop();
            if (fileType === 'yml' || fileType === 'yaml') {
                results.push({file, size: stat.size});
            }
        }
    });
    return results;
}

function batchSizeReached(batch) {
    if (batch.length >= batchMaxFiles) return true;
    return batch.reduce((acc, item) => {
        return acc + item.size;
    }, 0) >= batchMaxSizeBytes
}

// splits up a list of files into batches where:
// 1) there are at max 10 files in a batch
// 2) the size of all files in a batch does not exceed 100kb
exports.partition = function (files) {
    const batches = [];
    let currentBatch = [];
    for (let i = 0; i < files.length; i++) {
        currentBatch.push(files[i]);
        if (batchSizeReached(currentBatch)) {
            batches.push(currentBatch);
            currentBatch = [];
            continue;
        }
    }
    if (currentBatch.length) batches.push(currentBatch);
    return batches;
}