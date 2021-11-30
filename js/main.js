var _PDF_DOC,
_CANVAS = document.querySelector('.pdf-preview'),
_OBJECT_URL;

function showPDF(pdf_url) {
PDFJS.getDocument({ url: pdf_url }).then(function(pdf_doc) {
    _PDF_DOC = pdf_doc;

    var parent = document.getElementById("pdf-preview-wrapper");
    parent.innerHTML = "";
    for (let i = 1; i <= pdf_doc.numPages; i++)
    {
        var wrapper = document.createElement("div");
        wrapper.id = "pdf-page-wrapper-" + i;
        wrapper.className = "pdf-page-wrapper";
        wrapper.onclick = function () {
            document.getElementById("select-pdf-page-" + i).click();
        };

        var canvas = document.createElement("canvas");
        canvas.id = "pdf-preview-" + i;
        canvas.className = "pdf-preview";
        canvas.width = 150;

        var newline = document.createElement("br");

        var selector = document.createElement("p");
        selector.className = "pdf-select-text";

        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "select-pdf-page-" + i;
        checkbox.name = i;
        checkbox.value = i;

        var pagenumberspan = document.createElement("span");
        pagenumberspan.id = "pdf-preview-page-number-" + i;

        var pagenumber = document.createTextNode("Seite " + i);

        pagenumberspan.append(pagenumber);
        selector.append(checkbox);
        selector.append(pagenumberspan);
        wrapper.append(canvas);
        wrapper.append(selector);
        parent.append(wrapper);


        // console.log("creating HTML for Page: " + i);
        showPage(i);
    }

    // destroy previous object url
    URL.revokeObjectURL(_OBJECT_URL);
}).catch(function(error) {
    // trigger Cancel on error
    document.querySelector("#cancel-pdf").click();

    // error reason
    alert(error.message);
});;
}

function showPage(page_no) {
// fetch the page
_PDF_DOC.getPage(page_no).then(function(page) {
    _CANVAS = document.getElementById('pdf-preview-' + page_no);
    // set the scale of viewport
    var scale_required = _CANVAS.width / page.getViewport(1).width;

    // get viewport of the page at required scale
    var viewport = page.getViewport(scale_required);

    // set canvas height
    _CANVAS.height = viewport.height;

    var renderContext = {
        canvasContext: _CANVAS.getContext('2d'),
        viewport: viewport
    };

    // render the page contents in the canvas
    page.render(renderContext).then(function() {
        document.querySelector("#pdf-preview-wrapper").style.display = 'grid';
    });
});
}

/* Show Select File dialog */
document.querySelector("#upload-dialog").addEventListener('click', function() {
document.querySelector("#pdf-file").click();
});

/* Selected File has changed */
document.querySelector("#pdf-file").addEventListener('change', function() {
// Show the PDF preview loader
document.querySelector("#pdf-loader").style.display = 'block';
// user selected file
var file = this.files[0];

// allowed MIME types
var mime_types = [ 'application/pdf' ];

// Validate whether PDF
if(mime_types.indexOf(file.type) == -1) {
    alert('Error : Incorrect file type');
    return;
}

// validate file size
if(file.size > 10*1024*1024) {
    alert('Error : Exceeded size 10MB');
    return;
}

// validation is successful
document.querySelector("#pdf-preview-headline").style.display = 'block';

// hide upload dialog button
document.querySelector("#upload-dialog").style.display = 'none';

// set name of the file
document.querySelector("#pdf-name").innerText = file.name;
document.querySelector("#pdf-name").style.display = 'inline-block';


// object url of PDF
_OBJECT_URL = URL.createObjectURL(file)

// send the object url of the pdf to the PDF preview function
showPDF(_OBJECT_URL);

// show cancel and upload buttons now
document.querySelector("#cancel-pdf").style.display = 'inline-block';
document.querySelector("#upload-button").style.display = 'inline-block';
document.querySelector("#pdf-loader").style.display = 'none';
});

/* Reset file input */
document.querySelector("#cancel-pdf").addEventListener('click', function() {
// show upload dialog button
document.querySelector("#upload-dialog").style.display = 'inline-block';

// reset to no selection
document.querySelector("#pdf-file").value = '';

// hide elements that are not required
document.querySelector("#pdf-name").style.display = 'none';
document.querySelector("#pdf-preview-wrapper").style.display = 'none';
document.querySelector("#pdf-preview-wrapper").innerHTML = "";
document.querySelector("#pdf-preview-headline").style.display = 'none';
document.querySelector("#pdf-loader").style.display = 'none';
document.querySelector("#cancel-pdf").style.display = 'none';
document.querySelector("#upload-button").style.display = 'none';
document.querySelector("#download-pdf").style.display = 'none';
});

/* Upload file to server */
document.querySelector("#upload-button").addEventListener('click', function(e) {
e.preventDefault();
document.querySelector("#upload-button").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> <span class="sr-only">Konvertiere...</span>';

// AJAX request to server
var formData = new FormData();
var test = $("input[type=checkbox]:checked").each(function(){
    formData.append(this.value, this.value);
});
formData.append('pdf', $('input[type=file]')[0].files[0]);


document.querySelector("#alert-text").innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> <span class="sr-only">Lade...</span>';
document.querySelector("#pdf-loader").style.display = 'block';

document.querySelector("#upload-button").value = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> <span class="sr-only">Konvertiere...</span>'

$.ajax({
    url: "convert_pdf.php",
    type: "POST",
    data: formData,
    processData: false,
    contentType: false,
    jsonpCallback: 'jsonCallback',
    success: function (data, status) {
        console.log("successfully uploaded!");
        var res_json = data;
        document.querySelector("#alert-text").innerHTML = 'Erfolgreich konvertiert! <button type="button" class="btn-close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
        document.querySelector("#upload-button").style.display = 'none';
        document.querySelector("#download-pdf").style.display = 'inline-block';
        $('input[type=checkbox]').hide();
    },
    error: function (request, status, error) {
        console.log("error while uploading or converting");
        var res_json = request.responseJSON;
        $("#upload-button").prop('value', 'Konvertieren');
        document.querySelector("#alert-text").innerHTML = 'Error ' + res_json.error + ': ' + res_json.msg + '<button type="button" class="btn-close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>';
        document.querySelector("#pdf-loader").style.display = 'block';
    },
    complete: function(){
        document.querySelector("#upload-button").innerHTML = 'Konvertieren';
    }
});
});

document.querySelector("#download-pdf").addEventListener('click', function(e) {
e.preventDefault();
window.location.href = 'download_pdf.php?pdf=' + $('input[type=file]')[0].files[0]["name"];
});
