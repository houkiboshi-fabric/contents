# houkiboshi-fabric contents

houkiboshi-fabric dataset

## Requirements

- Node.js
  - See `.node-version`
- yarn

## Install

``` console
$ git clone git@github.com:houkiboshi-fabric/contents.git
$ cd contents/
$ nodenv install # <-- optional
$ yarn install
```

## Tasks

### Build

Build new JSON Schema files locally.
All properties of schemas named `*_id` or `*_ids` have enum that
are ids collected from actual dataset. So you can use auto-complete with ids
in your editor like Visual Studio Code.

```console
$ yarn build
```

### Watch

```console
$ yarn watch
// or
$ yarn start
```
