#!/usr/bin/env sh

# 當發生錯誤時中止腳本
set -e

# 構建
npm run docs:dev

# cd 到構建輸出的目錄下
cd docs

# 部署到自定義域域名
# echo 'tonjs.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 部署到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 部署到 https://<USERNAME>.github.io/<REPO>
git push -f git@github.com:AllJointTW/TonJS.git master:feature/vuepress

cd -