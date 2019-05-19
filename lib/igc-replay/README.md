igc-replay
===============================================================================

This in-reqo-addon can be used to simulate glider traffic coming from the
OGN WebGateway.

The addon is disabled by default and compiled out of the build in production
mode. In development mode a `replay` query parameter can be passed to the
page to enable the replay:

    http://localhost:4200/?replay&tsk=/igc-replay/Bayreuth-2018-05-27/task.tsk&lst=/igc-replay/Bayreuth-2018-05-27/filter.csv

There is currently only one scenario available:

    Bayreuth Competition
    Date: 2018-05-27
    Class: Open
