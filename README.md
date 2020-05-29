# Clean Air Frome - Website
Landing pages for our air quality monitoring project based in Frome, UK


## Contributing

> TODO: write contribution guidlines

At a minimum, make changes on the `/develop` branch rather than directly onto `/master`, then use a pull request to make the changes live - makes it easier to track things.


## Repository Layout

### `/bulma`
We'll be using the Bulma CSS framework as the basis for styling - this uses SASS/SCASS, requiring a build/package step, so to keep that away from the published site, we'll be using `/bulma` to handle all out Bulma needs.

The basis for the Bulma build comes from [`bulma-start`](https://github.com/jgthms/bulma-start).

### `/docs`
We're initially hosting in Github pages, since we don't want publish the whole repo in the website, we'll be publishing the built site/content under Github Pages default way of publishing a subfolder - `/docs`

## Editing Styling

### `/bulma/_sass/main.scss`

We've got loads of customisation options via [Bulma's SASS variables](https://bulma.io/documentation/customize/variables/).

Set/change the variables in `/bulma/_sass/main.scss` then:
* open a terminal/console in the root directory of this repo
* change directory to the bulma folder using `cd bulma`
* type `npm install` in the console and press enter
  * this will pull in any dependencies needed for the build
* type `npm run deploy` in the console and press enter
  * this will build the styles and output the final CSS files to `/docs/css/`
    * by default it will aslo package up any javascript from `/bulma/_javascript/main.js` and output that to `/docs/lib/`