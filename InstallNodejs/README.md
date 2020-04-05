## How to install nodeJs in Ubuntu 

There is a website called `digitalocen` they have the easiest tutorial for installing `nodejs`. We can follow that website 
at the very beginning and can also follow their instruction for installing Nodejs.

[Digitalocean](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04)

For installing nodejs in ubuntu we need to open a terminal. Just press `Crlt + Alt + T` it will open a terminal
After that, we need to write some command into the terminal and nodejs will be installed automatically.

Here is the command given below:

1st command:

`sudo apt update`

2nd command: 

`sudo apt install nodejs`

3rd command:

`sudo apt install npm`

That's all the nodejs is now installed into our local machine

### Now if we want to install a specific version of nodejs

then we should follow some other commands. those commands are given below :

`curl -sL https://deb.nodesource.com/setup_10.x -o nodesource_setup.sh`

here i am installing the version (10.x) if anyone intend to install another version he/she should replace the version number

`nano nodesource_setup.sh`

after running this command into the terminal, it will open a file into the terminal. just press `Ctrl + X` . then run the commad below:

`sudo bash nodesource_setup.sh`

then 

`sudo apt install nodejs`

now check the version by writting

`nodejs -v`

You will see that the version we want to install is installed now. That's all happy coding !!


## For Windows

It is so easy to install nodejs in `Windows` operating system. Just visit the `https://nodejs.org/en/` this website
and after that donwload the LTS version from there. Finally install it to your local machine.
