# HTTP File Transmitter

HTTP File Transmitter allows a local directory to be monitored, transmitting it&#39;s files to a folder on a remote system for application consumption. The local system runs the client_transmitter and the remote system runs the server_receiver. After transmission, files on the local system are deleted by the client_transmitter. It is assumed that after the remote files are processed by the consumer application (on the remote system), that those files will also be deleted. 
