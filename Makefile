run:
	npm start
pm2-start:
	pm2 start process.json --watch --env development
pm2-monit:
	pm2 monit
pm2-stop:
	pm2 stop etn_spacepools_org_bot