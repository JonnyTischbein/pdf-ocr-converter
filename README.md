# PDF OCR converter

The goal is to easily convert PDFs with text, which were converted to image, to markable text again using OCR. For easy usage a PDF preview is generated with PDFJS and than converted via PHP and a bash script.

## Dependencies
- Bootstrap
- JQuery
- `qpdf`
- `pdfsandwich`
- `pdfjam` (included in `texlive-extra-utils`)
- bash environment
- `php` >= 7.3 (and some webserver)
- PDFJS

For Debian / Ubuntu you could use:

```
$ sudo apt install qpdf pdfsandwich texlive-extra-utils
```

For installing Bootstrap and/or JQuery use the CDN: https://www.bootstrapcdn.com/

For PDFJS use the project site: https://mozilla.github.io/pdf.js/getting_started/#download

## Installation

1. Install all dependencies
2. Clone this repo into your webserver's directory and setup the php handler up
3. Open your browser and enter the URL according to your configuration.

## Configuration
- You need to enable PHP upload in your `php.ini`
- You might need to increase the upload limit, `post_body` and `memory_limit` in your `php.ini` AND your webserver configuration
- The php conversion script is limited to `50MB` and only accepts `*.pdf` files.
- You may need to add `<policy domain="coder" rights="read | write" pattern="PDF" />` to your `/etc/ImageMagick-6/policy.xml`