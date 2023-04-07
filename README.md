# device-view-deploy
Github Action to push desired state to Cisco RoomOS and MPP/PhoneOS devices using [app.device-view.com](https://app.device-view.com) Api

## Overview

This repository provides a solution for managing Cisco RoomOS and MPP/PhoneOS device configuration using Infrastructure as Code (IaC) principles.
It uses a Github action to push the desired state to Cisco devices, with device-view.com as the integration service with Webex xApi.
Github actions can be triggered when a commit is made to a repository, on a schedule or manually triggered.

## Usage

The Github action requires the following information in order to deploy Cisco devices:

* Api Token to **device-view.com** Api
* List of target devices (i.e. Mac Addresses)
* List of commands (i.e. xCommand's) to send

To use this Github action the simplest approach is to **[Fork](../../fork)** this repository (can be made private), add/update the relevant target and command files and set an ApiToken within the Repository Action Secrets.

Once the repository is setup and an appropriate commit is made (or at a specified time/schedule) all the commands will be sent to all the specified targets.
This provides the ability to have a **Desired State** specified within the command file(s) and have that state pushed automatically (or manually triggered) to the specified target devices.

### Api Token

In order to use this Github Action you will need to obtain a Api Token from [identity.device-view.com](https://identity.device-view.com).
You will need to store your Api Token as a repository secret (Settings > Secrets and Variables > Actions).
The default name for this secret is API_TOKEN.

Note: Currently the Api Token available from [identity.device-view.com](https://identity.device-view.com) is a short lived (90min) JWT Access Token. In the future **device-view.com** will provide a way to create/rotate/revoke Api Tokens with a custom duration.

### File Structure

``` bash
.
+-- .github/workflows/main.yml          # Github Action Workflow, runs on repo commit
+-- device-view-deploy-action/*         # Custom Github Action called by main.yml
+-- src                                 # Source files, contains all target and command files
    +-- example-group                   # Desired state group
        +-- targets.csv                 # Target device list
        +-- commands.txt                # Comamnd list
```

The included [main.yml](.github/workflows/main.yml) & device-view-deploy-action/* files do not need to be modified for most scenarios.
Only the [main.yml](.github/workflows/main.yml) file would be modified to override defaults such as the target and command file names to search for.

The **[src/](src/)** folder contains the desired state files, these are saved in their own folder(s) (any folder name can be used).
You can consider each folder (within **[src/](src/)**) as a **Desired State Group** effectively a set of devices that will be given the same state by running the provided commands within the [commands.txt](src/test-group/commands.txt) file.

### Target Files

By default the Github Action searches the **[src/](src/)** folder for files with the file name 'target*.csv'. Some examples this matches:

* target1.csv
* target2.csv
* target-location1.csv
* target-location2.csv
 
This allows multiple targets files within a single **Desired State Group** folder, the contents of the files are combined to a single list of targets (duplicates are skipped).
This makes it easier to manage target files by saving a group of targets to a single file (i.e. for a location/site) and manage which groups of targets are assigned to their relevant desired state.

The target files contain a simple list of device Mac addresses with one device per line, refer to the sample [targets.csv](src/test-group/targets.csv) file as an example.

### Command Files

By default the Github Action searches the **[src/](src/)** folder for files with the file name 'command*.txt'. Some examples this matches:

* command1.txt
* command2.txt
* command-Users.txt
* command-Video.txt

This allows for commands to be split across multiple files i.e. grouped by feature/setting they configure.
Again this allows for command files to be copied to other **Desired State Group** folders for re-use and makes managing large sets of commands easier.

The command file contains a simple list of commands (i.e. xCommand) with a single command per line, refer to the sample [commands.txt](src/test-group/commands.txt) file as an example.

### Branching

As this is a git repository you can take advantage of branches to scope what updates/states are deployed.
For example you could create a 'test' branch and only include targets for test devices.
Once changes are complete you can merge the 'test' branch back into 'main' to add in the updated commands to then deploy to production targets.

### Roadmap Features

#### Device Filters
In the future the device-view.com platform/Api will incorporate a device filter feature.
When filters are available if the **Desired State Group** folder name matches a filter name then a target file is not required as the devices that match the filter will become the targets.
Therefore only command file(s) will be necessary eliminating the need to manipulate device Mac addresses and enables dynamic matching
i.e. a new device added will be updated the next time the Github Action is triggered.

#### RoomOS Macros
In the future support will be added for RoomOS macros, this will be a case of saving the macro (ie. index.js file) to a 'macros' subfolder within a **Desired State Group** folder.
The javascript file must be saved in its own folder, the folder name that contains the javascript file will be used as the name of the macro.

Here is an example of the folder structure with a macro called 'macro1':


``` bash
.
+-- src                                 # Source files, contains all target and command files
    +-- example-group                   # Desired state group
        +-- targets.csv                 # Target device list
        +-- commands.txt                # Comamnd list
        +-- macros                      # Macros folder
            +-- macro1                  # Individual macro folder, folder name is used as macro name
                +-- index.js            # Macro javascript file to upload to target RoomOS devices
```

#### Multiline Command support

Some xCommands (i.e. uploading a Macro) are multi-line, the **device-view.com** Api supports multiline commands however a way to handle them in the commands.txt file has not been implemented as yet.

#### Offline Devices
Currently the device-view.com Api will return an error if a device is offline, this would mean the device would not be updated until it is next online and the Github Action is triggered.
In the future we shall look at updating the **device-view.com** Api to allow offline devices to be retried at a later time.
This will most likely use an optional field i.e. 'deployment-tag' that would hold a unique identifier for the deployment such as the commit hash.
The **device-view.com** Api would then be able to track the deployment and retry any offline devices when they come back online.
Any subsequent deployment with a different 'deployment-tag' would be considered a new deployment and any previous commands with a different 'deployment-tag' would be removed.

#### Parameterised Commands

In the future we shall look at adding support for parameterised commands, this would allow for inserting/interpolating values into the command based on other device information.
There may be limited value to this as the additional complexity may outweigh the benefits, in particular it may be simpler to create a script to directly submit to the **device-view.com** Api.
The main value from parameterised commands would be to allow insertion of sensitive information such as passwords, this would be a case of storing the sensitive information in a Github Secret and then using the secret in the command.
We could also look to use the target.csv file to provide per-device information to be used in the commands such as a unit name or location.

#### Device Query

The **device-view.com** Api is designed to consolidate and simplify operations with Cisco RoomOS and MPP/PhoneOS devices.
As part of this simplification it is possible to send xConfiguration and xStatus commands to the **device-view.com** Api.
A Github action is best suited for pushing configuration/state however we think there would be merit if we could also use this action to query device information and save/export.

## Feedback
As this is a new project we would welcome any feedback, please feel free to raise an [issue](../../issues/new?title=Feedback&labels=enhancement) or [contact us](mailto:mail@unifiedfx.com) directly.
