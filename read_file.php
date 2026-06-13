<?php

function readBinaryArray(string $filename): array
{
    $fp = fopen($filename, "rb");
    $count = unpack("P", fread($fp, 8))[1];
    $data = fread($fp, $count * 8);
    fclose($fp);
    return array_values(unpack("e$count", $data));
}

?>