const axios = require('axios');
const urlConcat = require('./UrlConcat.js')
const core = require('@actions/core');

async function SendGetCommand(device, jwtToken, apiEndpoint){
    let deviceEndpoint = urlConcat.ConcatenatePlaceholder(apiEndpoint, device);
    deviceEndpoint += '?useDemo=true';    //for use in test suite, remove before final

    let headerConfig = {
        headers: {
            accept: 'text/plain',
            Authorization: 'Bearer '+jwtToken
        }
    };

    try{
        core.info(`Endpoint: ${deviceEndpoint}`);
        await axios.get(deviceEndpoint, headerConfig)
            .then(response =>{
                core.info(`Data Returned:\n Hostname:${response.data.hostName}\n Product:${response.data.product}\n Registered:${response.data.registrationState}\n Serial:${response.data.serialNumber}\n Firmware:${response.data.firmware}\n WebServer Enabled:${response.data.enableWebServer}\n WebServer Port:${response.data.webServerPort}`);
            }).catch(function(error){
                switch(error.response.status) {
                    case 401:
                        core.warning(`\tError Code ${error.response.status} with device '${device}': Authorisation Token invalid or missing.`);
                        break;
                    case 404:
                        core.warning(`\tError Code ${error.response.status} with device '${device}': Device or Endpoint not valid/found.`);
                        break;
                    default:
                        core.warning(`\tError Code ${error.response.status} with device '${device}.'`);
                        break;
                }
            });
    } catch (error) {
        core.warning(`\tError occured:\n ${error.message}.`);
    };
}

module.exports = {SendGetCommand};