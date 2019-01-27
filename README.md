# ogn-web-viewer

This README outlines the details of collaborating on this Ember application.
A short introduction of this app could easily go here.

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

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/)
* [Yarn](https://yarnpkg.com/)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

* `git clone <repository-url>` this repository
* `cd ogn-web-viewer`
* `yarn install`

## Running / Development

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Code Generators

Make use of the many generators for code, try `ember help generate` for more details

### Running Tests

* `ember test`
* `ember test --server`

### Linting

* `yarn lint:hbs`
* `yarn lint:js`
* `yarn lint:js --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (production)

### Deploying

Specify what it takes to deploy your app.

## Further Reading / Useful Links

* [ember.js](https://emberjs.com/)
* [ember-cli](https://ember-cli.com/)
* Development Browser Extensions
  * [ember inspector for chrome](https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi)
  * [ember inspector for firefox](https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/)
