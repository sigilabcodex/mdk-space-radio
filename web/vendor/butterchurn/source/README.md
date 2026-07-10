Butterchurn preset source package
=================================

This directory keeps the vetted upstream package used to curate the local
MDK Space Radio extra presets:

- Package: `butterchurn-presets@2.4.7`
- License: MIT
- Homepage: https://butterchurnviz.com
- Local archive: `butterchurn-presets-2.4.7.tgz`

The radio does not load this archive at runtime. Runtime loading uses the small
curated subset in `../mdk-extra-presets.js`.

To inspect or extract more presets later:

```sh
mkdir -p /tmp/mdk-butterchurn-presets
tar -xzf web/vendor/butterchurn/source/butterchurn-presets-2.4.7.tgz -C /tmp/mdk-butterchurn-presets
find /tmp/mdk-butterchurn-presets/package/presets/converted -name '*.json'
```
