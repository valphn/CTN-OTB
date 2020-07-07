> This is a modified version of the CTN that Chrrxs has made, this tutorial should work for his version aswell.

# Linux Installation
Requirements:
* Linux VPS running Ubuntu 26.04 with OTB already running
* [Filezilla](https://filezilla-project.org/download.php?type=client#close) to transfer your files to your VPS

## [Part 1] Installing [Node.js](https://nodejs.org/en/) with Apt Using a NodeSource PPA

First, we will install the PPA in order to get access to its packages. From your home directory, use curl to retrieve the installation script for your preferred version, making sure to replace 14.x with your preferred version string (Keep the same if you want to install the latest version).
```
cd ~
curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh
```

Inspect the contents of the downloaded script with nano (or your preferred text editor):
```
nano nodesource_setup.sh
```

When you are satisfied that the script is safe to run, exit your editor, then run the script with sudo:
```
sudo bash nodesource_setup.sh
```

The PPA will be added to your configuration and your local package cache will be updated automatically. You can now install the Node.js package:
```
sudo apt install nodejs
```

Verify that you’ve installed the new version by running node with the -v version flag:
```
node -v
```

Output:
```
v14.2.0
```


You also need to install Discord.js by using this command:
```
npm install discord.js
```

## [Part 2] How to Transfer Files using [Filezilla](https://filezilla-project.org/download.php?type=client#close)

The first thing to do is connecting to a server.
This is (fictional) login data based on Vultr - please use your own data instead if you want to actively follow the tutorial.

```
Hostname(ip): 80.118.83.33
Username: root
Password: 7PjU#.J3
Port: 22
```

We will use the quickconnect bar for establishing the connection:
![Image of Filezilla Quickconnect](https://i.imgur.com/NBBYRR5.png)

FileZilla will now try to connect to the server. If all works well, you will notice that the right "column" switched from Not connected to any server to displaying a list of files and directories. Find a folder called `bin3` and open it.

*Before you transfer your files into the bin3 folder, make sure you have the settings.ini configured properly.

Then, you can drag all the contents of the `CTN-OTB-master` into the `bin3` folder.

## [Part 3] Running CTN
Go back to your linux terminal and go to the `bin3` directory:
```
cd bin3
```
Before you run, make sure that OTB is running and working properly. Then do the following command:
```
node app.js
```
> This will take up the entire terminal, in order to exit you must do ctrl + c and run it again.
