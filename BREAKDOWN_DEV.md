# Breakdown of Dev Env stuff:

## Bower
  - Some client-side dependencies do not exist on CDNs (react-player, primarily)
  - You'll want to run `bower install` on any fresh run

## NPM
  - Pretty routine stuff here: plenty of node dependencies. run `npm install` before any fresh run
  - There are a number of dependencies you'll want installed GLOBALLY to run the app:
    - node (duh =P)
    - nodemon (for auto-updating stuff)
    - grunt-cli (more on this later)
    - babel
      - babel (by itself)
      - babel-core (for running babel-based stuff)
      - babel-runtime (not always necessary, but helps to clear up some errors. would recommend)
    - bower (for dependencies mentioned above)

## Grunt
### Default
  - Just running `grunt` will compile all the files, start up the server, and spin up some watchers:
    - it will watch for any changes serverside and restart the server (nodemon)
    - it will also watch for any JS/JSX changes in client/src and recompile prior to restarting the server via nodemon
### Compile
  - Only compiles all the ES6 and JSX stuff, for React
### start
  - Starts the server via nodemon. Will not compile, and will not watch for non JS changes in order to recompile