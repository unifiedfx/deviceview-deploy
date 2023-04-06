const core = require('@actions/core');
const extractor = require('./lib/ExtractCSVContents');
const glob = require("@actions/glob");
const path = require("path");
const postRequest = require("./lib/postrequest");

let apiToken = core.getInput('api-token');
let apiEndpoint = core.getInput('api-endpoint');
let sourceConfigPath = core.getInput('source-config-path');

async function main(){
    const basePath = path.resolve(__dirname, `../${sourceConfigPath}`);
    console.log(basePath);
    const commands = await getCommands(basePath);
    console.log(commands);
    const targetPaths = await getTargetPaths(basePath);
    const cmds = await joinTargetPaths(commands, targetPaths);
    await sendCommands(cmds, apiToken, apiEndpoint);
}
async function sendCommands(groups, apiToken, apiEndpoint){
    console.log(groups);
    for(const group of groups){
        let targets = await getTargets(group);
        let cmds = []
        for(const path of group.paths.sort()){
            cmds = cmds.concat(await extractor.ExtractContents(path));
        }
        for(const target of targets){
            for(const cmd of cmds) {
                console.log(cmd, target);
                try {
                    await postRequest.SendPostCommand(target, cmd, apiToken, apiEndpoint);
                }  catch (error) {
                    console.log(error);
                    break;
                }
            }
        }
    }
}
async function getTargets(commands = []){
    let targets = {};
    for (const cmd of commands) {
        for(const target of cmd.targets){
            let t = await extractor.ExtractContents(target);
            for(const dest of t){
                targets[dest] = true;
            }
        }
    }
    return Object.keys(targets);
}
async function getCommands(basePath, commandFilename = 'command*.txt'){
    const commandPatterns = [basePath + `/*/${commandFilename}`];
    const commandPaths = await (await glob.create(commandPatterns.join('\n'))).glob();
    return getGroups(basePath, commandPaths);
}
async function getMacros(basePath, macroPath = 'macros'){
    const macroPatterns = [basePath + `/*/${macroPath}/*/*.js`];
    const macroPaths = await (await glob.create(macroPatterns.join('\n'))).glob();
    return getGroups(basePath, macroPaths);
}
async function getTargetPaths(basePath, targetFilename = 'target*.csv'){
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
