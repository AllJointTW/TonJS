#!/usr/bin/env sh

# exit immediately if a command exits with a non-zero status
set -e

# build the docs
yarn docs:build

# cd to the output
cd docs/.vuepress/dist

# setup the cname
echo 'tonjs.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# deploy to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# deploy to https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:AllJointTW/TonJS.git master:gh-pages

cd -