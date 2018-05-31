# HTTP File Transmitter

### Summary 
HTTP File Transmitter is a file/data delivery system that allows a local directory to be monitored for new files. 
These files are then transmitted to a designated folder on the remote system for application consumption. 
The local system runs the `client_transmitter` and the remote system runs the `server_receiver`. After a sucessful transmission, 
files on the local system are deleted by the `client_transmitter`. 

### Assumptions 
While not strictly necesssary, it is assumed that once each file has been delivered to and processed on the remote system, 
that those files will eventually be deleted by the remote (consumer) application. Unlike the `client_transmitter`, the remote server (e.g.: `server_receiver`) does not discard files as it has no way of knowing if/when they have been processed.

### Configuration 
The path to the local directory, the frequency with which to poll, the destination URL to the `server_reciever` and other options are all configurable on the `client_transmitter` (see [client_transmitter/config.js](client_transmitter/config.js)). Likewise, the remote directory path, the server port number, and other options are configurable in the `server_receiver` 
(see [server_receiver/config.js](server_receiver/config.js)).
