## Ascension

Ascension is a task based abstraction on top of Salesforce cases for prioritizing case workflow.

## Development

	npm install
	bower install
	grunt dev # in one tmux pane
	grunt devui # in another tmux pane

Requirements for developing

### Install nginx and add the following:

Add to the main configuration:

    upstream access {
        server access.redhat.com:443 max_fails=0 fail_timeout=10s;
    }

    upstream nodes {
    	server 127.0.0.1:3000;
    }


Add to the 443 configuration:

	# Define the specific node endpoints, the finall fallback will be the
	location ~ ^/(webpack-dev-server.js|socket.io|assets\/main.js|assets\/).*?$ {
		proxy_pass_header Server;
		proxy_set_header Host $http_host;
		proxy_redirect off;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Scheme $scheme;
		proxy_pass http://webpack;
      	# Allow websockets proxying
      	proxy_http_version 1.1;
      	proxy_set_header Upgrade $http_upgrade;
      	proxy_set_header Connection "upgrade";
	}


    location ~ ^/(chrome_themes|webassets|services|click|suggest)/.*$ {
      	#rewrite ^ https://access.redhat.com$request_uri permanent;
		proxy_pass_header Server;
		proxy_set_header Host "access.redhat.com";
		proxy_pass https://access;
    }

	location / {
		proxy_pass_header Server;
		proxy_set_header Host $http_host;
		proxy_redirect off;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Scheme $scheme;
        proxy_pass http://nodes;
      	proxy_http_version 1.1;
      	proxy_set_header Upgrade $http_upgrade;
      	proxy_set_header Connection "upgrade";
    }
