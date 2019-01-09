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

* Build new JSON Schema files locally
  * All properties of schemas named `*_id` or `*_ids` have enum that
    are ids collected from actual dataset. So you can use auto-complete with ids
    in your editor like Visual Studio Code.
* Generate each index files per directory under `docs/`
  * ex.) `docs/products/index.json`
  * useful to `fetch` dataset
  * example https://houkiboshi-fabric.github.io/contents/dyeing-materials/index.json

```console
$ yarn build
```

### Watch

* Watch specific directories continually and run
  Build and Validate json files except for `index.json`
  * `docs/dyeing-material-types/**/!(index).json`
  * `docs/dyeing-materials/**/!(index).json`
  * `docs/products/**/!(index).json`
  * `docs/raw-materials/**/!(index).json`

```console
$ yarn watch
// or
$ yarn start
```

### Validate

* Validate json files using Ajv
* Validate json files except for `index.json`
  * `docs/dyeing-material-types/**/!(index).json`
  * `docs/dyeing-materials/**/!(index).json`
  * `docs/products/**/!(index).json`
  * `docs/raw-materials/**/!(index).json`

```console
$ yarn validate
```

### Test

* Run JavaScript test using Jest

```console
$ yarn test
// or
$ yarn test:watch
```

### Lint

* Lint JavaScript files using ESLint

```console
$ yarn lint
```
