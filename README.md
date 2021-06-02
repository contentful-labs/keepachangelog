Keep a Change Log
=================

❗ Disclaimer
=====

**This project is not actively maintained or monitored.** Feel free to fork and work on it in your account. If you want to maintain but also collaborate with fellow developers, feel free to reach out to [Contentful's Developer Relations](mailto:devrel-mkt@contentful.com) team to move the project into our community GitHub organisation [contentful-userland](https://github.com/contentful-userland/).

-----

Parse, modify, and create change logs in the
[“Keep a Changelog”][keepachangelog] format.

Usage
-----

~~~js
var changelog = require('keepachangelog')

changelog.read('CHANGELOG.md')
.then(function (cl) {
  var upcoming = cl.getRelease('upcoming');
  upcoming.Added.push('An amazing *new* feature');
  return cl;
}).then(function (cl) {
  cl.addUpcomingChange('This thing changed a bit');
  return cl;
}).then(function (cl) {
  return cl.write('CHANGELOG.md');
})
~~~

All asynchronous functions return [Bluebird][bluebird] promises.

### `changelog.parse(content)`

Return a `Changelog` instance which is a structured representation of
the `content` string. The content must be Markdown source following the
conventions of the [“Keep a Changelog”][keepachangelog] format.

### `changelog.read(path)`

Promise a `Changelog` instance by parsing the content of a file.

### `Changelog`

A `Changelog` instance is a structured representation of a Change Log
file. The following is an example of the properties a `Changelog` has.

~~~js
{
  prelude:  [Markdown JsonML],
  epilogue: [Markdown JsonML],
  releases: [
    {
      version: 'upcoming'
      Changed: ['A *markdown* string', 'Another markdown string'],
      Added: ['...'],
      Removed: ['...']
    }, {
      version: '1.0.0'
      Changed: ['...'],
    }
  ]
}
~~~

The `[Markdown JsonML]` values refer to objects that are returned by
the [Markdown parser][markdown-parser]

### `Changelog.build()`

Serialize the changelog structure into a markdown string.

### `Changelog.write(path)`

Write the Markdown string returned by `#build()` to a file and return a
promise.

### `Changelog.addUpcomingChange(desc)`

Add an item to the list of changes in the upcoming release. `desc` must
be a string. It is added verbatim to the rendered Change Log and might
therefore contain any valid Markdown.

### `Changelog.getRelease(version)`

Find an object in `Changelog.releases` with the matching version and
return a reference to it. Returns `null` if no matching release was
found.

[keepachangelog]: http://keepachangelog.com/
[bluebird]: https://github.com/petkaantonov/bluebird
[markdown-parser]: https://github.com/evilstreak/markdown-js
