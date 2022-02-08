<?php

error_reporting(E_ALL ^ E_NOTICE ^ E_DEPRECATED ^ E_STRICT);

require_once "Mail.php";

$product = $_POST['product'];
$name = $_POST['name'];
$mail = $_POST['mail'];
$phone = $_POST['phone'];
$message = $_POST['message'];

$host = "smtp.dreamhost.com";
$username = "contacto@svqtriana.com";
$password = "pssvqtriana2019";
$port = "587";
$to = "svqtriana@gmail.com";

$email_from = "contacto@svqtriana.com";
$email_subject = "[$product] solicitud de informacion";
$email_type = "HTML";
$email_body = "<h3>Nombre: </h3> <p>$name</p> <br> <h3>Mail: </h3> <p>$mail</p> <br><h3>Telefono: </h3> <p>$phone</p> <br><h3>Mensaje: </h3> <p>$message</p>";

$headers = array (
    'From' => $email_from, 
    'To' => $to, 
    'Subject' => $email_subject,     
    'MIME-Version' => 1,
    'Content-type' => 'text/html;charset=iso-8859-1');

$smtp = Mail::factory('smtp', 
	array ('host' => $host, 
		'port' => $port, 
		'auth' => true, 
		'username' => $username, 
		'password' => $password));

$mail = $smtp->send($to, $headers, $email_body);

if (PEAR::isError($mail)) {
    echo("<p>" . $mail->getMessage() . "</p>");
    } else {
    header('Location: gracias.html');
}

?>