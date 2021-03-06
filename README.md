# Clean Air Frome - Website
Landing pages for our air quality monitoring project based in Frome, UK


## Contributing

> TODO: write contribution guidlines

Since we're using GitHub Pages for staging, `master` has to be the WIP branch in order to get anything built for staging.

A GitHub action is set up to auto deploy to live once a pull request is completed from `master` into the `deploy` branch.


## Repository Layout

### `/bulma`
We'll be using the Bulma CSS framework as the basis for styling - this uses SASS/SCASS, requiring a build/package step, so to keep that away from the published site, we'll be using `/bulma` to handle all out Bulma needs.

The basis for the Bulma build comes from [`bulma-start`](https://github.com/jgthms/bulma-start).

### `/docs`
We're initially hosting in Github pages, since we don't want publish the whole repo in the website, we'll be publishing the built site/content under Github Pages default way of publishing a subfolder - `/docs`


## Editing Styling

### `/bulma/_sass/main.scss`

We've got loads of customisation options via [Bulma's SASS variables](https://bulma.io/documentation/customize/variables/).

Set/change the variables in `/bulma/_sass/main.scss` then (assumes an up to date/working nodeJS/npm installation):
* open a terminal/console in the root directory of this repo
* change directory to the bulma folder using `cd bulma`
* type `npm install` in the console and press enter
  * this will pull in any dependencies needed for the build
* type `npm run deploy` in the console and press enter
  * this will build the styles and output the final CSS files to `/docs/css/`
    * by default it will aslo package up any javascript from `/bulma/_javascript/main.js` and output that to `/docs/lib/`
* There's also an NPM script set up for live previews of changes to the SASS/JS files in the Bulma directory:
  * `npm start`
  * this watches for any changes to files and automatically updates/refreshes the preview (e.g. when using HTML preview via VSCode extension [Preview on Web Server](https://marketplace.visualstudio.com/items?itemName=yuichinukiyama.vscode-preview-server)) 