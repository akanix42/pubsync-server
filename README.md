pubsync server
========

The server (receiving) end of a tool for publishing files from 1 computer to another, written for node.js.

* Exclude files or folders using regular expressions
* Automatically deletes files that exist on the destination but not on the source (unless excluded)
* Automatically rolls back all changes if the publish fails
* Utilizes gzip compression for faster transfers
* Client available here: [nathantreid/pubsync-client]


Installation on Windows (untested on other OS's)
---
```sh
npm install pubsync-server
robocopy /e /move node_modules\pubsync-server .
```

Usage
---
The server runs on port 3000.

```sh
node pubsync-server.js
```

Configuration
---
There is currently no server configuration available at this time (just edit the code). Reading from a config.json is a planned feature.

License
---

MIT

Author
---
Nathan Reid


[nathantreid/pubsync-client]:https://github.com/nathantreid/pubsync-client