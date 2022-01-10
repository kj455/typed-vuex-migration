# typed-vuex-migration

This repository contains a migration script for the [typed-vuex](https://github.com/danielroe/typed-vuex) from 'vuex3'

This script defines 'getterTree', 'mutationTree', and 'actionTree' containing all the existing properties in the script.
## Usage
Run script below to migrate your vuex2 script to typed-vuex with target file paths. (e.g. `store/**/*.js`)

```sh
npx jscodeshift -t https://raw.githubusercontent.com/kj455/typed-vuex-migration/main/index.ts store/**/*.js
```