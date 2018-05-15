# HTTP File Transmitter

HTTP File Transmitter allows a local directory of transient files to be monitored for new arrivals. 
New files on the local system are transmitted to a configurable directory on the remote system for remote processing. 
The local system runs the client_transmitter and the remote system runs the server_receiver. 
After successful transmission, files on the local system are deleted by the client_transmitter. 
It is assumed that after the remote files are transmitted and processed (on the remote system), 
that those files will also be deleted by some remote application (the server_receiver is not involved in any deletions). 
