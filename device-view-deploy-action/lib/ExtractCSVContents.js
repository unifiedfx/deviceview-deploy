const Fs = require('fs');
const CsvReadableStream = require('csv-reader');

async function ExtractContents(csvFilePath){
    var inputStream = Fs.createReadStream(csvFilePath, 'utf8');
    let dataPresent = false;
    var csvArray = new Array();
    await new Promise ((resolve,reject)=>{
        inputStream
            .pipe(new CsvReadableStream({ delimiter: ',', skipEmptyLines: true, parseNumbers: true, parseBooleans: true, trim: true }))
            .on('data', function (row) {
                dataPresent = true;
                let item = row.toString();
                if(item.charAt(0) !='#' && item.charAt(0) != ''){  //disregard lines starting with '#' or blanks (skipEmptyLines doesnt work)
                    csvArray.push(item);
                }
            })
            .on('end', function () {
                if(!dataPresent){
                    console.log('File empty.');
                    reject();
                } else {
                    resolve();
                }
            });
    });
    if (csvArray.length < 1){
        throw new Error(`File '${csvFilePath}' contains no data or is in incorrect format.`);
    }
    return csvArray;
}

module.exports = {ExtractContents};