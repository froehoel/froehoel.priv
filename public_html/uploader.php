<?php
$allowed = [
  'image/jpeg',
  'image/pjpeg',
  'image/gif',
  'image/png',
  'application/msword',
  'application/vnd.ms-excel',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'audio/mpeg',
  'application/force-download',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/octet-stream',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

if(is_uploaded_file($_FILES['file']['tmp_name']))
{
  if( ! file_exists('fileupload'))
    mkdir('fileupload');

    $mime = mime_content_type($_FILES['file']['tmp_name']);
    $docname = $_FILES['file']['name'];
    $filename = md5( date('Y-m-d H:i:s') . pathinfo($docname, PATHINFO_FILENAME) ) . '.' . strtolower(pathinfo($docname, PATHINFO_EXTENSION));
    if(in_array($mime, $allowed)) {
      move_uploaded_file($_FILES['file']['tmp_name'], 'fileupload/' . $filename);
      echo json_encode(['id' => rand(), 'filename' => $filename, 'docname' => $docname]);
    }
    else
    {
      unlink($_FILES['file']['tmp_name']);
      echo json_encode(['error' => 'mime not allowed']);
    }
}
