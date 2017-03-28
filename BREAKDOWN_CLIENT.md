# Client-Side File Rundown

### index.html
  - Main landing point for the page
### socketAddr.js
  - Loaded into index.html, contains your socket address
  - This file is git IGNORED: it is up to you to define it with:
    - window.socketAddr = 'http://<<ADDRESS>>:<<PORT>>';
    - This is used for testing/deploying the app in various environments without needing to constantly update addresses and ports
### styles.css
  - Contains all styling information not built into backbone
### favicon.ico
  - The icon you see in the top of a tab when the app is open

## SRC files (these get compiled into the compiled folder)

### src/app.jsx
  - Responsible for the rendering of the app as a whole
  - Has a few methods for communicating between top-level components
### src/player.jsx
  - Responsible for rendering the player
  - Calls upon react-player, but implements a substantial amount of additional functionality using react-player's very open setup
### src/queue.jsx
  - Responsible for all queue-related components:
    - Queue: component that renders all queue elements
    - QueueElement: Child of Queue, renders each video with up/down vote buttons
    - Add: Child of Queue, allows for addition of videos to the queue
### src/apiRoutes.js
  - Helper file for all necessary API endpoints on the serverside. If you want to communicate with the server, check here
### src/index.js
  - Renders the app to the DOM
  - initializes the socket address and admin status

