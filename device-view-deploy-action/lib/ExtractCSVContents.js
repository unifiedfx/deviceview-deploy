const fs = require('fs/promises');
const exceljs = require('exceljs');
const Mustache = require('mustache');

async function ExpandCommand(command, target){
    const data = await fs.readFile(command, 'utf8');
    var expanded = [];
    var template = data;
    if(target){
        template = Mustache.render(data, target);
    }
    var lines = template.split('\n');
    for(var line of lines){
        if(line.trim().length > 0 && line.trim().charAt(0) != '#'){
            expanded.push(line);
        }
    }
    return expanded;
}

async function ExtractContents(csvFilePath){
    var workbook = new exceljs.Workbook();
    await workbook.csv.readFile(csvFilePath).then(function(worksheet) {
        var skipRows = [];
        worksheet.eachRow(function(row, rowNumber) {
            if(row.values.length > 0 && row.values[1] && row.values[1].charAt(0) == '#'){
                skipRows.push(rowNumber);
            }
            console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
        });
        for(var i = skipRows.length - 1; i >= 0; i--){
            worksheet.spliceRows(skipRows[i],1);
        }
    });
    var worksheet = workbook.getWorksheet(1);
    var firstRow = worksheet.getRow(1);
    if(firstRow.getCell(1).value.toLowerCase() != 'id'){
        worksheet.insertRow(1, ['id']);
    }
    for (let i = 1; i < worksheet.columns.length; i++) {
        if(!firstRow.getCell(i + 1).value) {
            worksheet.columns[i].header = 'arg' + i;
        }
    }
    var data = [];
    var rows = worksheet.getSheetValues();
    for (let i = 2; i < rows.length; i++) {
        var row = {
            id: rows[i][1]
        };
        for (let j = 2; j < rows[i].length; j++) {
            row[rows[1][j]] = rows[i][j];
        }
        data.push(row);
    }
    return data;
}

module.exports = {ExtractContents,ExpandCommand};