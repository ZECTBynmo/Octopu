# Octopu

Octopu is a node.js build system. It allows you to easily spin up build machines, kick off builds, and manage various aspects of your build machines from a simple interface.

## Installation

```
npm install -g octopu
```

### Build Manager

A web application that allows you to manage and launch builds on various computers.

#### Usage (from the command line)

To start up a Build Manager instance on your computer:

```
octopu launch manager
```

After that, you should be able to access the Build Manager at http://localhost:1337.

### Build Starter

A web application that interacts with the Build Manager and launches new builds.

#### Usage (from the command line)

To start up a Build Starter instance on your computer:

```
octopu launch starter
```

The first time you launch a build starter on a computer, you will need to give it the address of the Build Manager it will be working with. To do this, go to http://localhost:2000, and fill out the form you're presented with.