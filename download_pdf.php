<?php

if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $target_file = "uploads/" . $_GET["pdf"];

    if(file_exists($target_file)) {
        header('Content-Description: File Transfer');
        header('Content-Type: application/octet-stream');
        header('Content-Disposition: attachment; filename="fixed_'.basename($target_file).'"');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . filesize($target_file));

        ob_clean();
        readfile($target_file);

        unlink($target_file);
        unlink($target_file . ".orig");
        //Terminate from the script
        exit;
    }
    else{
        echo "File does not exist.";
    }
}

?>