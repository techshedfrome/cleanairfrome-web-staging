# Clean Air Frome - Website
Landing pages for our air quality monitoring project based in Frome, UK


## Repository Layout

### `/bulma`
We'll be using the Bulma CSS framework as the basis for styling - this uses SASS/SCASS, requiring a build/package step, so to keep that away from the published site, we'll be using `/bulma` to handle all out Bulma needs.

The basis for the Bulma build comes from [`bulma-start`](https://github.com/jgthms/bulma-start).

### `/docs`
We're initially hosting in Github pages, since we don't want publish the whole repo in the website, we'll be publishing the built site/content under Github Pages default way of publishing a subfolder - `/docs`