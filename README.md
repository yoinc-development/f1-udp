# f1-upd

[![GitHub release](https://img.shields.io/github/v/release/ngwn-studio/f1-udp?include_prereleases&style=for-the-badge)](https://github.com/ngwn-studio/f1-udp/releases)
[![GitHub issues](https://img.shields.io/github/issues/ngwn-studio/f1-udp?style=for-the-badge)](https://github.com/ngwn-studio/f1-udp/issues)

## Summary
This is a JavaFX application to display and handle F1 2021 telemetry data.

## Specs:
- JDK: ``Corretto-17``
- JavaFX: ``17.0.1``
- Game Version: ``F1 2021 ``

## Setup

For game specific issues (and a guide on how their system works) please refer to their [forum thread]( https://forums.codemasters.com/topic/80231-f1-2021-udp-specification/).

x

## Testing

### Mac
These commands are to be executed from the terminal.

- Listen to a port (4445 - only catches one packet): `nc -ul 4445` 
- Send dummy data ("test") to a port (4445): `echo -n "test" | nc -4u -w0 localhost 4445`

## Manual

x
