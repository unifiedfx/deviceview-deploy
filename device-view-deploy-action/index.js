const core = require('@actions/core');
const extractor = require('./lib/ExtractCSVContents');
const glob = require("@actions/glob");
const path = require("path");
const postRequest = require("./lib/postrequest");

let apiToken = core.getInput('api-token');
let sourceConfigPath = core.getInput('source-config-path');
let apiEndpoint = core.getInput('api-endpoint');
let commandFilename = core.getInput('command-filename');
let targetFilename = core.getInput('target-filename');
let macroPath = core.getInput('macro-path');
let useDemo = core.getInput('use-demo');

async function main(){
    var argv = require('minimist')(process.argv.slice(2));
    if(apiToken == null || apiToken.length == 0) apiToken = argv['api-token'] ?? 'defaultValue';
    if(sourceConfigPath == null || sourceConfigPath.length == 0) sourceConfigPath = argv['source-config-path'] ?? 'src';
    if(apiEndpoint == null || apiEndpoint.length == 0) apiEndpoint = argv['api-endpoint'] ?? 'https://app.device-view.com/api/devices/{id}';
    if(commandFilename == null || commandFilename.length == 0) commandFilename = argv['command-filename'] ?? 'command*.txt';
    if(targetFilename == null || targetFilename.length == 0) targetFilename = argv['target-filename'] ?? 'target*.csv';
    if(macroPath == null || macroPath.length == 0) macroPath = argv['macro-path'] ?? 'macros';
    if(useDemo == null || useDemo.length == 0) useDemo = argv['use-demo'] ?? 'false';
    const basePath = path.resolve(__dirname, `../${sourceConfigPath}`);
    const commands = await getCommands(basePath);
    const targetPaths = await getTargetPaths(basePath);
    const cmds = await joinTargetPaths(commands, targetPaths);
    await sendCommands(cmds, apiToken, apiEndpoint);
}
async function sendCommands(groups, apiToken, apiEndpoint){
    console.log(groups);
    for(const group of groups){
        let targets = await getTargets(group);
        for(const target of Object.keys(targets)){
            let cmds = []
            for(const path of group.paths.sort()){
                cmds = cmds.concat(await extractor.ExpandCommand(path, targets[target]));
            }
            for(const cmd of cmds) {
                console.log(cmd, targets[target]);
                try {
                    await postRequest.SendPostCommand(target, cmd, apiToken, apiEndpoint, useDemo === 'true');
                }  catch (error) {
                    console.log(error);
                    break;
                }
            }
        }
    }
}
async function getTargets(command){
    let targets = {};
    for(const target of command.targets){
        let t = await extractor.ExtractContents(target);
        for(const dest of t){
            if(targets[dest.id]){
                Object.assign(targets[dest.id], dest);
            }
            else
            {
                targets[dest.id] = dest;
            }
        }
    }
    return targets;
}
async function getCommands(basePath){
    const commandPatterns = [basePath + `/*/${commandFilename}`];
    const commandPaths = await (await glob.create(commandPatterns.join('\n'))).glob();
    return getGroups(basePath, commandPaths);
}
async function getMacros(basePath){
    const macroPatterns = [basePath + `/*/${macroPath}/*/*.js`];
    const macroPaths = await (await glob.create(macroPatterns.join('\n'))).glob();
    return getGroups(basePath, macroPaths);
}
async function getTargetPaths(basePath){
    const targetPatterns = [basePath + `/*/${targetFilename}`];
    const targetPaths = await (await glob.create(targetPatterns.join('\n'))).glob();
    return getGroups(basePath, targetPaths);
}
async function joinTargetPaths(group, targetPaths){
    let result = [];
    for(let i = 0; i < group.length; i++){
        let g = group[i];
        let d = targetPaths.find(d => d.group === g.group);
        if(d){
            result.push({
                group: g.group,
                paths: g.paths,
                targets: d.paths
            });
        }
    }
    return result;
}
function getGroups(basePath, paths = []){
    const start = basePath.split('/').length;
    let groups = [];
    for(let i = 0; i < paths.length; i++){
        let path = paths[i];
        let group = path.split('/').slice(start)[0];
        if(!groups.some(g => g.group === group)){
            groups.push({
                group: group,
                paths: [path]
            });
        }
        else {
            let g = groups.find(g => g.group === group);
            g.paths = g.paths.concat(path);
        }
    }
    return groups;
}

main();
