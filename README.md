# Argus Panoptes

Argus Panoptes is the giant to launch, monitor and analyse Pantheon Nodes. Pantheon, now Hyperledger Besu, is an Ethereum client focused on permissioned networks while maintaining comptability with Ethereum public network.

This project won second place at the 2018 Pegasys hackathon and is no longer maintained. Its features have been integrated into Hyperledger Besu (https://besu.hyperledger.org/en/stable/Concepts/Monitoring/).

## What it does

- Pull and launch Pantheon from the latest docker image
- Query information, using stdout and the JSON RPC of the node
- Displays analytics such as the number and list of connected peers
- Offer graphical commands to start, stop and reboot the node
- Can be used locally or on a server

## Prerequisites

- Docker > 17.03
- Nodejs > 8.0
- Git

## Linux and MacOS X  installation
    
    git clone git@github.com:Xalava/apanoptes.git
    npm install 
    sudo node server/logsMonitor.js
    npm run dev
  
To avoid sudo, you can also use `sudo chmod 077 /var/run/docker.sock`. Please to contribute to [improve this](https://github.com/Xalava/apanoptes/issues/1)

![screenshot](screenshot.png)

## Clean docker 
   
    sudo docker system prune --volumes