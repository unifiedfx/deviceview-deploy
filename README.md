# deviceview-deploy
Github Action to push desired state to RoomOS and MPP/PhoneOS devices using device-view.com Api

## Overview

This repository provides a solution for managing Cisco RoomOS device configuration using Infrastructure as Code (IaC) principles. It uses a Github action to push the desired state to Cisco RoomOS devices, with Device-View.com as the integration service with Webex Xapi.

As per the recommended GitHub documentation found [here](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action#commit-tag-and-push-your-action-to-github), the `package.json`, `package-lock.json` files and  `node_modules` folder must be included to run successfully.

## Usage

### Workflow

To use this solution, add the following step to your workflow YAML file:

``` yaml
      - name: Call Device Endpoint
        id: apiCall
        uses: 'DeclanRodgers/Cisco-RoomOS-State-Action@1.0'
        with:
            token-data: ${{ secrets.JWT_TOKEN }}
            api-endpoint: "https://app.device-view.com/api/devices/{id}"
```

### JWT Token

You will need to store your JWT token as a repository secret (Settings > Secrets and Variables > Actions). The default name for this secret is JWT_TOKEN.

### '`api-endpoint`'

The api-endpoint parameter is optional, and specifies the endpoint to call for interactions with MPP devices. The default value is shown in the example above.

### '`destinations.csv`'

This file should contain a list of Device MAC addresses to call.

### '`commands.csv`'

This file should contain xCommands to send to a Device.

## Conclusion

This solution provides an easy-to-use method for managing Cisco RoomOS device configuration using Infrastructure as Code principles. It can be easily integrated into your existing workflows, and provides a secure way to manage your Cisco RoomOS devices.