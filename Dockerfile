FROM centos

# Enable Extra Packages for Enterprise Linux (EPEL) for CentOS
RUN     sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*;
RUN     yum install -y epel-release
RUN     yum -y update
RUN     yum -y install nginx
CMD     ["nginx", "-g", "daemon off;"]

COPY    ./conf/default.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

RUN     yum install -y nodejs npm

COPY    package.json ./
RUN     npm install --production

# Bundle app source
COPY    ./dist .

EXPOSE  8080


