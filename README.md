
CP sfdc_users from unified prod -> ascension-test
ssh root@unified.gsslab.rdu2.redhat.com "mongoexport --db unified-cache --collection sfdc_users --out /tmp/sfdc_users.json"; scp root@unified.gsslab.rdu2.redhat.com:/tmp/sfdc_users.json /tmp; mongo ascension-test --eval "db.sfdc_users.remove({})"; mongoimport --db ascension-test --collection sfdc_users --file /tmp/sfdc_users.json;

CP sfdc_users from unified prod -> ascension-test
ssh root@unified.gsslab.rdu2.redhat.com "mongoexport --db unified-cache --collection sfdc_users --out /tmp/sfdc_users.json"; scp root@unified.gsslab.rdu2.redhat.com:/tmp/sfdc_users.json /tmp; mongo ascension --eval "db.sfdc_users.remove({})"; mongoimport --db ascension --collection sfdc_users --file /tmp/sfdc_users.json;
