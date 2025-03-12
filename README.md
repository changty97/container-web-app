# container-web-app

Simple web app that allows a user to submit a favorite Quote.

See Live Site: [18.144.151.165](http://18.144.151.165)
- login with test account or create your own!
- username: test
- password: test

This was deployed to AWS EC2 instance running in a container using the `docker-compose up -d` command.

Hosted on nginx Web Server.

Following Techonologies:
- NodeJS
- ExpressJS
- MySQL

Uses CRUD operations to an RDS MySQL instance:
- Create: Submitting a Quote
- Read: Fetching latest Quote
- Update: Editing an existing Quote
- Delete: Removing an existing Quote

Other:
- Can create an account.

Infrastructure:
- Deployed to an AWS EC2 instance: [18.144.151.165](http://18.144.151.165)
- Public DNS: ec2-18-144-151-165.us-west-1.compute.amazonaws.com
- HTTPS not supported yet
