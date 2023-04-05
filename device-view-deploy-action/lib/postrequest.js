const axios = require('axios');
const urlConcat = require('UrlConcat')
const core = require('@actions/core');

async function SendPostCommand(device, xCommand, jwtToken, apiEndpoint){
    let deviceEndpoint = urlConcat.ConcatenatePlaceholder(apiEndpoint, device);
    deviceEndpoint += '/command?useDemo=true';    //for use in test suite, remove before final

    let headerConfig = {
        headers: {
            accept: '*/*',
            ContentType: 'application/json',
            Authorization: 'Bearer '+jwtToken
        }
    };

    let bodyData = {
        "command": xCommand
    };

    try{
        core.info(`Endpoint: ${deviceEndpoint}`)
        await axios.post(deviceEndpoint, bodyData, headerConfig)
            .then(response =>{
                core.info(`Response:${response.status} - xCommand(s) sent`);
            }).catch(function(error){
                switch(error.response.status) {
                    case 401:
                        core.warning(`\tError Code ${error.response.status} with device '${device}': Authorisation Token invalid or missing`);
                        break;
                    case 404:
                        core.warning(`\tError Code ${error.response.status} with device '${device}': Device or Endpoint not valid/found `);
                        break;
                    default:
                        core.warning(`\tError Code ${error.response.status} with device '${device}'`);
                        break;
                }
            });
    } catch (error) {
        core.warning(`\tError occured:\n ${error.message}`);
    };
}

module.exports = {SendPostCommand};