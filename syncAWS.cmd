aws s3 sync . s3://sandystransfer/herbdb --exclude "*.git/*" --exclude syncAws.cmd --acl public-read
