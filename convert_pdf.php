<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$error_code = 0;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (empty($_POST)){
        echo "Keine Seite ausgewählt!";
        $error_code = 1;
    }
    else {
        $error_code = convert_pdf();
    }

    ob_clean();
    $result = array();
    if ($error_code != 0){
        header('Content-Type: application/json');
        $result['error'] = $error_code;
        switch($error_code){
            case 1:
                $result['msg'] = "Es wurde keine Seite zum konvertieren ausgewaehlt!";
                break;
            case 2:
                $result['msg'] = "Die Datei ist zu groß!";
                break;
            case 3:
                $result['msg'] = "Die Datei ist kein PDF!";
                break;
            case 4:
                $result['msg'] = "Fehler beim Konvertieren!";
                break;
            default:
                $result['msg'] = "Ein unbekannter Fehler ist aufgetreten.";
        }
        header('HTTP/1.1 500 Internal Server Booboo');
        header('Content-Type: application/json; charset=UTF-8');
        die(json_encode($result));
    }
    else{
        header('Content-Type: application/json');
        print(json_encode($result));
    }
}

function convert_pdf(){
    $target_dir = "uploads/";
    $target_file = $target_dir . basename($_FILES["pdf"]["name"]);
    $imageFileType = strtolower(pathinfo($target_file,PATHINFO_EXTENSION));

    if (file_exists($target_file)) {
        echo "Sorry, file already exists.";
        // return 1;
    }
    // Check file size
    if ($_FILES["pdf"]["size"] > 50 * 1048576) {
        echo "Sorry, your file is too large.";
        return 2;
    }
    // Allow certain file formats
    if($imageFileType != "pdf") {
        echo "Sorry, only PDF files are allowed.";
        return 3;
    }


    if (move_uploaded_file($_FILES["pdf"]["tmp_name"], $target_file)) {
        echo "The file ". htmlspecialchars( basename( $_FILES["pdf"]["name"])). " has been uploaded.";
    } else {
        echo "Sorry, there was an error uploading your file.";
        return -1;
    }

    foreach (get_ranges(array_keys($_POST)) as $range){
        // Redirect to /var/log/ocr_convert.log but need to touch set permissions first!
        $out = shell_exec("cd uploads; ../ocr_convert_page.sh \"" . basename($_FILES['pdf']['name']) . "\" ${range[0]} ${range[1]} > /dev/null");
        if ($out != ""){
            echo "Error while converting!";
            return 4;
        }
    }
    return 0;
}

function get_ranges($A){
    $start = 0;
    $end = 0;
    $intervals = array();
    for ($i=0; $i < count($A); $i++){
        if ($i == count($A)-1){
            array_push($intervals, array($A[$start], $A[$end]));
            $start = $i+1;
            $end = $i+1;
        }
        else{
            if ($A[$i] + 1 == $A[$i+1])
            {
                $end = $i+1;
            }
            else{
                array_push($intervals, array($A[$start], $A[$end]));
                $start = $i+1;
                $end = $i+1;
            }
        }
    }

    return $intervals;
}
?>