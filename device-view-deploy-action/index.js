const Fs = require('fs');
const core = require('@actions/core');
const extractor = require('./lib/ExtractCSVContents');
const macro1 = require('./lib/getrequest');
const macro2 = require('./lib/postrequest');

let apiToken = core.getInput('api-token');
let apiEndpoint = core.getInput('api-endpoint');
let sourceConfigPath = core.getInput('source-config-path');
let destinationsCSV = __dirname + `/${sourceConfigPath}/destinations.csv`;
let commandsCSV = __dirname + `/${sourceConfigPath}/commands.csv`;

async function main(){
    if(!Fs.existsSync(destinationsCSV) || !Fs.existsSync(commandsCSV)) {
        core.error(`\tDestinations '${destinationsCSV}' or Commands ${commandsCSV} file not found`);
    } else {
        try{
            let deviceArray = await extractor.ExtractContents(destinationsCSV);
            let commandArray = await extractor.ExtractContents(commandsCSV);
            core.info(`CSV data extracted successfully`);
            OutputCalls(deviceArray, commandArray);
        } catch (err){
            core.error(`\tError processing CSV files: ${err.message}`);
        }
    }
}

async function OutputCalls(deviceArray, commandArray){
    try{
        core.info('\n** GET Calls **')
        for(var i = deviceArray.length - 1; i >= 0; i--){
            core.info(`GET Request for device: ${deviceArray[i]}`);
            await macro1.SendGetCommand(deviceArray[i], apiToken, apiEndpoint);
            core.info('\n');
        }

        core.info('** POST Calls **')
        for(i = 0; i < deviceArray.length; i++){
            for(j = 0; j < commandArray.length; j++){
                core.info(`POST Request for device: ${deviceArray[i]} with command(s):\n${commandArray[j]}`);
                await macro2.SendPostCommand(deviceArray[i], commandArray[j], apiToken, apiEndpoint);
                core.info('\n');
            }
        }
    } catch(err){
        core.error(`\t${err.message}`);
    }
}

main();
