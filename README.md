ogn-web-viewer
==============================================================================

[OpenGliderNet] WebViewer

This project contains a webapplication that connects to the [OGN WebGateway],
and shows live aircraft positions on a map including relevant metadata.

[OpenGliderNet]: http://wiki.glidernet.org/
[OGN WebGateway]: https://github.com/Turbo87/ogn-web-gateway


Competition
------------------------------------------------------------------------------
ogn-web-viewer is also designed to follow competition with filtering gliders, drawing task and realtime scoring.
 
### Tasks setup
Task format used is XCSoar format.
You can add to URL tsk= with URL pointing to an XCSoar task file hosted for example on gist.
Example:
```
https://ogn.fva.cloud/#tsk=https://gist.githubusercontent.com/Turbo87/62167f4f16f3e94f7bd04d7d6388d79d/raw/club.tsk
```

### Filtering gliders & pilots
You can provide in URL also a file in CSV format to list all gliders & pilots.
Format is as follow:
```
ID,CALL,CN,TYPE,HANDICAP,NAME
```
Example:
```
ID,CALL,CN,TYPE,HANDICAP,NAME
FLRDDA7EA,D-0681,Z,LS 1d,0.984,Johanna Alberding
FLRFLA4YK,D-1591,Y4,LS 4,1.025,Heike Deboben
```
To add it to URL you can use lst= to point to an URL providing this file.
Please note that lst can not be used without a task.
Example:
```
https://ogn.fva.cloud/#tsk=https://gist.githubusercontent.com/Turbo87/62167f4f16f3e94f7bd04d7d6388d79d/raw/club.tsk&lst=https://gist.githubusercontent.com/Turbo87/62167f4f16f3e94f7bd04d7d6388d79d/raw/club-filter.csv
```


Contributing
------------------------------------------------------------------------------

### Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn start
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint:js
yarn lint:hbs
```


License
------------------------------------------------------------------------------

This project is licensed under either of

 - Apache License, Version 2.0, ([LICENSE-APACHE](LICENSE-APACHE) or
   <http://www.apache.org/licenses/LICENSE-2.0>)
   
 - MIT license ([LICENSE-MIT](LICENSE-MIT) or
   <http://opensource.org/licenses/MIT>)

at your option.
