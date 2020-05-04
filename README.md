# TonJS

> The Node.js Web Framework Can Do A Ton Of Request

## Features
- Easy: Designed for usage with async and await, inspired by [zeit/micro](https://github.com/zeit/micro)
- Fast: Ultra-high performance, powered by [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js)
- Less: The whole project is ~520 lines of code without docs and testing
- Simple: Functional Oriented
- Explicit: No middleware, No Magic - modules declare all dependencies which you can see it
- Lightweight: With all dependencies, the package weighs less than a megabyte
- Type: written in typescript, support intellisense (vscode with jsdoc)

## Installation

**Core**
```sh
npm install --save @tonjs/ton # yarn add @tonjs/ton
```

**Bin**
```sh
npm install --save @tonjs/bin # yarn add @tonjs/bin
```

**Logger**
```sh
npm install --save @tonjs/logger # yarn add @tonjs/logger
```

## Usage
Install @tonjs/ton ans @tonjs/bin
```sh
npm install --save @tonjs/ton @tonjs/bin # yarn add @tonjs/ton @tonjs/bin
```

Create an `index.js` or `index.ts` file and export a function that accepts the uWS.HttpRequest and uWS.HttpResponse objects:

index.js
```js
const { send } = require('@tonjs/ton')
/**
 * @type {import('@tonjs/ton').TonHandler}
 */
const handler = (req, res) => send(res, 200, 'TonJS')
module.exports = handler
```

index.ts
```ts
import { TonHandler, send } from '@tonjs/ton'

const single: TonHandler = (req, res) => send(res, 200, 'TonJS')
export default single

```

Ton provides useful helpers but also handles return values – so you can write it even shorter!
index.js
```js
/**
 * @type {import('@tonjs/ton').TonHandler}
 */
const handler = () => 'TonJS'
module.exports = handler
```

index.ts
```ts
import { TonHandler, send } from '@tonjs/ton'

const single: TonHandler = () => 'TonJS'
export default single

```

Next, add a start script and points to your code (which is inside index.js in this example case):

package.json (js)
```json
{
  "scripts": {
    "start": "ton"
  }
}
```

Important: If you use typescript, you should build before exec the bin.

package.json (ts)
```json
{
  "scripts": {
    "build": "tsc",
    "start": "ton"
  }
}
```

Once all of that is done, the server can be started like this:

```sh
npm start # yarn start
```

You will get log below - 🎉
```sh
[Try Love TonJS]
you raise me up, to listen on http://0.0.0.0:3000
```

## Contributing Guide

### Pull Request Guidelines

- Must Follow the [GitHub Flow](https://guides.github.com/introduction/flow/).

- Checkout a topic branch from a base branch, e.g. master, and merge back against that branch.

- If adding a new feature:

  - Add accompanying test case. Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:

  - If you are resolving a special issue, add (fix #xxxx[,#xxxx]) (#xxxx is the issue id) in your PR title for a better release log, e.g. update entities encoding/decoding (fix #3899).
  - Provide a detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable. You can check the coverage of your code addition by running yarn test --coverage.

- It's OK to have multiple small commits as you work on the PR - GitHub can automatically squash them before merging.

- Make sure tests pass!

- Commit messages must follow the [commit message convention](https://www.conventionalcommits.org/en/v1.0.0/) so that changelogs can be automatically generated. Commit messages are automatically validated before commit (by invoking Git Hooks via husky).

- No need to worry about code style as long as you have installed the dev dependencies - modified files are automatically formatted with ESLint and Prettier on commit (by invoking Git Hooks via husky).

- Beware of the git GUI, make sure the husky working fine before you commit.
  - Sourcetree app on macOS, must open via command line.
  ```sh
  open /Applications/Sourcetree.app
  # or
  stree folder-name
  ```

### Prior Knowledge

- lerna (monorepo)

  - https://github.com/lerna/lerna/blob/master/README.md
  - https://zhuanlan.zhihu.com/p/71385053

- yarn workspace
  - https://classic.yarnpkg.com/en/docs/workspaces
  - https://classic.yarnpkg.com/en/docs/cli/workspace
  - https://classic.yarnpkg.com/blog/2018/02/15/nohoist

### Common Scripts

**project**

```sh
# create the new project
yarn lerna create project-name
```

**package**

```sh
# install all packages
yarn install

# add the package in whole workspace (root)
yarn add package-name --ignore-workspace-root-check
# alternative: yarn add package-name -W

# add the package in special workspace
yarn workspace workspace-name add package-name

# add the package from another workspace
yarn workspace workspace-a add workspace-b@version
# example: yarn workspace @tonjs/bin add @tonjs/ton@0.0.0
```

**dev**

```sh
# build the packages first
yarn build

# dev any ts file
yarn dev file-name.ts
```

**format**

```sh
# format whole workspace (in root)
yarn format
```

**lint**

```sh
# lint the whole workspace (in root)
yarn lint --fix
```

**test**

```sh
# test the code
yarn test # --coverage --watchAll
```

**clean**

```sh
# clean the project
yarn clean
```

**build**

```sh
# build the any project in whole workspace (in root)
yarn build # or
# yarn workspaces run build
```

**release**

```sh
# tag a version
yarn lerna version --message "chore(release): publish" --create-release github

# publish
yarn lerna publish from-package
```
