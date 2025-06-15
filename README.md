# Configgen: NYC Mesh Configuration Generator

Configgen helps users configure their wireless devices to connect to NYC Mesh. It loads configuration templates from our [nycmeshnet/nycmesh-configs](https://github.com/nycmeshnet/nycmesh-configs) repo using Github's API and allows users to customize certain fields.

It is a React app which we currently host at Netlify.

### Development

Ensure that you start the app in a docker container with Node.js 16 such as `node:16.20.2-bookworm-slim`.

    docker run --rm -it --entrypoint /bin/bash -v `pwd`:/nycmesh-configgen node:16.20.2-bookworm-slim
    cd /nycmesh-configgen
    yarn install
    yarn start

This runs the app in development mode and opens a Chrome browser.

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.

You will also see any lint errors in the console.
