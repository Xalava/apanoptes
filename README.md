# apanoptes
Argus Panoptes, the giant to launch, monitor and analyse Pantheon Nodes

## Concept 

Argus Panoptes can be launched locally or on a server to launch and manage Pantheon Nodes. It downloads the latest docker image, launches it and offers a frontend interface to monitor it. 

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

