Ship.js
=======

A tool to allow building and deploying Dockerfiles via a Git Push

Installation
============

`npm install`

Usage
=====

On the Server

`node ship.js`

On the client

`git remote add docker http://servername:7000/reponame`

Then just

`git push docker master`

And your repo will be pushed to the server, the Dockerfile will be built and then run.


Port Mapping
============

To define the port mapping for your project, just add a file name ship.config to the root directory of the project.


`{
  "ports": {
    "80": "8080",
    "443": "8081"
  }
}`

This config file would map 80 on the container to 8080 on the host and 443 on the container to 8081 on the host
