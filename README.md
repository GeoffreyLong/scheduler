scheduler
=========
### SetUp
```Bash
#Clone the repository
git clone https://github.com/GeoffreyLong/scheduler.git

#Install MongoDB
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
sudo apt-get update
sudo apt-get install mongodb-10gen

#Install Node
apt-get install curl
curl -sL https://deb.nodesource.com/setup | bash -
sudo apt-get install -y nodejs

#Make /data/db folder where the db will be stored
sudo mkdir -p /data/db

#Start mongo instance
sudo mongod

#cd into scheduler folder
cd scheduler

#Launch Express app on localhost:3000 with debugging
DEBUG=scheduler node ./bin/www
```

<p> 
  This is essentially a Productivity app.
  Scheduler is something of a misnomer and should probably be changed 
</p>
<p>
  This application, in its current iteration is simply a tasker.
  In the future I hope to incorporate the following:
</p>
<ul>
  <li> Calendar consisting of day, week, and month breakdowns </li>
  <li> Activity tracker: to see how my time is spent </li>
  <li> Activity optimizer: to analyze trends from the tracker to optimize my day to day productivity </li>
  <li> Planner: to plan out my day according to optimizations proposed from the optimizer </li>
  <li> Project organizer: to provide a location in which to store the various projects I may be working on </li>
  <li> And many more small features to come </li>
</ul>

Some Definitions:
<ul>
  <li> Task: An event which doesn't have a set start and end time </li>
  <li> Event: has a set start and end time </li>
  <li> Activity: A superset of tasks and events, these are categories like fitness, school, etc where smaller tasks such as Evolutionary Computation assignment one may fall under.  There is no set criteria for these.  For now they will be bottom levels of Tags.  </li>
  <li> Instance: For activity tracking, this is simply a name and a date created.  An example would be something like "had a cup of coffee" from there you could analyze how that affected your productivity.  I want to apply statistical machine learning at some point to analyze trends, fields such as these could prove useful. </li>
</ul>

<p>
  Generally, this is an application that I am trying to tailor towards my everyday life in order to increase my productivity.  I wouldn't expect anyone to check out this repository, however, if you do and you have some suggestions, or if you want to contribute, please feel free to do so.  This is my first major (relative to what I usually do) webapp undertaken alone, so any suggestions are welcome.
</p>
