# houkiboshi-fabric contents

houkiboshi-fabric dataset

## Requirements

- [Node.js](https://nodejs.org/)
  - See [.node-version](./.node-version)
- [Yarn](https://yarnpkg.com/)
- [Git](https://git-scm.com/)
  - to get timestamps from git history

## Recommended

- [nodenv/nodenv](https://github.com/nodenv/nodenv)
- [nodenv/node-build](https://github.com/nodenv/node-build)
- [EditorConfig](https://editorconfig.org/)

## Install

```console
git clone git@github.com:houkiboshi-fabric/contents.git
cd contents/
nodenv update-version-defs && nodenv install # <-- optional
yarn install
```

## Tasks

### Build

- Generate json files with timestamps
  - import from under `src/`, export into `dist/`
  - timestamps from git commit history
    - `created_at`
    - `modified_at`
- Generate each index files per specified directory under `dist/`
  - ex.) `dist/products/index.json`
  - ex.) https://houkiboshi-fabric.github.io/contents/dyeing-materials/index.json
  - import from under `dist/`, export into `dist/`
  - useful to `fetch` dataset

```console
yarn build
```

### Build schemas

- Build new JSON Schema files locally
  - All properties of schemas named `*_id` or `*_ids` have enum that
    are ids collected from actual dataset. So you can use auto-complete with ids
    in your editor like Visual Studio Code.

```console
yarn build-schemas
```

### Validate

- Validate json files using Ajv
  - `src/dyeing-material-types/**/*.json`
  - `src/dyeing-materials/**/*.json`
  - `src/products/**/*.json`
  - `src/raw-materials/**/*.json`

```console
yarn validate
```

### Watch

- Watch specific directories continually and run `build-schemas` and `validate`
  - `src/dyeing-material-types/**/*.json`
  - `src/dyeing-materials/**/*.json`
  - `src/products/**/*.json`
  - `src/raw-materials/**/*.json`

```console
yarn watch
// or
yarn start
```

### Test

- Run JavaScript test using Jest

```console
yarn test
// or
yarn test:watch
```

### Lint

- Lint JavaScript files using ESLint

```console
yarn lint
```

### Deploy

- `yarn build` & commit files under `dist/` and push them to `gh-pages` branch
- You don't need to run this task manually in most cases since
  this task will be run automatically on CI.

```console
yarn deploy
```

## Author

[houkiboshi-fabric](https://github.com/houkiboshi-fabric)
