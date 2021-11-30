#!/bin/bash

if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
    echo "Usage: $0 [input-file] [from-page] [to-page]"
    exit 1
fi

if [ ! -f "$1" ]; then
    echo "ERROR: Could not found file $1"
    exit 1
fi

RANGE_START=$2
RANGE_END=$3
PAGE_NUMBER=$(qpdf --no-warn --show-npages "$1" 2> /dev/null)
NAME=$(echo $1 | sed 's/.pdf$//')
FIRST_PDF="front_part.pdf"
TAIL_PDF="tail_part.pdf"
CROPPED_PDF="croppend_part.pdf"
CONVERT_PDF="cropped_part_ocr.pdf"
BACKUP_PDF="${NAME}.pdf.orig"
OUTPUT_PDF="${NAME}.pdf"

IS_FIRST_PDF=0
IS_TAIL_PDF=0

cp "$1" "$BACKUP_PDF"
echo "Extracting page from $NAME..."
qpdf "$1" --pages . $RANGE_START-$RANGE_END -- "$PWD/$CROPPED_PDF"
if [ ! -f "$PWD/$CROPPED_PDF" ]; then
    echo "ERROR: while extracting page to convert"
    exit 1
fi

if [[ $RANGE_START -gt 1 ]]; then
    qpdf "$1" --pages . 1-$((RANGE_START-1)) -- "$PWD/$FIRST_PDF"

    if [ ! -f "$PWD/$FIRST_PDF" ]; then
        echo "ERROR: while extracting trailinig PDF pages"
        exit 1
    fi
    IS_FIRST_PDF=1
fi

if [[ ! $RANGE_END -eq $PAGE_NUMBER ]]; then
    qpdf "$1" --pages . $((RANGE_END+1))-z -- "$PWD/$TAIL_PDF"
    if [ ! -f "$PWD/$TAIL_PDF" ]; then
        echo "ERROR: while extracting tailinig PDF pages"
        exit 1
    fi
    IS_TAIL_PDF=1
fi

echo "Converting page with OCR.."
pdfsandwich "$PWD/$CROPPED_PDF" -o "$PWD/$CONVERT_PDF" > /dev/null

if [ ! -f "$PWD/$CONVERT_PDF" ]; then
    echo "ERROR: while converting pages"
    exit 1
fi

if [[ "$IS_TAIL_PDF" -eq 0 ]]; then
    pdfjam -q "$PWD/$FIRST_PDF" "$PWD/$CONVERT_PDF" -o "$PWD/$OUTPUT_PDF"
else
    if [[ "$IS_FIRST_PDF" -eq 0 ]]; then
        pdfjam -q "$PWD/$CONVERT_PDF" "$PWD/$TAIL_PDF" -o "$PWD/$OUTPUT_PDF"
    else
        pdfjam -q "$PWD/$FIRST_PDF" "$PWD/$CONVERT_PDF" "$PWD/$TAIL_PDF" -o "$PWD/$OUTPUT_PDF"

    fi
fi

if [ ! -f "$PWD/$OUTPUT_PDF" ]; then
        echo "ERROR: while merging all pages"
        exit 1
fi
echo "SUCCESS: process PDF to $OUTPUT_PDF"
rm -f $PWD/$FIRST_PDF
rm -f $PWD/$TAIL_PDF
rm -f $PWD/$CROPPED_PDF
rm -f $PWD/$CONVERT_PDF
exit 0
